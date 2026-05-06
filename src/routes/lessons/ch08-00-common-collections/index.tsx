import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch08-00-common-collections";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Rust-এর standard library-তে কিছু সাধারণ collection আছে যেগুলো heap-এ
        data রাখে এবং runtime-এ size বদলাতে পারে — array এবং tuple-এর চেয়ে
        flexible।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে তিনটা সবচেয়ে common collection দেখব —{" "}
        <strong>Vec</strong> (একই type-এর growable list),{" "}
        <strong>String</strong> (UTF-8 encoded text), এবং{" "}
        <strong>HashMap</strong> (key-value mapping)। প্রতিটার তৈরি, update,
        access pattern এবং কখন কোনটা ব্যবহার করব — সব একসাথে।
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
