import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch04-00-understanding-ownership";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        <strong>Ownership</strong> হলো Rust-এর সবচেয়ে নিজস্ব এবং সবচেয়ে
        গুরুত্বপূর্ণ feature — অন্য কোনো mainstream language-এ এর সরাসরি
        equivalent নেই। এই system-ই Rust-কে garbage collector ছাড়াই memory
        safe করে রাখে।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে তিনটা সম্পর্কিত বিষয় দেখব — ownership-এর basic rule
        (কে memory-র মালিক, কখন free হয়), <strong>reference</strong> ও{" "}
        <strong>borrowing</strong> (ownership transfer ছাড়াই data ব্যবহার),
        এবং <strong>slice</strong> (collection-এর অংশের reference)।
      </p>
      <p class="mt-3">
        এই অধ্যায়ের concept-গুলো বাকি বইয়ের প্রতি page-এ ফিরে আসবে। সময় নিয়ে
        ভালো করে বোঝো — পরে অনেক সহজ লাগবে।
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
