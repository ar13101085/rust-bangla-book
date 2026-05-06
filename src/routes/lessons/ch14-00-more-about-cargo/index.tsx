import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch14-00-more-about-cargo";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        এতদূর Cargo-র basic feature ব্যবহার করেছি —{" "}
        <code>cargo new</code>, <code>cargo build</code>,{" "}
        <code>cargo run</code>, <code>cargo test</code>। এই অধ্যায়ে Cargo-র
        আরও advanced দিক দেখব।
      </p>
      <p class="mt-3">
        Release profile দিয়ে compile customize করা, crate-কে{" "}
        <code>crates.io</code>-তে publish করা, একই project-এ একাধিক crate রাখার
        জন্য workspace, system-wide binary install, এবং custom command দিয়ে
        Cargo-কে extend করা — পাঁচটা topic।
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
