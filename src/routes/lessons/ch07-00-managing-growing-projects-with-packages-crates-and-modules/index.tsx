import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChapterIntro } from "~/components/chapter-intro/chapter-intro";
import { findLesson } from "~/data/toc";

const slug = "ch07-00-managing-growing-projects-with-packages-crates-and-modules";

export default component$(() => {
  return (
    <ChapterIntro slug={slug}>
      <p>
        Project যখন বড় হতে থাকে — code-কে file-এ ছড়াতে হয়, কী public আর কী
        internal সেটা ঠিক করতে হয়, একই project-এর মধ্যে একাধিক binary বা
        library রাখতে হয়। Rust-এর module system এসব handle করে।
      </p>
      <p class="mt-3">
        এই অধ্যায়ে চারটা concept — <strong>package</strong> (Cargo project),{" "}
        <strong>crate</strong> (compile unit, binary বা library),{" "}
        <strong>module</strong> (scope ও privacy), এবং{" "}
        <strong>path</strong> (module tree-তে item refer করা)। শেষে module-কে
        আলাদা file-এ split করার convention।
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
