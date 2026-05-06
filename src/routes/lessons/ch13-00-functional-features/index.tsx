import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch13-00-functional-features";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Rust-এর design-এ functional language-গুলোর কয়েকটা feature গভীরভাবে
        মিশে আছে। সবচেয়ে গুরুত্বপূর্ণ দু'টো — <strong>closure</strong>{" "}
        (anonymous function যা environment capture করতে পারে) এবং{" "}
        <strong>iterator</strong> (sequence-এর উপর কাজ করার declarative API)।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে দু'টোর syntax ও mechanics দেখব, তারপর আগের{" "}
        <code>minigrep</code> project-কে iterator দিয়ে refactor করব। শেষে
        একটা surprising fact — high-level iterator chain-এর performance
        hand-written loop-এর সমান, কখনো কখনো ভালো।
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
