'use client';

import { useState } from 'react';
import { ChevronDown, Plus, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';

export default function ChatInput() {
  const [value, setValue] = useState('');
  const t = useT();

  return (
    <div className="bg-[#f9f9fb] p-4 rounded-lg border border-gray-200">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{t('chat.greeting')}</h3>
        <p className="text-xs text-gray-600">{t('chat.subtitle')}</p>
      </div>

      <Textarea
        placeholder={t('chat.placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[40px] mb-3 resize-none bg-white border-gray-300 text-xs text-gray-500"
      />

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold text-[11px] px-3 py-1">
          <Plus className="mr-1 h-3 w-3" />
          {t('chat.connectTools')}
        </Badge>

        <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold text-[11px] px-3 py-1">
          <AtSign className="mr-1 h-3 w-3" />
          {t('chat.skills')}
        </Badge>

        <div className="ml-auto">
          <Button size="sm" className="h-7 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold">
            {t('chat.autoModel')}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}