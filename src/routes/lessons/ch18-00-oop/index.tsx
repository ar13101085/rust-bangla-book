import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch18-00-oop";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Rust সরাসরি object-oriented language না (no classes, no inheritance),
        কিন্তু OO-এর প্রায় সব practical pattern Rust-এ struct, enum, এবং
        trait দিয়ে করা যায়।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে — OO-এর বৈশিষ্ট্যগুলো (encapsulation, polymorphism)
        Rust-এ কীভাবে আসে, runtime polymorphism-এর জন্য{" "}
        <strong>trait object</strong> (<code>Box&lt;dyn Trait&gt;</code>),
        এবং একটা classic OO design pattern (state pattern) Rust-এ কীভাবে
        implement করব — দু'রকম approach-এ।
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
