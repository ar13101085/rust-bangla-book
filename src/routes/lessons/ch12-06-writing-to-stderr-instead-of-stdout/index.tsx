import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-06-writing-to-stderr-instead-of-stdout";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.৬
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Error-গুলোকে standard error-এ পাঠানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Writing Error Messages to Standard Error Instead of Standard Output
        </p>
        <p class="mt-3">
          এতদূর সব output আমরা <InlineCode>println!</InlineCode> দিয়ে print
          করছি — যেটা <strong>standard output (stdout)</strong>-এ যায়। কিন্তু
          terminal-এ আরেকটা stream আছে — <strong>standard error (stderr)</strong>
          । Error message stderr-এ পাঠানো প্রথা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">stdout বনাম stderr</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>stdout</strong> — actual program output (search result,
            যেমন)।
          </li>
          <li>
            <strong>stderr</strong> — error message, diagnostic।
          </li>
        </ul>
        <p>
          এই separation-এর সুবিধা — user shell-এ{" "}
          <InlineCode>{">"}</InlineCode> দিয়ে stdout file-এ redirect করতে
          পারে; error তখনো terminal-এ visible থাকবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এখনকার সমস্যা</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run > output.txt`}
        />
        <p>
          কোনো argument দিইনি — error হচ্ছে। কিন্তু error message{" "}
          <InlineCode>println!</InlineCode>-এ আছে, তাই সেটাও{" "}
          <InlineCode>output.txt</InlineCode>-এ redirect হয়ে গেছে। File-এ
          এখন:
        </p>
        <CodeBlock
          lang="text"
          filename="output.txt"
          code={`Problem parsing arguments: not enough arguments`}
        />
        <p>
          User error দেখতে পেল না, file-এ ভুল content। ভুল behavior।
        </p>

        <h2 class="mt-10 text-2xl font-bold">eprintln! macro</h2>
        <p>
          Standard library-এ <InlineCode>eprintln!</InlineCode> macro আছে —{" "}
          <InlineCode>println!</InlineCode>-এর মতোই, কিন্তু stderr-এ লেখে।
          Error case-গুলোতে replace:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::env;
use std::process;

use minigrep::Config;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}`}
        />
        <p>
          লক্ষ্য — শুধু error message-এ <InlineCode>eprintln!</InlineCode>;
          আসল search result <InlineCode>run</InlineCode>-এর ভিতরে{" "}
          <InlineCode>println!</InlineCode>-এই থাকছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এখন behavior</h2>
        <p>Argument ছাড়া (error case):</p>
        <CodeBlock
          lang="bash"
          code={`$ cargo run > output.txt
Problem parsing arguments: not enough arguments`}
        />
        <p>
          Error terminal-এ visible, <InlineCode>output.txt</InlineCode> empty।
          ✓
        </p>
        <p>Valid argument-এ:</p>
        <CodeBlock lang="bash" code={`$ cargo run -- to poem.txt > output.txt`} />
        <CodeBlock
          lang="text"
          filename="output.txt"
          code={`Are you nobody, too?
How dreary to be somebody!`}
        />
        <p>Terminal-এ কিছু না, file-এ শুধু actual result। ✓</p>

        <h2 class="mt-10 text-2xl font-bold">minigrep complete!</h2>
        <p>৬টা পাঠে আমরা যা শিখলাম:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Command line argument-এর iterator।</li>
          <li>File system module-এর read API।</li>
          <li>Modular design — Config struct, run function।</li>
          <li>Error propagation — Result, ?, Box&lt;dyn Error&gt;।</li>
          <li>Library/binary split।</li>
          <li>Test driven development — failing test থেকে শুরু।</li>
          <li>Lifetime in real-world function signature।</li>
          <li>Environment variable reading।</li>
          <li>stdout বনাম stderr।</li>
        </ul>
        <p>
          ছোট হলেও — এই project-এ Rust-এর প্রায় সব core feature use হয়েছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            stdout = actual output, stderr = error/diagnostic।
          </li>
          <li>
            <InlineCode>{">"}</InlineCode> redirect শুধু stdout-এ।
          </li>
          <li>
            <InlineCode>eprintln!</InlineCode> stderr-এ — error log-এর জন্য
            convention।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.৬: Error-গুলোকে standard error-এ · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ stdout বনাম stderr এবং eprintln! দিয়ে error stream-এ লেখা।",
    },
  ],
};
