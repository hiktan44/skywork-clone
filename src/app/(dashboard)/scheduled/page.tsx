'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Clock, Calendar } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ProjectType } from '@/lib/types';
import { useT } from '@/lib/i18n';
import { authClient } from '@/lib/auth-client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewTask {
  name: string;
  cron: string;
  module: ProjectType;
  prompt: string;
}

interface Task {
  id: string;
  name: string;
  cron: string;
  module: ProjectType;
  prompt: string;
  active: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

const TASK_TEMPLATES: { key: string; cron: string; module: ProjectType }[] = [
  { key: 'weeklyReport', cron: '0 9 * * 1', module: ProjectType.DOCUMENT },
  { key: 'budget', cron: '0 10 1 * *', module: ProjectType.SHEET },
  { key: 'social', cron: '0 8 * * *', module: ProjectType.IMAGE },
  { key: 'newsletter', cron: '0 14 * * 5', module: ProjectType.DOCUMENT },
  { key: 'salesDeck', cron: '0 9 1 */3 *', module: ProjectType.SLIDES },
];

const MODULES = [
  ProjectType.SLIDES,
  ProjectType.DOCUMENT,
  ProjectType.IMAGE,
  ProjectType.SHEET,
  ProjectType.WEBSITE,
  ProjectType.VIDEO,
];

export default function ScheduledTasksPage() {
  const { sidebarOpen, rightPanelOpen, setRightPanelOpen } = useUIStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    name: '',
    cron: '',
    module: ProjectType.DOCUMENT,
    prompt: '',
  });
  const t = useT();

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reload the user's tasks whenever the signed-in user changes.
  const userId = session?.user?.id;
  useEffect(() => {
    if (sessionPending) return;
    let cancelled = false;
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch('/api/tasks', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setSignedIn(Boolean(data.signedIn));
      } catch (e) {
        console.error('Failed to fetch tasks:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, [userId, sessionPending]);

  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const moduleItems = MODULES.map((m) => ({ value: m, label: t(`modules.${m}`) }));

  /** POSTs a task; returns true when it was saved. */
  const createTask = async (input: NewTask): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) setRightPanelOpen(true);
        setError(data.error === 'invalid_cron' ? t('tasks.invalidCron') : t('tasks.saveError'));
        return false;
      }
      setTasks((prev) => [data.task as Task, ...prev]);
      return true;
    } catch {
      setError(t('tasks.saveError'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.cron || !newTask.prompt) return;
    if (await createTask(newTask)) {
      setIsDialogOpen(false);
      setNewTask({ name: '', cron: '', module: ProjectType.DOCUMENT, prompt: '' });
    }
  };

  const addTemplate = async (template: (typeof TASK_TEMPLATES)[number]) => {
    if (!signedIn) {
      setRightPanelOpen(true);
      return;
    }
    await createTask({
      name: t(`taskTemplates.${template.key}Name`),
      prompt: t(`taskTemplates.${template.key}Prompt`),
      cron: template.cron,
      module: template.module,
    });
  };

  const toggleTaskActive = async (id: string) => {
    const task = tasks.find((x) => x.id === id);
    if (!task) return;
    setError(null);
    const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !task.active }),
    }).catch(() => null);
    if (!res?.ok) {
      setError(t('tasks.saveError'));
      return;
    }
    const data = await res.json();
    setTasks((prev) => prev.map((x) => (x.id === id ? (data.task as Task) : x)));
  };

  const deleteTask = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      setError(t('tasks.saveError'));
      return;
    }
    setTasks((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className={cn(
          'flex-1 overflow-y-auto transition-all duration-200',
          sidebarOpen ? 'ml-[220px]' : 'ml-[44px]',
          rightPanelOpen ? 'lg:mr-[360px]' : 'mr-0'
        )}>
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tasks.title')}</h1>
                <p className="text-gray-600">{t('tasks.description')}</p>
              </div>
              <Button
                onClick={() => (signedIn ? setIsDialogOpen(true) : setRightPanelOpen(true))}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('tasks.new')}
              </Button>
            </div>

            {!loading && (
              <p role="status" className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {signedIn ? t('tasks.runNote') : t('tasks.signInRequired')}
              </p>
            )}
            {error && !isDialogOpen && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-gray-500">{t('dashboard.loading')}</p>
            ) : tasks.length === 0 ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('tasks.templatesTitle')}</h2>
                  <p className="text-sm text-gray-500">
                    {signedIn ? t('tasks.empty') + ' ' : ''}
                    {t('tasks.templatesHint')}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TASK_TEMPLATES.map((template) => (
                    <Card key={template.key} className="flex flex-col gap-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{t(`taskTemplates.${template.key}Name`)}</h3>
                        <Badge variant="secondary">{t(`modules.${template.module}`)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{t(`taskTemplates.${template.key}Prompt`)}</p>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{template.cron}</code>
                        <Button size="sm" className="gap-1" disabled={saving} onClick={() => addTemplate(template)}>
                          <Plus className="h-3 w-3" />
                          {t('tasks.addTemplate')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                          <Badge variant={task.active ? 'default' : 'secondary'}>
                            {task.active ? t('tasks.active') : t('tasks.passive')}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{t('tasks.cron')}: {task.cron}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{t('tasks.module')}: {t(`modules.${task.module}`)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{t('tasks.prompt')}: {task.prompt}</span>
                          </div>
                          {task.nextRun && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{t('tasks.nextRun')}: {new Date(task.nextRun).toLocaleString('tr-TR')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleTaskActive(task.id)}
                        >
                          {task.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={t('tasks.delete')}
                          onClick={() => setPendingDelete(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <RightPanel />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tasks.newTaskTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('tasks.taskName')}</Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder={t('tasks.placeholderName')}
              />
            </div>
            <div>
              <Label htmlFor="cron">{t('tasks.cronExpression')}</Label>
              <Input
                id="cron"
                value={newTask.cron}
                onChange={(e) => setNewTask({ ...newTask, cron: e.target.value })}
                placeholder={t('tasks.placeholderCron')}
              />
            </div>
            <div>
              <Label htmlFor="module">{t('tasks.module')}</Label>
              <Select items={moduleItems} value={newTask.module} onValueChange={(value) => setNewTask({ ...newTask, module: value as ProjectType })}>
                <SelectTrigger id="module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectType.SLIDES}>{t('modules.SLIDES')}</SelectItem>
                  <SelectItem value={ProjectType.DOCUMENT}>{t('modules.DOCUMENT')}</SelectItem>
                  <SelectItem value={ProjectType.IMAGE}>{t('modules.IMAGE')}</SelectItem>
                  <SelectItem value={ProjectType.SHEET}>{t('modules.SHEET')}</SelectItem>
                  <SelectItem value={ProjectType.WEBSITE}>{t('modules.WEBSITE')}</SelectItem>
                  <SelectItem value={ProjectType.VIDEO}>{t('modules.VIDEO')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prompt">{t('tasks.prompt')}</Label>
              <Input
                id="prompt"
                value={newTask.prompt}
                onChange={(e) => setNewTask({ ...newTask, prompt: e.target.value })}
                placeholder={t('tasks.taskDescription')}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('tasks.cancel')}</Button>
            <Button onClick={handleCreateTask} disabled={saving}>{t('tasks.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tasks.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t('tasks.deleteDescription', { name: pendingDelete?.name ?? '' })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>{t('tasks.cancel')}</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (pendingDelete) await deleteTask(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {t('tasks.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}