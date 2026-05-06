import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-06-futures-tasks-threads";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.৬
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Future, Task, এবং Thread
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Putting It All Together: Futures, Tasks, and Threads
        </p>
        <p class="mt-3">
          Chapter 16-এ thread, এই chapter-এ async — দু'টোই concurrency-এর model। কিন্তু কোনটা কখন
          ব্যবহার করব? দু'টো একসাথে use করা যায় কিনা? এই পাঠে আমরা এদের মধ্যে rough mental model
          তৈরি করব এবং দেখব কীভাবে combine করতে হয়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">তিনটা মডেল — granularity</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Thread</strong> — OS managed, তুলনামূলক heavy (memory, context switch overhead)।
            Concurrency thread-এর <em>মধ্যে</em>। Fire-and-forget pattern।
          </li>
          <li>
            <strong>Task</strong> — runtime managed, lightweight। Concurrency thread-এর মধ্যে এবং
            task-এর মধ্যেও (একটা task multiple future সামলাতে পারে)।
          </li>
          <li>
            <strong>Future</strong> — Rust-এর সবচেয়ে granular concurrency unit; runtime executor
            task সামলায়, task future সামলায়।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">কোনটা কখন</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>CPU-bound কাজ</strong> (heavy compute, parallelizable) → <strong>thread</strong>।
          </li>
          <li>
            <strong>I/O-bound কাজ</strong> (network, file, অনেক wait) → <strong>async</strong>।
          </li>
          <li>
            দু'টোই দরকার — <strong>thread + async একসাথে</strong>।
          </li>
        </ul>
        <p>
          আসলে অধিকাংশ production runtime (যেমন Tokio) <em>multithreaded by default</em> —{" "}
          <strong>work stealing</strong> করে: কোনো thread idle হয়ে গেলে অন্য thread-এর queue থেকে
          task নিয়ে আসে। ফলে throughput ভালো হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Thread + async একসাথে</h2>
        <p>
          নিচের code-এ একটা thread blocking কাজ (i.e. compute-heavy বা legacy sync API) করছে; main
          task async-এ message receive করছে। দু'টোর মাঝে bridge হচ্ছে{" "}
          <InlineCode>trpl::channel</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::{thread, time::Duration};

fn main() {
    let (tx, mut rx) = trpl::channel();

    thread::spawn(move || {
        for i in 1..11 {
            tx.send(i).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    trpl::block_on(async {
        while let Some(message) = rx.recv().await {
            println!("{message}");
        }
    });
}`}
        />
        <p>
          এই pattern বাস্তবে এমন জায়গায় কাজে লাগে — মনে করো একটা video encoding thread (CPU-heavy)
          আর একটা UI loop (event-driven, async)। Encoding thread chunk শেষ হলে channel-এ message
          পাঠায়, UI সেটা async-এ receive করে progress bar update করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">পার্থক্য সংক্ষেপে</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            Thread <InlineCode>thread::spawn</InlineCode> দিয়ে — OS scheduler ঠিক করে কখন চলবে।
          </li>
          <li>
            Task <InlineCode>trpl::spawn_task</InlineCode> দিয়ে — runtime scheduler নিয়ন্ত্রণ করে।
          </li>
          <li>
            Thread blocking sync API-র সাথে স্বাভাবিক; async runtime-এ blocking call করলে runtime
            থমকে যাবে।
          </li>
          <li>
            Async-এর benefit বেশি I/O-heavy বা অনেক simultaneous connection-এ (যেমন server)।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Granularity — <strong>thread &gt; task &gt; future</strong>; runtime-ই task-কে thread-এ
            map করে।
          </li>
          <li>
            CPU-bound → thread; I/O-bound → async; দু'টোই দরকার হলে combine।
          </li>
          <li>
            Modern async runtime work stealing করে — multi-thread + async একসাথে।
          </li>
          <li>
            Thread আর async-এর মাঝে <InlineCode>trpl::channel</InlineCode> দিয়ে communicate — একটা
            real-world pattern।
          </li>
          <li>
            Async runtime-এ blocking call অপ্রত্যাশিতভাবে অন্য task-কে starve করতে পারে; দরকার হলে
            আলাদা thread-এ পাঠাও।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.৬: Future, Task, এবং Thread · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Thread, task, এবং future — কখন কোনটা; CPU-bound vs I/O-bound; work stealing; thread + async একসাথে।",
    },
  ],
};
