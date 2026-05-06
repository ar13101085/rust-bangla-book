import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch17-00-async-await";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        I/O wait-এ thread block না করে অন্য কাজে চলে যাওয়া — এজন্য{" "}
        <strong>async</strong>। আগের অধ্যায়ের thread-based concurrency
        CPU-bound কাজে ভালো, async I/O-bound কাজে। Server, network client,
        web scraper — সব async কাজে লাগে।
      </p>
      <p class="mt-3">
        ছয়টা পাঠে — <code>async</code>/<code>await</code> syntax এবং{" "}
        <code>Future</code>, একাধিক future একসাথে চালানো, stream (async
        iterator), <code>Future</code> ও <code>Stream</code> trait, এবং async
        বনাম thread কখন কোনটা।
      </p>
    </ChapterIntro>
  );
});

export const head: DocumentHead = () => {
  const lesson = findLesson(slug);
  return {
    title: lesson
      ? `${lesson.num} ${lesson.titleBn} · বাংলায় Rust`
      : "বাংলায় Rust",
  };
};
