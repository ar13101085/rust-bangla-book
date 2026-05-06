import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch21-00-final-project-a-web-server";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        বইয়ের শেষ অধ্যায় — capstone project। একটা multithreaded web server
        scratch থেকে বানাব। বইয়ের প্রায় সব concept এতে use হবে।
      </p>
      <p class="mt-3">
        তিন ধাপে — প্রথমে <strong>single-threaded server</strong> (TCP listen,
        HTTP request parse, response পাঠানো), তারপর{" "}
        <strong>multithreaded</strong> (thread pool দিয়ে concurrent
        connection), শেষে <strong>graceful shutdown</strong> (Ctrl-C পেলে
        ongoing request শেষ করে exit, কোনো resource leak ছাড়া)।
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
