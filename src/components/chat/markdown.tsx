"use client";

import { Icon } from "@iconify/react";
import React, { useCallback, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
      aria-label="Copy code"
      type="button"
    >
      {copied ? (
        <Icon icon="solar:check-circle-linear" className="h-3.5 w-3.5" />
      ) : (
        <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match && !className;
    const codeString = String(children).replace(/\n$/, "");

    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono border border-border"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="relative group my-4">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-border rounded-t-lg">
          <span className="text-xs font-mono text-muted-foreground">
            {match?.[1] || "text"}
          </span>
        </div>
        <div className="relative">
          <CopyButton text={codeString} />
          <pre className="overflow-x-auto p-4 bg-muted/30 border border-t-0 border-border rounded-b-lg">
            <code className={cn("text-sm font-mono", className)} {...props}>
              {children}
            </code>
          </pre>
        </div>
      </div>
    );
  },

  pre({ children }) {
    return <>{children}</>;
  },

  a({ href, children, ...props }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },

  table({ children, ...props }) {
    return (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm" {...props}>
          {children}
        </table>
      </div>
    );
  },

  thead({ children, ...props }) {
    return (
      <thead className="bg-muted/50" {...props}>
        {children}
      </thead>
    );
  },

  th({ children, ...props }) {
    return (
      <th
        className="px-4 py-2 text-left font-medium text-foreground border-b border-border"
        {...props}
      >
        {children}
      </th>
    );
  },

  td({ children, ...props }) {
    return (
      <td
        className="px-4 py-2 border-b border-border text-muted-foreground"
        {...props}
      >
        {children}
      </td>
    );
  },

  ul({ children, ...props }) {
    return (
      <ul className="my-2 ml-6 list-disc space-y-1 text-foreground" {...props}>
        {children}
      </ul>
    );
  },

  ol({ children, ...props }) {
    return (
      <ol
        className="my-2 ml-6 list-decimal space-y-1 text-foreground"
        {...props}
      >
        {children}
      </ol>
    );
  },

  li({ children, ...props }) {
    return (
      <li className="text-foreground leading-relaxed" {...props}>
        {children}
      </li>
    );
  },

  h1({ children, ...props }) {
    return (
      <h1 className="mt-6 mb-3 text-2xl font-bold text-foreground" {...props}>
        {children}
      </h1>
    );
  },

  h2({ children, ...props }) {
    return (
      <h2
        className="mt-5 mb-2 text-xl font-semibold text-foreground"
        {...props}
      >
        {children}
      </h2>
    );
  },

  h3({ children, ...props }) {
    return (
      <h3
        className="mt-4 mb-2 text-lg font-semibold text-foreground"
        {...props}
      >
        {children}
      </h3>
    );
  },

  h4({ children, ...props }) {
    return (
      <h4
        className="mt-3 mb-1 text-base font-semibold text-foreground"
        {...props}
      >
        {children}
      </h4>
    );
  },

  p({ children, ...props }) {
    return (
      <p className="my-2 leading-relaxed text-foreground" {...props}>
        {children}
      </p>
    );
  },

  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="my-3 border-l-4 border-primary/40 pl-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  hr({ ...props }) {
    return <hr className="my-6 border-border" {...props} />;
  },

  strong({ children, ...props }) {
    return (
      <strong className="font-semibold text-foreground" {...props}>
        {children}
      </strong>
    );
  },
};

export const Markdown = React.memo(function Markdown({
  content,
}: MarkdownProps) {
  return (
    <div className="prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
