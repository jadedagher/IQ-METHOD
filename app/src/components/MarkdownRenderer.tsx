'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children }) {
          return (
            <pre className="overflow-x-auto border-l-2 border-gray-700 bg-gray-900/50 p-4 text-sm text-gray-100">
              {children}
            </pre>
          );
        },
        code({ children, className }) {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-gray-800/50 px-1.5 py-0.5 text-sm text-emerald-300">
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-700 text-sm">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-700 px-3 py-2">{children}</td>
          );
        },
        h1({ children }) {
          return <h1 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-emerald-300">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="mb-2 mt-5 text-sm font-bold text-gray-200">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="mb-2 mt-4 text-sm font-semibold text-gray-300">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="ml-4 list-disc space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="ml-4 list-decimal space-y-1">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-gray-600 pl-4 text-gray-400">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a href={href} className="text-emerald-400 underline hover:text-emerald-300" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        strong({ children }) {
          return <strong className="font-bold text-white">{children}</strong>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
