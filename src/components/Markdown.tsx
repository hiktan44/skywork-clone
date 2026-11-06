'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Styled element map (no typography plugin in this project). Raw HTML is never rendered.
const components: Components = {
  h1: ({ children }) => <h1 className="mt-4 mb-2 text-xl font-bold text-gray-900 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-4 mb-2 text-lg font-semibold text-gray-900 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-3 mb-1.5 text-base font-semibold text-gray-900">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-3 mb-1 text-sm font-semibold text-gray-900">{children}</h4>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-purple-700 underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-purple-200 pl-3 text-gray-600">{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-gray-200" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-gray-200 bg-gray-50 px-2 py-1 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-gray-200 px-2 py-1 align-top">{children}</td>,
  pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-md bg-gray-900 p-3 text-gray-100">{children}</pre>,
  code: ({ children, className }) => (
    <code className={cn('rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.9em] text-gray-800', className)}>
      {children}
    </code>
  ),
  img: () => null,
};

export default function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('text-sm text-gray-700', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
