import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { neighbors } from "~/data/toc";

export const LessonNav = component$<{ slug: string }>(({ slug }) => {
  const { prev, next } = neighbors(slug);
  return (
    <nav class="mt-12 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
      {prev ? (
        <Link href={`/lessons/${prev.slug}/`} class="flex-1">
          <Button variant="outline" class="w-full justify-start">
            <span class="text-left">
              <span class="block text-xs text-[var(--muted-foreground)]">
                পূর্ববর্তী
              </span>
              <span class="block">← {prev.titleBn}</span>
            </span>
          </Button>
        </Link>
      ) : (
        <Link href="/" class="flex-1">
          <Button variant="outline" class="w-full">
            ← হোম
          </Button>
        </Link>
      )}
      {next && (
        <Link href={`/lessons/${next.slug}/`} class="flex-1">
          <Button variant="outline" class="w-full justify-end">
            <span class="text-right">
              <span class="block text-xs text-[var(--muted-foreground)]">
                পরবর্তী
              </span>
              <span class="block">{next.titleBn} →</span>
            </span>
          </Button>
        </Link>
      )}
    </nav>
  );
});
