import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { StubLesson } from "~/components/stub-lesson/stub-lesson";
import { findLesson } from "~/data/toc";

const slug = "ch03-00-common-programming-concepts";

export default component$(() => {
  return <StubLesson slug={slug} />;
});

export const head: DocumentHead = () => {
  const lesson = findLesson(slug);
  return {
    title: lesson
      ? `${lesson.num} ${lesson.titleBn} · বাংলায় Rust`
      : "বাংলায় Rust",
  };
};
