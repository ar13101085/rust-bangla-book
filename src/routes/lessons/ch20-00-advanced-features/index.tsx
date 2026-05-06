import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch20-00-advanced-features";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        এই অধ্যায়ের topic-গুলো প্রতিদিনের Rust code-এ দরকার হয় না — কিন্তু
        কোনো কোনো নির্দিষ্ট situation-এ এদের বিকল্প নেই। Library author,
        FFI developer, framework writer-দের জন্য বিশেষ গুরুত্বপূর্ণ।
      </p>
      <p class="mt-3">
        পাঁচটা পাঠে — <strong>unsafe Rust</strong> (Rust-এর safety guarantee
        ছাড়িয়ে রক্ষণাত্মক কোড), advanced trait (associated type, operator
        overloading, supertrait, newtype), advanced type (type alias, never
        type, DST), advanced function/closure, এবং{" "}
        <strong>macro</strong> — declarative ও procedural।
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
