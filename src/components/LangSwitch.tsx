'use client';

import { useLang, setLang } from '@/lib/use-lang';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LangSwitch() {
  const [lang] = useLang();
  const t = useT();

  const toggleLang = () => {
    setLang(lang === 'tr' ? 'en' : 'tr');
  };

  const label = lang === 'tr' ? t('lang.switchToEnglish') : t('lang.switchToTurkish');

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLang}
      className="h-9 w-9"
      title={label}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
