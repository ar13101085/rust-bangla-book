import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type CodeBlockProps = {
  code: string;
  lang?: string;
  filename?: string;
  class?: string;
};

export const CodeBlock = component$<CodeBlockProps>(
  ({ code, lang = "rust", filename, class: className }) => {
    return (
      <figure
        class={cn(
          "my-6 overflow-hidden rounded-lg border border-[var(--border)]",
          className,
        )}
      >
        {filename && (
          <figcaption class="flex items-center justify-between bg-[var(--muted)] px-4 py-2 text-xs font-medium text-[var(--muted-foreground)]">
            <span>{filename}</span>
            <span class="uppercase tracking-wider">{lang}</span>
          </figcaption>
        )}
        <pre class="overflow-x-auto bg-[var(--code-bg)] p-4 text-sm leading-relaxed text-[var(--code-fg)]">
          <code class={`language-${lang}`}>{code}</code>
        </pre>
      </figure>
    );
  },
);

export const InlineCode = component$<{ class?: string }>(
  ({ class: className }) => {
    return (
      <code
        class={cn(
          "rounded bg-[var(--muted)] px-1.5 py-0.5 text-[0.9em] font-medium",
          className,
        )}
      >
        <Slot />
      </code>
    );
  },
);
