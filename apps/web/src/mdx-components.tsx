import type { MDXComponents } from "mdx/types";
import { Term } from "@/features/learn/term";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Term,
    h2: (props) => <h2 className="mt-10 mb-3 text-xl text-ink first:mt-0" {...props} />,
    h3: (props) => <h3 className="mt-6 mb-2 text-base text-ink" {...props} />,
    p: (props) => (
      <p className="mb-4 text-sm leading-relaxed text-ink-muted" {...props} />
    ),
    ul: (props) => (
      <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-ink-muted" {...props} />
    ),
    ol: (props) => (
      <ol
        className="mb-4 list-decimal space-y-2 pl-5 text-sm text-ink-muted"
        {...props}
      />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-medium text-ink" {...props} />,
    a: (props) => (
      <a className="text-teal underline-offset-2 hover:underline" {...props} />
    ),
    blockquote: (props) => (
      <blockquote
        className="mb-4 border-brass border-l-2 pl-4 text-sm text-ink-muted italic"
        {...props}
      />
    ),
    ...components,
  };
}
