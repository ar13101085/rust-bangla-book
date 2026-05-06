import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { chapters } from "~/data/toc";

export const Sidebar = component$(() => {
  const loc = useLocation();
  const currentPath = loc.url.pathname;
  const isActive = (path: string) =>
    currentPath === path || currentPath === path.replace(/\/$/, "");

  return (
    <nav aria-label="পাঠসূচি">
      <Link
        href="/"
        class={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
          isActive("/")
            ? "bg-[var(--muted)] text-[var(--primary)]"
            : "hover:bg-[var(--muted)]"
        }`}
      >
        হোম
      </Link>

      <ol class="mt-4 space-y-3">
        {chapters.map((chapter) => {
          const chapterPath = `/lessons/${chapter.slug}/`;
          const chapterActive = isActive(chapterPath);
          return (
            <li key={chapter.slug}>
              <Link
                href={chapterPath}
                class={`flex items-baseline gap-2 rounded px-3 py-1.5 text-sm font-bold leading-tight transition-colors ${
                  chapterActive
                    ? "bg-[var(--muted)] text-[var(--primary)]"
                    : "hover:bg-[var(--muted)]"
                }`}
              >
                <span class="font-mono text-xs text-[var(--muted-foreground)]">
                  {String(chapter.num).padStart(2, "0")}
                </span>
                <span>{chapter.titleBn}</span>
              </Link>

              {chapter.sections.length > 0 && (
                <ul class="ml-3 mt-1 space-y-0.5 border-l border-[var(--border)] pl-2">
                  {chapter.sections.map((s) => {
                    const sectionPath = `/lessons/${s.slug}/`;
                    const sectionActive = isActive(sectionPath);
                    return (
                      <li key={s.slug}>
                        <Link
                          href={sectionPath}
                          class={`flex items-baseline gap-2 rounded px-2 py-1 text-sm leading-snug transition-colors ${
                            sectionActive
                              ? "bg-[var(--muted)] text-[var(--primary)] font-medium"
                              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <span class="font-mono text-[0.7rem] opacity-70">
                            {s.num}
                          </span>
                          <span>{s.titleBn}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      <Slot />
    </nav>
  );
});
