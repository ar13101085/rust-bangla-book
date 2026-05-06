import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch12-00-an-io-project";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        এই অধ্যায়ে আমরা <strong>minigrep</strong> বানাব — Unix-এর{" "}
        <code>grep</code>-এর simplified version। File-এ একটা search string
        খুঁজে যেসব line-এ পাওয়া যায়, সেগুলো print করবে।
      </p>
      <p class="mt-3">
        এতদূর শেখা concept-গুলো এক real project-এ প্রয়োগ করব —
        command-line argument parsing, file reading, error handling,
        modularity, library/binary split, test driven development,
        environment variable, এবং stdout-vs-stderr। ছোট হলেও এটা সম্পূর্ণ
        Rust project।
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
