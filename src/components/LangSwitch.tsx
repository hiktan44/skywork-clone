'use client';

import { useLang, setLang } from '@/lib/use-lang';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LangSwitch() {
  const [lang] = useLang();

  const toggleLang = () => {
    setLang(lang === 'tr' ? 'en' : 'tr');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLang}
      className="h-9 w-9"
      title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
      </span>
    </Button>
  );
}