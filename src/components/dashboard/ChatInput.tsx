'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ChevronDown, Plus, AtSign, Send, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { authClient } from '@/lib/auth-client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Notice = 'demo' | 'signIn' | 'rateLimited' | 'error' | null;

const noticeKey: Record<Exclude<Notice, null>, string> = {
  demo: 'chat.demoNotice',
  signIn: 'chat.signInRequired',
  rateLimited: 'chat.rateLimited',
  error: 'chat.error',
};

export default function ChatInput() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [streaming, setStreaming] = useState(false);
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const t = useT();
  // The draft lives in the store so project cards and skill templates can prefill it.
  const { setRightPanelOpen, chatDraft: value, setChatDraft: setValue } = useUIStore();
  const { data: session } = authClient.useSession();

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

  const send = async () => {
    const text = value.trim();
    if (!text || streaming) return;

    if (!chatEnabled) {
      setNotice('demo');
      return;
    }
    if (!session?.user) {
      setNotice('signIn');
      setRightPanelOpen(true);
      return;
    }

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
        if (res.status === 401) {
          setNotice('signIn');
          setRightPanelOpen(true);
        } else if (res.status === 429) {
          setNotice('rateLimited');
        } else if (res.status === 503) {
          setNotice('demo');
        } else {
          setNotice('error');
        }
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
        setNotice('error');
        setMessages(history.slice(0, -1));
        setValue(text);
      }
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      if (!aborted) setNotice('error');
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

  return (
    <form onSubmit={handleSubmit} className="bg-[#f9f9fb] p-4 rounded-lg border border-gray-200">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('chat.greeting')}</h3>
          <p className="text-xs text-gray-600">{t('chat.subtitle')}</p>
        </div>
        {messages.length > 0 && !streaming && (
          <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setMessages([])}>
            <RotateCcw className="mr-1 h-3 w-3" />
            {t('chat.clear')}
          </Button>
        )}
      </div>

      {messages.length > 0 && (
        <div className="mb-3 max-h-[360px] space-y-3 overflow-y-auto" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-lg bg-purple-600 px-3 py-2 text-xs text-white whitespace-pre-wrap'
                  : 'max-w-[95%] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 whitespace-pre-wrap'
              }
            >
              {m.content || (streaming && i === messages.length - 1 ? t('chat.thinking') : '')}
            </div>
          ))}
        </div>
      )}

      <Textarea
        id="chat-input"
        placeholder={t('chat.placeholder')}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (notice !== 'rateLimited') setNotice(null);
        }}
        onKeyDown={handleKeyDown}
        maxLength={4000}
        className="min-h-[40px] mb-3 resize-none bg-white border-gray-300 text-xs text-gray-700"
      />

      {notice && (
        <p role="status" className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t(noticeKey[notice])}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold text-[11px] px-3 py-1">
          <Plus className="mr-1 h-3 w-3" />
          {t('chat.connectTools')}
        </Badge>

        <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold text-[11px] px-3 py-1">
          <AtSign className="mr-1 h-3 w-3" />
          {t('chat.skills')}
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          <Button type="button" size="sm" className="h-7 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold">
            {t('chat.autoModel')}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
          {streaming ? (
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
