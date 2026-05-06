import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-02-reading-a-file";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">File পড়া</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Reading a File</p>
        <p class="mt-3">
          এখন file path-টা use করে file-এর content পড়ে print করব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Test file — poem.txt</h2>
        <p>
          Project root-এ <InlineCode>poem.txt</InlineCode> বানাও — Emily
          Dickinson-এর কবিতা (multi-line, repeated word — search-এর জন্য
          ভালো test):
        </p>
        <CodeBlock
          lang="text"
          filename="poem.txt"
          code={`I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!`}
        />

        <h2 class="mt-10 text-2xl font-bold">fs::read_to_string</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\\n{contents}");
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>use std::fs</InlineCode> — file system module।
          </li>
          <li>
            <InlineCode>fs::read_to_string(path)</InlineCode>{" "}
            <InlineCode>Result&lt;String, io::Error&gt;</InlineCode> return
            করে।
          </li>
          <li>
            <InlineCode>.expect(...)</InlineCode> — fail হলে message সহ panic।
          </li>
        </ul>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run -- the poem.txt
Searching for the
In file poem.txt
With text:
I'm nobody! Who are you?
Are you nobody, too?
... (পুরো কবিতা)`}
        />

        <h2 class="mt-10 text-2xl font-bold">এই code-এর সমস্যা</h2>
        <p>
          কাজ করছে, কিন্তু কয়েকটা issue:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>main</InlineCode>-এ অনেক responsibility — arg parse,
            file read, print। বড় হলে maintain কঠিন।
          </li>
          <li>
            Error message generic, user-friendly না।
          </li>
          <li>
            Argument count check নেই — missing হলে cryptic panic।
          </li>
        </ul>
        <p>
          পরের পাঠে refactor করব — modular এবং proper error handling সহ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>fs::read_to_string(path)</InlineCode> — পুরো file
            content একটা <InlineCode>String</InlineCode>-এ।
          </li>
          <li>
            Return type <InlineCode>Result</InlineCode> —{" "}
            <InlineCode>.expect()</InlineCode> দিয়ে handle।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.২: File পড়া · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ fs::read_to_string দিয়ে file-এর content পড়া — minigrep-এর দ্বিতীয় ধাপ।",
    },
  ],
};
