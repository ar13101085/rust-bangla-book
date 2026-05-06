import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch05-00-structs";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        <strong>Struct</strong> related data-গুলোকে এক group-এ rakhne — অনেকটা
        object-oriented language-এর object-এর data field-এর মতো। কিন্তু Rust-এ
        struct-এর সাথে আলাদা <strong>method</strong> attach করা হয় (object-এর
        method-এর মতোই)।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে দেখব — struct define ও instantiate করা, একটা real example
        (rectangle area) দিয়ে কেন struct ভালো, এবং{" "}
        <strong>method syntax</strong> দিয়ে struct-এর সাথে behavior যুক্ত করা।
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
