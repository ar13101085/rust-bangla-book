import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch01-00-getting-started";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Rust শেখা শুরু করি এই অধ্যায় দিয়ে। আমরা প্রথমে{" "}
        <strong>rustup</strong> দিয়ে Rust toolchain install করব — Linux,
        macOS, এবং Windows তিন platform-এই। তারপর প্রথম "Hello, World!"
        program লিখে compile ও run করব।
      </p>
      <p class="mt-3">
        শেষে দেখব <strong>Cargo</strong> — Rust-এর build system এবং package
        manager। বাস্তব Rust project-এ এটাই project structure manage করে,
        dependency download করে, এবং build চালায়।
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
