import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch06-00-enums";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Struct বলে — "এই data এক group"। <strong>Enum</strong> বলে — "এই value
        কয়েকটা সম্ভাবনার মধ্যে এক"। দু'টোই Rust-এর data-modeling-এর
        মূল হাতিয়ার।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে আমরা enum define করা এবং variant-এ data attach করা শিখব।
        Rust-এর সবচেয়ে গুরুত্বপূর্ণ enum — <strong>Option</strong> — কেন{" "}
        null-এর চেয়ে অনেক ভালো সেটা দেখব। তারপর <strong>match</strong>{" "}
        expression দিয়ে exhaustive pattern matching, এবং{" "}
        <strong>if let</strong> / <strong>let...else</strong> দিয়ে সংক্ষিপ্ত
        form।
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
