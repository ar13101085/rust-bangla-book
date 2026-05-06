import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch14-05-extending-cargo";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৪.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Custom command দিয়ে Cargo extend করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Extending Cargo with Custom Commands
        </p>
        <p class="mt-3">
          Cargo এমন ভাবেই design করা যাতে নিজের source modify না করেও custom
          subcommand দিয়ে এটাকে extend করা যায়। তুমি বা community-র কেউ একটা
          নতুন tool বানিয়ে cargo-র অংশ মনে হওয়ার মতো integrate করতে পারো।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">কাজের নিয়ম</h2>
        <p>
          Convention খুবই simple — তোমার <InlineCode>$PATH</InlineCode>-এ যদি{" "}
          <InlineCode>cargo-something</InlineCode> নামে কোনো binary থাকে, তুমি
          সেটা cargo-র subcommand হিসেবে চালাতে পারবে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo something`}
        />
        <p>
          Cargo দেখে <InlineCode>$PATH</InlineCode>-এ{" "}
          <InlineCode>cargo-something</InlineCode> binary আছে এবং সেটাই execute
          করে — যেন built-in command ছিল।
        </p>

        <h2 class="mt-10 text-2xl font-bold">দু'টো সুবিধা</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Discoverability</strong> — custom command-গুলো{" "}
            <InlineCode>cargo --list</InlineCode>-এর output-এ দেখা যায়।
          </li>
          <li>
            <strong>Easy install</strong> —{" "}
            <InlineCode>cargo install</InlineCode> দিয়ে extension install করা
            যায়, পরে built-in tool-এর মতোই use:
          </li>
        </ul>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo --list
$ cargo install <custom-command>`}
        />

        <h2 class="mt-10 text-2xl font-bold">কেন এই design গুরুত্বপূর্ণ</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Cargo-র core না বদলেও community নতুন workflow add করতে পারে।
          </li>
          <li>
            Extension cargo-র সাথে seamless integrate হয় — user-এর কাছে
            built-in মনে হয়।
          </li>
          <li>
            <InlineCode>crates.io</InlineCode> +{" "}
            <InlineCode>cargo install</InlineCode>{" "}
            একসাথে — share এবং install দু'টোই trivial।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>$PATH</InlineCode>-এ{" "}
            <InlineCode>cargo-foo</InlineCode> নামে binary থাকলেই{" "}
            <InlineCode>cargo foo</InlineCode> command চালু।
          </li>
          <li>
            <InlineCode>cargo --list</InlineCode>-এ custom subcommand show হয়।
          </li>
          <li>
            <InlineCode>cargo install</InlineCode> দিয়ে custom tool install
            করা যায় — community-র tool ব্যবহার করার সবচেয়ে সহজ পথ।
          </li>
          <li>
            Cargo-র এই extensible design Rust ecosystem-কে অনেক richer করে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৪.৫: Custom command দিয়ে Cargo extend · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "cargo-foo binary দিয়ে custom subcommand বানানো; cargo --list এবং cargo install দিয়ে extension share।",
    },
  ],
};
