import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch09-00-error-handling";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Real-world program-এ error সর্বদাই হয় — file না পাওয়া, network
        timeout, invalid input। Rust-এ error handle করার দু'টা পথ:
      </p>
      <p class="mt-3">
        <strong>panic!</strong> — unrecoverable error, program সরাসরি stop।
        Bug-এর মতো অবস্থায় ব্যবহার।
      </p>
      <p class="mt-3">
        <strong>Result&lt;T, E&gt;</strong> — recoverable error, caller decide
        করে কী করবে। <code>?</code> operator এই handling-কে অনেক সংক্ষিপ্ত
        করে।
      </p>
      <p class="mt-3">
        শেষ পাঠে — কোন situation-এ panic, কোনটায় Result; এবং type system
        দিয়ে invalid value ঠেকানোর pattern।
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
