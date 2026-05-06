import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch11-00-testing";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Rust-এর type system অনেক bug ধরে ফেলে compile time-এ। কিন্তু{" "}
        <em>logic</em>-এর bug — যেমন function ভুল calculation করছে — সেগুলো
        type system ধরবে না। তার জন্য চাই <strong>test</strong>।
      </p>
      <p class="mt-3">
        Rust-এর test framework standard library-র সাথেই আসে —{" "}
        <code>#[test]</code> attribute, <code>assert!</code> macro,{" "}
        <code>cargo test</code> command। তিন পাঠে দেখব — test লেখা, test-এর
        running কীভাবে control করা, এবং unit ও integration test organize করা।
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
