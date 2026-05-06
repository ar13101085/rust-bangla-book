import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";
import { chapters } from "~/data/toc";

type Props = { slug: string };

export const ChapterIntro = component$<Props>(({ slug }) => {
  const chapter = chapters.find((c) => c.slug === slug);
  if (!chapter) {
    return <p>Chapter not found: {slug}</p>;
  }

  return (
    <article class="prose-bn">
      <header class="mb-10">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          অধ্যায় {chapter.num}
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          {chapter.titleBn}
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">{chapter.titleEn}</p>
        <div class="mt-4 leading-relaxed">
          <Slot />
        </div>
      </header>

      {chapter.sections.length > 0 && (
        <section class="mb-10">
          <h2 class="mb-4 text-2xl font-bold">এই অধ্যায়ের পাঠসমূহ</h2>
          <ul class="space-y-2 border-l border-[var(--border)] pl-5">
            {chapter.sections.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/lessons/${s.slug}/`}
                  class="group flex items-baseline gap-3 hover:text-[var(--primary)]"
                >
                  <span class="font-mono text-xs text-[var(--muted-foreground)]">
                    {s.num}
                  </span>
                  <span class="font-medium">{s.titleBn}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LessonNav slug={slug} />
    </article>
  );
});
