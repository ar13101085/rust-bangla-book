import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-01-accepting-command-line-arguments";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Command line argument নেওয়া
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Accepting Command Line Arguments
        </p>
        <p class="mt-3">
          এই অধ্যায়ে আমরা একটা ছোট CLI tool বানাব —{" "}
          <InlineCode>minigrep</InlineCode>। এটা <InlineCode>grep</InlineCode>
          -এর simplified version: file-এর মধ্যে একটা string search করে যেসব
          line-এ পাওয়া যায় সেগুলো print করে। ৬টা পাঠে ধাপে ধাপে এটা গড়ে উঠবে।
          প্রথম পাঠে — command line argument নেওয়া।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Project setup</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new minigrep
$ cd minigrep`}
        />
        <p>লক্ষ্য — এই ভাবে invoke করা:</p>
        <CodeBlock
          lang="bash"
          code={`$ cargo run -- searchstring example-filename.txt`}
        />
        <p>
          <InlineCode>--</InlineCode> cargo-কে বলে দেয় — এর পরের argument
          program-এর জন্য, cargo-র জন্য না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">env::args()</h2>
        <p>
          Standard library-র <InlineCode>std::env::args</InlineCode> command
          line argument-এর iterator return করে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    dbg!(args);
}`}
        />
        <p>
          <InlineCode>.collect()</InlineCode> iterator-কে collection-এ রূপান্তর
          করে। এখানে <InlineCode>Vec&lt;String&gt;</InlineCode> চাই — তাই
          explicit type annotation, না হলে Rust জানে না কোন collection।
        </p>
        <p>চালিয়ে দেখি:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run -- needle haystack
[src/main.rs:5:5] args = [
    "target/debug/minigrep",
    "needle",
    "haystack",
]`}
        />
        <p>
          লক্ষ্য — <InlineCode>args[0]</InlineCode> program-এর নাম! এটা C-এর
          convention; অনেক CLI program নিজের invocation নাম জানতে পারে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Invalid Unicode</h3>
        <p>
          <InlineCode>std::env::args</InlineCode> argument-এ invalid Unicode
          থাকলে panic করে। ঐ case-ও handle করতে চাইলে{" "}
          <InlineCode>std::env::args_os</InlineCode> ব্যবহার করো — যেটা{" "}
          <InlineCode>OsString</InlineCode> দেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Argument-গুলো variable-এ রাখা</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");
}`}
        />
        <p>
          Index 1 query (search string), index 2 file path। Index 0 বাদ —
          সেটা program-এর নাম।
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run -- test sample.txt
Searching for test
In file sample.txt`}
        />
        <p>
          এখনো argument missing হলে error handle করছি না — সেটা পাঠ ১২.৩-এ।
          পরের পাঠে — file-টা open করে content পড়ব।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>std::env::args()</InlineCode> command line iterator;{" "}
            <InlineCode>.collect()</InlineCode> দিয়ে{" "}
            <InlineCode>Vec&lt;String&gt;</InlineCode>।
          </li>
          <li>
            Index 0 program name; user arg index 1 থেকে।
          </li>
          <li>
            <InlineCode>cargo run -- arg1 arg2</InlineCode> দিয়ে cargo-কে arg
            forward।
          </li>
          <li>
            Invalid Unicode-এ <InlineCode>args_os</InlineCode> +{" "}
            <InlineCode>OsString</InlineCode>।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.১: Command line argument নেওয়া · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ env::args(), Vec<String> collect, এবং minigrep project শুরু।",
    },
  ],
};
