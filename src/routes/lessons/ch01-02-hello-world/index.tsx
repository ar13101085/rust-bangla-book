import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch01-02-hello-world";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Hello, World!</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Hello, World!</p>
        <p class="mt-3">
          Rust install করা, প্রথম program লেখা, এবং{" "}
          <InlineCode>cargo</InlineCode> দিয়ে compile ও run করানো।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Rust কী এবং কেন?</h2>
        <p>
          <strong>Rust</strong> হলো একটি <em>systems programming language</em> —
          মানে এটা দিয়ে operating system, browser engine, embedded device, কিংবা
          high-performance server লেখা যায়। Rust-এর মূল আকর্ষণ হলো এর{" "}
          <InlineCode>ownership</InlineCode> system, যেটি memory safety
          নিশ্চিত করে garbage collector ছাড়াই।
        </p>
        <p>
          C++ থেকে আসলে তুমি দেখবে Rust অনেক চেনা — pointer, reference,
          generic, trait — কিন্তু compile-time-এ এত strict checking যে data
          race বা use-after-free-এর মতো bug runtime-এ পৌঁছায়ই না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Rust install করা</h2>
        <p>
          সবচেয়ে সহজ উপায় হলো <strong>rustup</strong>। তোমার terminal-এ এই
          command চালাও:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`}
        />
        <p>
          Install শেষ হলে নতুন একটা terminal খুলে check করো —{" "}
          <InlineCode>rustc</InlineCode> হলো Rust compiler আর{" "}
          <InlineCode>cargo</InlineCode> হলো Rust-এর build tool ও package
          manager:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`rustc --version
cargo --version`}
        />

        <h2 class="mt-10 text-2xl font-bold">প্রথম project</h2>
        <p>
          নতুন একটা project বানাতে <InlineCode>cargo new</InlineCode> ব্যবহার
          করো:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`cargo new hello_world
cd hello_world`}
        />
        <p>
          এই command একটা folder তৈরি করবে যেখানে দুটো জিনিস আছে —{" "}
          <InlineCode>Cargo.toml</InlineCode> (project-এর metadata ও dependency
          list) আর <InlineCode>src/main.rs</InlineCode> (তোমার source code)।
          ভিতরে গিয়ে <InlineCode>src/main.rs</InlineCode> খুলে দেখো:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    println!("Hello, world!");
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Code-টা ভেঙে বুঝি</h2>
        <p>
          <InlineCode>fn</InlineCode> keyword দিয়ে আমরা একটা <em>function</em>{" "}
          declare করি। এখানে function-এর নাম <InlineCode>main</InlineCode> —
          এটা একটা special function, কারণ Rust program সবসময় এখান থেকেই execute
          শুরু হয়।
        </p>
        <p>
          <InlineCode>println!</InlineCode>-এর শেষে যে{" "}
          <InlineCode>!</InlineCode> দেখছ, এটা বোঝায় এটি একটা{" "}
          <strong>macro</strong>, function না। macro হলো compile-time-এ চালানো
          code-generation tool। আপাতত এটুকু জানাই যথেষ্ট — পরের পাঠে আমরা
          macro নিয়ে বিস্তারিত আলোচনা করব।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Build ও run</h2>
        <p>
          <InlineCode>cargo run</InlineCode> দিলেই compile হবে এবং program
          execute হবে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run
   Compiling hello_world v0.1.0 (/path/to/hello_world)
    Finished dev [unoptimized + debuginfo] target(s) in 1.23s
     Running \`target/debug/hello_world\`
Hello, world!`}
        />
        <p>
          শুধু compile করতে চাইলে <InlineCode>cargo build</InlineCode>, আর
          production-এর জন্য optimized binary বানাতে{" "}
          <InlineCode>cargo build --release</InlineCode>। Release build অনেক
          fast হয়, কিন্তু compile সময় বেশি লাগে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>rustup</InlineCode> দিয়ে Rust toolchain install করা
          </li>
          <li>
            <InlineCode>cargo new</InlineCode> দিয়ে নতুন project তৈরি করা
          </li>
          <li>
            <InlineCode>fn main()</InlineCode> হলো program-এর entry point
          </li>
          <li>
            <InlineCode>println!</InlineCode> একটা macro — তাই শেষে{" "}
            <InlineCode>!</InlineCode>
          </li>
          <li>
            <InlineCode>cargo run</InlineCode>, <InlineCode>cargo build</InlineCode>,{" "}
            <InlineCode>cargo build --release</InlineCode>
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১.২: Hello, World! · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust install করা, প্রথম program লেখা এবং cargo দিয়ে run করানো।",
    },
  ],
};
