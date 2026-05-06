import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch03-00-common-programming-concepts";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        প্রায় সব programming language-এ যেসব concept থাকে — variable, basic
        data type, function, comment, control flow — Rust-এ সেগুলো কীভাবে কাজ
        করে, এই অধ্যায়ে দেখব।
      </p>
      <p class="mt-3">
        Rust-এ কিছু feature-এ subtle পার্থক্য আছে যেগুলো language-এর
        philosophy বুঝতে সাহায্য করবে — যেমন variable default-এ <em>immutable</em>,
        condition অবশ্যই <em>bool</em>, এবং loop নিজেই value return করতে পারে।
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
