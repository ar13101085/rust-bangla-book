#!/usr/bin/env node
// One-shot generator: scans src/data/toc.ts, creates a stub route file for every
// lesson slug that doesn't already have one. Re-runnable; never overwrites existing files.

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const tocPath = resolve(root, "src/data/toc.ts");
const routesDir = resolve(root, "src/routes/lessons");

const tocSrc = readFileSync(tocPath, "utf8");

// Pull every `slug: "..."` literal from toc.ts. Order is preserved by the regex scan.
const slugRe = /slug:\s*"([^"]+)"/g;
const slugs = [...tocSrc.matchAll(slugRe)].map((m) => m[1]);

let created = 0;
for (const slug of slugs) {
  const file = resolve(routesDir, slug, "index.tsx");
  if (existsSync(file)) continue;
  mkdirSync(dirname(file), { recursive: true });
  const body = `import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { StubLesson } from "~/components/stub-lesson/stub-lesson";
import { findLesson } from "~/data/toc";

const slug = "${slug}";

export default component$(() => {
  return <StubLesson slug={slug} />;
});

export const head: DocumentHead = () => {
  const lesson = findLesson(slug);
  return {
    title: lesson
      ? \`\${lesson.num} \${lesson.titleBn} · বাংলায় Rust\`
      : "বাংলায় Rust",
  };
};
`;
  writeFileSync(file, body);
  created++;
}

console.log(`Generated ${created} stub(s) (${slugs.length - created} already existed).`);
