import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch15-00-smart-pointers";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Reference (<code>&</code>) Rust-এর সবচেয়ে সাধারণ pointer। কিন্তু
        standard library-তে আরও কিছু "smart pointer" আছে — যেগুলো
        reference-এর সাথে অতিরিক্ত capability যোগ করে: heap allocation,
        reference counting, runtime borrow checking।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে — <code>Box&lt;T&gt;</code> দিয়ে heap allocation,{" "}
        <code>Deref</code> এবং <code>Drop</code> trait, multi-owner-এর জন্য{" "}
        <code>Rc&lt;T&gt;</code>, runtime mutable borrow-এর জন্য{" "}
        <code>RefCell&lt;T&gt;</code>, এবং reference cycle থেকে সৃষ্ট
        memory leak কীভাবে চিহ্নিত করব।
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
