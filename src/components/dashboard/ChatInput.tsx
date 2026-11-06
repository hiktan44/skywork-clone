'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AtSign,
  Check,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Plus,
  Presentation,
  RotateCcw,
  Send,
  Square,
  Table,
  Video,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Markdown from '@/components/Markdown';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { GENERATION_MODULES, type GenerationModule } from '@/lib/generation/schemas';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const TOOL_ICONS: Record<GenerationModule, React.ElementType> = {
  SLIDES: Presentation,
  DOCUMENT: FileText,
  SHEET: Table,
  WEBSITE: Globe,
  IMAGE: ImageIcon,
  VIDEO: Video,
};

// Generation error codes from /api/generate → i18n keys.
const GENERATE_ERRORS: Record<string, string> = {
  rate_limited: 'generate.rate_limited',
  quota_exceeded: 'generate.quota_exceeded',
  image_unavailable: 'generate.image_unavailable',
  invalid_output: 'generate.invalid_output',
};

export default function ChatInput() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // i18n key of the notice to show, or null.
  const [notice, setNotice] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Synchronous guard: state updates are async, so two clicks in one tick could both pass `busy`.
  const sendingRef = useRef(false);
  const t = useT();
  const router = useRouter();
  // Draft and selected tool live in the store so cards, quick actions and skills can set them.
  const {
    setRightPanelOpen,
    chatDraft: value,
    setChatDraft: setValue,
    selectedModule,
    setSelectedModule,
  } = useUIStore();
  const { data: session } = authClient.useSession();
  const busy = streaming || generating;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/chat')
      .then((res) => res.json())
      .then((data: { enabled?: boolean }) => {
        if (!cancelled) setChatEnabled(Boolean(data.enabled));
      })
      .catch(() => {
        if (!cancelled) setChatEnabled(false);
      });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, []);

  const requireSignIn = (key: string) => {
    setNotice(key);
    setRightPanelOpen(true);
  };

  /** Tool mode: generate a finished file, save it as a project and open it. */
  const generate = async (module: GenerationModule, text: string) => {
    setGenerating(true);
    setNotice(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, prompt: text }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) requireSignIn('generate.signIn');
        else if (res.status === 503) setNotice('chat.demoNotice');
        else setNotice(GENERATE_ERRORS[data.error] ?? 'generate.failed');
        return;
      }
      setValue('');
      router.push(`/projects/${encodeURIComponent(data.project.id)}`);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setNotice('generate.failed');
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  /** Chat mode: stream a Markdown answer. */
  const chat = async (text: string) => {
    const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setValue('');
    setNotice(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        if (res.status === 401) requireSignIn('chat.signInRequired');
        else if (res.status === 429) setNotice('chat.rateLimited');
        else if (res.status === 503) setNotice('chat.demoNotice');
        else setNotice('chat.error');
        setMessages(history.slice(0, -1));
        setValue(text);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        reply += decoder.decode(chunk, { stream: true });
        setMessages([...history, { role: 'assistant', content: reply }]);
      }
      if (!reply.trim()) {
        // Nothing was generated: drop the turn and give the prompt back for a retry.
        setNotice('chat.error');
        setMessages(history.slice(0, -1));
        setValue(text);
      }
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      if (!aborted) setNotice('chat.error');
      // Keep any partial reply; otherwise drop the empty assistant bubble.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) return aborted ? prev.slice(0, -1) : history.slice(0, -1);
        return prev;
      });
      if (!aborted && !useUIStore.getState().chatDraft) setValue(text);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const send = async () => {
    const text = value.trim();
    if (!text || busy || sendingRef.current) return;
    if (!chatEnabled) {
      setNotice('chat.demoNotice');
      return;
    }
    if (!session?.user) {
      requireSignIn(selectedModule ? 'generate.signIn' : 'chat.signInRequired');
      return;
    }
    sendingRef.current = true;
    try {
      if (selectedModule) await generate(selectedModule, text);
      else await chat(text);
    } finally {
      sendingRef.current = false;
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    void send();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const pickTool = (module: GenerationModule | null) => {
    setSelectedModule(module);
    setToolsOpen(false);
    setNotice(null);
    document.getElementById('chat-input')?.focus();
  };

  const SelectedIcon = selectedModule ? TOOL_ICONS[selectedModule] : null;

  return (
    <form onSubmit={handleSubmit} className="bg-[#f9f9fb] p-4 rounded-lg border border-gray-200">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('chat.greeting')}</h3>
          <p className="text-xs text-gray-600">{t('chat.subtitle')}</p>
        </div>
        {messages.length > 0 && !busy && (
          <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setMessages([])}>
            <RotateCcw className="mr-1 h-3 w-3" />
            {t('chat.clear')}
          </Button>
        )}
      </div>

      {messages.length > 0 && (
        <div className="mb-3 max-h-[480px] space-y-3 overflow-y-auto" aria-live="polite">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div
                key={i}
                className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-purple-600 px-3 py-2 text-xs text-white"
              >
                {m.content}
              </div>
            ) : (
              <div key={i} className="max-w-full rounded-lg border border-gray-200 bg-white px-4 py-3">
                {m.content ? (
                  <Markdown>{m.content}</Markdown>
                ) : (
                  streaming && i === messages.length - 1 && <p className="text-xs text-gray-500">{t('chat.thinking')}</p>
                )}
              </div>
            )
          )}
        </div>
      )}

      <Textarea
        id="chat-input"
        placeholder={t('chat.placeholder')}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (notice !== 'chat.rateLimited' && notice !== 'generate.rate_limited') setNotice(null);
        }}
        onKeyDown={handleKeyDown}
        maxLength={4000}
        disabled={generating}
        className="min-h-[40px] mb-3 resize-none bg-white border-gray-300 text-xs text-gray-700"
      />

      {generating && (
        <p role="status" className="mb-3 flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2 text-xs text-purple-800">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t('generate.progress')}
        </p>
      )}
      {selectedModule === 'VIDEO' && !generating && (
        <p className="mb-3 rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-600">{t('tools.videoNote')}</p>
      )}
      {notice && (
        <p role="status" className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t(notice)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                disabled={busy}
                aria-label={t('chat.connectTools')}
                className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50"
              />
            }
          >
            <Plus className="mr-1 h-3 w-3" />
            {t('chat.connectTools')}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t('tools.menuTitle')}
            </p>
            {[null, ...GENERATION_MODULES].map((module) => {
              const Icon = module ? TOOL_ICONS[module] : MessageSquare;
              const active = selectedModule === module;
              return (
                <button
                  key={module ?? 'chat'}
                  type="button"
                  onClick={() => pickTool(module)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100"
                >
                  <Icon className="h-4 w-4 text-purple-600" />
                  <span className="flex-1">{t(module ? `tools.${module}` : 'tools.chat')}</span>
                  {active && <Check className="h-3.5 w-3.5 text-purple-600" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        <Link
          href="/skills"
          className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-200"
        >
          <AtSign className="mr-1 h-3 w-3" />
          {t('chat.skills')}
        </Link>

        {selectedModule && SelectedIcon && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-white">
            <SelectedIcon className="h-3 w-3" />
            {t(`tools.${selectedModule}`)}
            <button
              type="button"
              aria-label={t('tools.clear')}
              onClick={() => pickTool(null)}
              disabled={busy}
              className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-md bg-purple-600 px-2 py-1 text-[11px] font-semibold text-white sm:inline">
            Gemini
          </span>
          {busy ? (
            <Button
              type="button"
              size="sm"
              aria-label="Stop"
              onClick={() => abortRef.current?.abort()}
              className="h-7 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Square className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!value.trim()}
              aria-label={t('chat.send')}
              className="h-7 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold"
            >
              <Send className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
