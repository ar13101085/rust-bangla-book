import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch16-00-concurrency";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Concurrent programming bug-prone — data race, deadlock, subtle race
        condition। Rust-এর ownership ও type system এই class-এর bug-এর
        অনেকটাই compile-time-এ ঠেকায়। এজন্য Rust-এর concurrency-কে বলে{" "}
        <strong>fearless concurrency</strong>।
      </p>
      <p class="mt-3">
        চারটা পাঠে — thread create করা, thread-এর মধ্যে message passing
        (channel), shared-state concurrency (<code>Mutex</code>,{" "}
        <code>Arc</code>), এবং কীভাবে <code>Send</code>/<code>Sync</code>{" "}
        trait দিয়ে user নিজের type-কে concurrent-safe declare করতে পারে।
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
