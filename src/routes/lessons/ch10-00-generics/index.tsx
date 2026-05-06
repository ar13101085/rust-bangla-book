import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch10-00-generics";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        কোনো logic একই — শুধু type আলাদা — এই duplication এড়ানোর জন্য{" "}
        <strong>generic</strong>। সেই generic-এ কী কী operation allowed সেটা
        বলার জন্য <strong>trait</strong>। আর reference-গুলো কতদূর valid সেটা
        compile time-এ verify করার জন্য <strong>lifetime</strong>।
      </p>
      <p class="mt-3">
        এই তিনটা feature Rust-এর type system-এর মেরুদণ্ড। ownership-এর
        চেয়েও দ্বিতীয় বড় mental shift। তিন পাঠে এক এক করে দেখব। শেষে
        এদের একসাথে ব্যবহার।
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
