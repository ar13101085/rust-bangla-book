import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { findLesson, neighbors } from "~/data/toc";

type Props = { slug: string };

export const StubLesson = component$<Props>(({ slug }) => {
  const lesson = findLesson(slug);
  if (!lesson) {
    return <p>Lesson not found: {slug}</p>;
  }
  const { prev, next } = neighbors(slug);

  return (
    <article>
      <header class="mb-10">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ {lesson.num}
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          {lesson.titleBn}
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">{lesson.titleEn}</p>
      </header>

      <div class="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] p-8 text-center">
        <p class="text-2xl">🚧</p>
        <p class="mt-3 text-lg font-medium">এই পাঠ এখনো লেখা হয়নি</p>
        <p class="mt-1 text-sm text-[var(--muted-foreground)]">
          শীঘ্রই আসছে — এই page-এ Rust Book-এর{" "}
          <a
            href={`https://doc.rust-lang.org/book/${slug}.html`}
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            "{lesson.titleEn}"
          </a>{" "}
          chapter-এর বাংলা version লেখা হবে।
        </p>
      </div>

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
    </article>
  );
});
