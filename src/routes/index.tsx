import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { allLessons, chapters, type Lesson } from "~/data/toc";

const StatusBadge = component$<{ status: Lesson["status"] }>(({ status }) => {
  if (status === "done") {
    return (
      <span class="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        সম্পন্ন
      </span>
    );
  }
  if (status === "wip") {
    return (
      <span class="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
        চলছে
      </span>
    );
  }
  return (
    <span class="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
      শীঘ্রই
    </span>
  );
});

export default component$(() => {
  const firstDone = allLessons.find((l) => l.status === "done");

  return (
    <>
      <section class="mb-14">
        <h1 class="text-4xl font-bold tracking-tight md:text-5xl">
          বাংলায় <span class="text-[var(--primary)]">Rust</span> শেখো
        </h1>
        <p class="mt-4 text-lg text-[var(--muted-foreground)]">
          Official{" "}
          <a
            href="https://doc.rust-lang.org/book/"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            "The Rust Programming Language"
          </a>{" "}
          book-এর কাঠামো অনুসরণ করে এই tutorial-এ Rust-এর প্রতিটি concept বাংলায়
          ব্যাখ্যা করা হবে। সব code example থাকবে English-এ — যেমনটা তুমি{" "}
          <code class="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">
            rustc
          </code>{" "}
          এবং official docs-এ দেখবে। ownership, borrowing, lifetime — এসব
          technical term-ও আমরা English-এই রাখব।
        </p>
        {firstDone && (
          <div class="mt-6 flex flex-wrap gap-3">
            <Link href={`/lessons/${firstDone.slug}/`}>
              <Button size="lg">প্রথম পাঠ পড়ো →</Button>
            </Link>
            <a
              href="https://doc.rust-lang.org/book/"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" variant="outline">
                The Rust Book
              </Button>
            </a>
          </div>
        )}
      </section>

      <section>
        <h2 class="mb-2 text-2xl font-bold tracking-tight">পাঠসূচি</h2>
        <p class="mb-8 text-sm text-[var(--muted-foreground)]">
          মোট {chapters.length}টি chapter, {" "}
          {chapters.reduce((sum, c) => sum + c.sections.length, 0)}টি sub-section।
        </p>

        <ol class="space-y-8">
          {chapters.map((chapter) => (
            <li key={chapter.slug}>
              <div class="mb-3 flex items-baseline gap-3">
                <span class="text-sm font-mono font-bold text-[var(--muted-foreground)]">
                  {String(chapter.num).padStart(2, "0")}
                </span>
                <h3 class="text-xl font-bold">
                  <Link
                    href={`/lessons/${chapter.slug}/`}
                    class="hover:text-[var(--primary)]"
                  >
                    {chapter.titleBn}
                  </Link>
                </h3>
                {chapter.sections.length === 0 && chapter.status && (
                  <StatusBadge status={chapter.status} />
                )}
              </div>
              <p class="ml-8 mb-3 text-sm text-[var(--muted-foreground)]">
                {chapter.titleEn}
              </p>
              {chapter.sections.length > 0 && (
                <ul class="ml-8 space-y-1.5 border-l border-[var(--border)] pl-5">
                  {chapter.sections.map((section) => (
                    <li key={section.slug}>
                      <Link
                        href={`/lessons/${section.slug}/`}
                        class="group flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-[var(--muted)]"
                      >
                        <span class="flex items-baseline gap-3">
                          <span class="font-mono text-xs text-[var(--muted-foreground)]">
                            {section.num}
                          </span>
                          <span class="text-sm font-medium group-hover:text-[var(--primary)]">
                            {section.titleBn}
                          </span>
                        </span>
                        <StatusBadge status={section.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "বাংলায় Rust শিখুন",
  meta: [
    {
      name: "description",
      content:
        "The Rust Programming Language book-এর বাংলা version। ব্যাখ্যা বাংলায়, code English-এ।",
    },
  ],
};
