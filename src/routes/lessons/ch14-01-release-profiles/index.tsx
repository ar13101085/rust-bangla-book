import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch14-01-release-profiles";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৪.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Release profile দিয়ে build customize করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Customizing Builds with Release Profiles
        </p>
        <p class="mt-3">
          Rust-এ <strong>release profile</strong> হলো predefined, customizable
          configuration — compilation-এর behaviour নিয়ন্ত্রণ করতে কাজে লাগে।
          প্রতিটা profile আলাদা ভাবে configure করা যায়, তাই development আর
          production-এর প্রয়োজন আলাদা ভাবে পূরণ করা সহজ।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">দু'টা main profile</h2>
        <p>
          Cargo দু'টা profile default-এ দেয়:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>dev</InlineCode> — <InlineCode>cargo build</InlineCode>{" "}
            run করলে এটাই use হয়। Development-এর জন্য ভালো default।
          </li>
          <li>
            <InlineCode>release</InlineCode> —{" "}
            <InlineCode>cargo build --release</InlineCode> run করলে use হয়।
            Production build-এর জন্য optimize।
          </li>
        </ul>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.00s

$ cargo build --release
    Finished \`release\` profile [optimized] target(s) in 0.32s`}
        />
        <p>
          Output-এ Cargo লেখে কোন profile ব্যবহৃত হলো — "unoptimized + debuginfo"
          মানে dev, "optimized" মানে release।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Default settings</h2>
        <p>
          Cargo-র প্রতিটা profile-এর জন্য default settings থাকে। তুমি{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ{" "}
          <InlineCode>[profile.*]</InlineCode> section না দিলে এই default-গুলোই
          apply হবে। প্রয়োজনে যেকোনো subset override করা যায়।
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3`}
        />

        <h2 class="mt-10 text-2xl font-bold">opt-level</h2>
        <p>
          <InlineCode>opt-level</InlineCode> setting controls Rust কতটা
          optimization apply করবে। Range — <strong>0 থেকে 3</strong>।
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>opt-level = 0</InlineCode> (dev) — কম optimization।
            Compile fast, কিন্তু runtime ধীর।
          </li>
          <li>
            <InlineCode>opt-level = 3</InlineCode> (release) — maximum
            optimization। Compile সময় বেশি, কিন্তু runtime fast।
          </li>
        </ul>
        <p>
          কেন এই difference? — Development-এ আমরা বার বার compile করি, তাই
          compile fast হওয়া দরকার। Release build একবার করেই অনেক বার run হয়,
          তাই compile-এ বেশি সময় ক্ষতি না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Default override করা</h2>
        <p>
          Default-এর কোনো setting পছন্দ না হলে{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ override করো। যেমন — dev-এ একটু
          বেশি optimization চাইলে:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[profile.dev]
opt-level = 1`}
        />
        <p>
          এতে <InlineCode>cargo build</InlineCode> run করলে Cargo dev-এর সব
          default নেবে, শুধু <InlineCode>opt-level</InlineCode>{" "}
          <InlineCode>1</InlineCode> হিসেবে use করবে। Default 0 থেকে বেশি
          optimization, কিন্তু release-এর 3-এর চেয়ে কম।
        </p>
        <p>
          সব configuration option আর default-এর পুরো list — Cargo-র official
          documentation-এ (cargo reference profiles) দেখা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Cargo-র দু'টা main profile — <InlineCode>dev</InlineCode> (default){" "}
            আর <InlineCode>release</InlineCode> (
            <InlineCode>--release</InlineCode> flag-এ)।
          </li>
          <li>
            প্রতিটা profile-এর independent default — না দিলে Cargo সেগুলোই use
            করে।
          </li>
          <li>
            <InlineCode>opt-level</InlineCode> 0–3 — dev-এ 0 (fast compile),
            release-এ 3 (fast runtime)।
          </li>
          <li>
            <InlineCode>[profile.dev]</InlineCode> বা{" "}
            <InlineCode>[profile.release]</InlineCode> দিয়ে যেকোনো subset
            override করা যায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৪.১: Release profile দিয়ে build customize · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Cargo-র dev আর release profile, opt-level, এবং Cargo.toml-এ profile customize করা।",
    },
  ],
};
