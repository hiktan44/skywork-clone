'use client';

import { useRouter } from 'next/navigation';
import { isGenerationModule } from '@/lib/generation/schemas';

import { useEffect, useState } from 'react';
import { Sparkles, Tag } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ProjectType } from '@/lib/types';
import { useT } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const moduleColors: Record<ProjectType, string> = {
  [ProjectType.SLIDES]: 'bg-red-500',
  [ProjectType.DOCUMENT]: 'bg-blue-500',
  [ProjectType.IMAGE]: 'bg-amber-500',
  [ProjectType.SHEET]: 'bg-green-500',
  [ProjectType.WEBSITE]: 'bg-violet-500',
  [ProjectType.VIDEO]: 'bg-pink-500',
};

interface Skill {
  id: string;
  name: string;
  description: string;
  module: string;
  tags?: string[];
  defaultParams?: { examplePrompt?: unknown } | null;
}

export default function SkillsPage() {
  const { sidebarOpen, rightPanelOpen, setChatDraft, setSelectedModule } = useUIStore();
  const router = useRouter();

  // Prefill the home chat with the skill's example prompt (or its name as a starter).
  const applySkill = (skill: Skill) => {
    const example = skill.defaultParams?.examplePrompt;
    setChatDraft(typeof example === 'string' && example ? example : `${skill.name}: `);
    // A skill also selects its module's tool, so the result is a finished file.
    setSelectedModule(isGenerationModule(skill.module) ? skill.module : null);
    router.push('/');
  };
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (data.skills) {
          setSkills(data.skills);
        }
      } catch (e) {
        console.error('Failed to fetch skills:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('skills.title')}</h1>
              <p className="text-gray-600">{t('skills.description')}</p>
            </div>

            {loading ? (
              <p className="text-gray-500">{t('dashboard.loading')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill) => (
                  <Card key={skill.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${(moduleColors[skill.module as ProjectType] || 'bg-gray-500')} flex items-center justify-center text-white`}>
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {t(`modules.${skill.module}`)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{skill.description}</p>

                    {(skill.tags?.length ?? 0) > 0 && (
                    <div className="flex items-start gap-2 mb-4">
                      <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {(skill.tags || []).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    )}

                    <Button className="w-full" onClick={() => applySkill(skill)}>
                      {t('skills.useTemplate')}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}