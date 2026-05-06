import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch19-00-patterns";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Pattern Rust জুড়ে ছড়ানো — <code>let</code> binding, function
        parameter, <code>match</code> arm, <code>if let</code>,{" "}
        <code>while let</code>, <code>for</code> loop। এতদূর use করেই এসেছি,
        কিন্তু systematic-ভাবে দেখা হয়নি।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে — pattern কোথায় কোথায় valid, <strong>refutable</strong>{" "}
        বনাম <strong>irrefutable</strong> pattern-এর পার্থক্য, এবং Rust-এর
        সম্পূর্ণ pattern syntax (literal, range, destructure, guard, binding,
        ইত্যাদি)।
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
