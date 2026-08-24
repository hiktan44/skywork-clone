'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Clock, Calendar } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ProjectType } from '@/lib/types';
import { useT } from '@/lib/i18n';
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

export default function ScheduledTasksPage() {
  const { sidebarOpen, rightPanelOpen } = useUIStore();
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

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
        }
      } catch (e) {
        console.error('Failed to fetch tasks:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const handleCreateTask = () => {
    if (!newTask.name || !newTask.cron || !newTask.prompt) return;

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      active: true,
      lastRun: null,
      nextRun: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setIsDialogOpen(false);
    setNewTask({ name: '', cron: '', module: ProjectType.DOCUMENT, prompt: '' });
  };

  const toggleTaskActive = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, active: !task.active } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className={cn(
          'flex-1 overflow-y-auto transition-all duration-200',
          sidebarOpen ? 'ml-[220px]' : 'ml-[44px]',
          rightPanelOpen ? 'mr-[360px]' : 'mr-0'
        )}>
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tasks.title')}</h1>
                <p className="text-gray-600">{t('tasks.description')}</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('tasks.new')}
              </Button>
            </div>

            {loading ? (
              <p className="text-gray-500">{t('dashboard.loading')}</p>
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
                            <span>{t('tasks.module')}: {task.module}</span>
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
                          onClick={() => deleteTask(task.id)}
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
              <Select value={newTask.module} onValueChange={(value) => setNewTask({ ...newTask, module: value as ProjectType })}>
                <SelectTrigger id="module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectType.SLIDES}>{t('quickActions.slides')}</SelectItem>
                  <SelectItem value={ProjectType.DOCUMENT}>{t('quickActions.documents')}</SelectItem>
                  <SelectItem value={ProjectType.IMAGE}>{t('quickActions.images')}</SelectItem>
                  <SelectItem value={ProjectType.SHEET}>{t('quickActions.sheets')}</SelectItem>
                  <SelectItem value={ProjectType.WEBSITE}>{t('quickActions.websites')}</SelectItem>
                  <SelectItem value={ProjectType.VIDEO}>{t('quickActions.videos')}</SelectItem>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('tasks.cancel')}</Button>
            <Button onClick={handleCreateTask}>{t('tasks.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}