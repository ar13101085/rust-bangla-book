import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch13-04-performance";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৩.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Loop বনাম Iterator-এর performance
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Performance in Loops vs. Iterators
        </p>
        <p class="mt-3">
          Iterator high-level abstraction — কিন্তু performance cost কত? উত্তর:{" "}
          <strong>প্রায় শূন্য</strong>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Benchmark</h2>
        <p>
          Rust documentation একটা benchmark করেছে — Sherlock Holmes-এর পুরো
          collection (12 million character) থেকে "the" শব্দ search। দু'টা
          version: explicit <InlineCode>for</InlineCode> loop ও iterator
          adapter।
        </p>
        <CodeBlock
          lang="text"
          code={`test bench_search_for  ... bench:  19,620,300 ns/iter (+/- 915,700)
test bench_search_iter ... bench:  19,234,900 ns/iter (+/- 657,200)`}
        />
        <p>
          Iterator version <em>সামান্য fast</em>। দু'টোই কার্যত একই —
          performance বিচারে কোনো পার্থক্য নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Zero-cost abstraction</h2>
        <p>
          Iterator হলো Rust-এর <strong>zero-cost abstraction</strong>-গুলোর
          অন্যতম। মানে — high-level abstraction use করলে অতিরিক্ত runtime
          overhead নেই। C++-এর Bjarne Stroustrup-এর "zero-overhead principle"
          এর মতোই:
        </p>
        <blockquote class="ml-6 border-l-4 border-[var(--border)] pl-4 italic text-[var(--muted-foreground)]">
          "What you don't use, you don't pay for. And further: what you do use,
          you couldn't hand code any better."
        </blockquote>
        <p>
          অর্থ — তুমি যা ব্যবহার করছ না সেটার দাম নেই; যা ব্যবহার করছ সেটাকে
          hand-written-এর চেয়ে ভালো করা সম্ভব না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Compiler optimization</h2>
        <p>
          Iterator chain দেখে compiler অনেক optimization apply করে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Loop unrolling</strong> — loop body inline করে repetition।
          </li>
          <li>
            <strong>Bounds-check elimination</strong> — array access যেখানে
            safe সেখানে runtime check বাদ।
          </li>
          <li>
            Generic monomorphization — concrete type-এর জন্য optimized code।
          </li>
        </ul>
        <p>
          ফলাফল — iterator chain-এর compiled output প্রায়শই hand-written
          assembly-এর সমান বা better।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Iterator vs explicit loop — performance difference নগণ্য।
          </li>
          <li>
            <strong>Zero-cost abstraction</strong> — Rust-এর core philosophy;
            high-level code-ও hand-written-এর সমান fast।
          </li>
          <li>
            Compiler iterator chain-এ unroll, bounds-check elimination,
            monomorphization apply করে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৩.৪: Loop বনাম Iterator-এর performance · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ iterator zero-cost abstraction কেন — benchmark, compiler optimization, এবং hand-written-এর সমান speed।",
    },
  ],
};
