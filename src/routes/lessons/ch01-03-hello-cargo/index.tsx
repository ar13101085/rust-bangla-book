import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch01-03-hello-cargo";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Hello, Cargo!</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Hello, Cargo!</p>
        <p class="mt-3">
          আগের পাঠে <InlineCode>rustc</InlineCode> দিয়ে সরাসরি একটা file
          compile করেছিলাম। কিন্তু real-world Rust project-এ সবাই{" "}
          <strong>Cargo</strong> ব্যবহার করে। Cargo হলো Rust-এর{" "}
          <em>build system এবং package manager</em> — code build করা, dependency
          download করা, dependency-গুলো build করা — সব এই একটা tool-ই করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Cargo install আছে কিনা check করো</h2>
        <p>
          rustup দিয়ে Rust install করলে Cargo স্বয়ংক্রিয়ভাবে install হয়।
          নিশ্চিত হতে এই command চালাও:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo --version`}
        />
        <p>
          version number দেখলে বুঝবে install আছে। না থাকলে আগের পাঠে ফিরে গিয়ে
          rustup install করে নাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Cargo দিয়ে নতুন project</h2>
        <p>
          নতুন একটা project বানাতে <InlineCode>cargo new</InlineCode> use করো:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new hello_cargo
$ cd hello_cargo`}
        />
        <p>
          এই command একটা <InlineCode>hello_cargo</InlineCode> নামের folder
          তৈরি করে। ভিতরে গিয়ে <InlineCode>ls</InlineCode> (Linux/macOS) বা{" "}
          <InlineCode>dir</InlineCode> (Windows) চালালে দেখবে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Cargo.toml</InlineCode> — project-এর configuration
            file।
          </li>
          <li>
            <InlineCode>src/</InlineCode> — source code-এর folder, ভিতরে একটা{" "}
            <InlineCode>main.rs</InlineCode> file।
          </li>
          <li>
            একটা <InlineCode>.gitignore</InlineCode> file এবং নতুন একটা git
            repository initialize হয়েছে।
          </li>
        </ul>
        <p>
          তুমি যদি আগে থেকেই কোনো git repo-এর ভিতরে থাকো, তাহলে cargo নতুন repo
          বানাবে না। অন্য VCS use করতে চাইলে{" "}
          <InlineCode>cargo new --vcs=git</InlineCode> বা{" "}
          <InlineCode>--vcs=none</InlineCode> flag দিতে পারো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Cargo.toml-এ কী আছে</h2>
        <p>
          <InlineCode>Cargo.toml</InlineCode> file খুললে এই content দেখবে:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]`}
        />
        <p>
          <InlineCode>.toml</InlineCode> extension-টা TOML format-এর জন্য —
          Cargo এই format-এ configuration লেখে। এখানে দুটো section আছে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>[package]</InlineCode> — তোমার package-এর metadata:
            নাম, version, এবং কোন Rust <strong>edition</strong> use করছ
            (edition নিয়ে বিস্তারিত Appendix E-তে)।
          </li>
          <li>
            <InlineCode>[dependencies]</InlineCode> — অন্য যেসব crate-এর উপর
            তোমার project depend করবে, সেগুলো এখানে list করবে। Rust-এ
            library-কে <strong>crate</strong> বলে।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">src/main.rs-এ কী আছে</h2>
        <p>
          <InlineCode>src/main.rs</InlineCode> খুলে দেখো — Cargo default-এ একটা
          "Hello, world!" program তৈরি করে দিয়েছে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    println!("Hello, world!");
}`}
        />
        <p>
          লক্ষ্য করো — সব source file <InlineCode>src/</InlineCode> folder-এ
          থাকে। Top-level folder (যেখানে <InlineCode>Cargo.toml</InlineCode>{" "}
          আছে) শুধু README, license, এবং অন্যান্য configuration-এর জন্য। এই
          structure প্রায় সব Rust project-এই follow করা হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Project build করা</h2>
        <p>Project folder-এর ভিতরে থেকে এই command চালাও:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 2.85 secs`}
        />
        <p>
          এটা executable file বানায়{" "}
          <InlineCode>target/debug/hello_cargo</InlineCode>-তে (Windows-এ{" "}
          <InlineCode>target\\debug\\hello_cargo.exe</InlineCode>)। Default
          build হলো <em>debug</em> build — দ্রুত compile হয়, কিন্তু optimization
          কম।
        </p>
        <p>
          প্রথমবার build করলে Cargo top-level-এ একটা{" "}
          <InlineCode>Cargo.lock</InlineCode> file তৈরি করে — এটা তোমার
          dependency-গুলোর exact version track করে। এই file Cargo নিজেই manage
          করে, তোমাকে কখনো hand-edit করতে হবে না।
        </p>
        <p>Binary সরাসরি execute করতে:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ ./target/debug/hello_cargo
Hello, world!`}
        />

        <h2 class="mt-10 text-2xl font-bold">cargo run — build + execute এক command-এ</h2>
        <p>
          সাধারণত আমরা build আর execute একসাথেই করি। Cargo-এ এর জন্য একটা
          shortcut আছে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running \`target/debug/hello_cargo\`
Hello, world!`}
        />
        <p>
          লক্ষ্য করো — দ্বিতীয় বার <InlineCode>cargo run</InlineCode> চালানোয়
          Cargo "Compiling" message দেখায়নি। কারণ source file পরিবর্তন হয়নি,
          তাই recompile করার দরকার নেই। File-এ change করলে আবার compile হবে,
          তারপর run।
        </p>
        <p>
          বেশিরভাগ Rust developer development-এর সময়{" "}
          <InlineCode>cargo run</InlineCode> ব্যবহার করে — দু'টো command মনে
          রাখার চেয়ে একটাই simpler।
        </p>

        <h2 class="mt-10 text-2xl font-bold">cargo check — দ্রুত compile-error পরীক্ষা</h2>
        <p>
          লেখার সময় বারবার <InlineCode>cargo build</InlineCode> চালালে slow
          লাগতে পারে — কারণ executable বানানো একটা সময়সাপেক্ষ step। শুধু "code
          compile হয় কিনা" check করতে চাইলে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo check
   Checking hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs`}
        />
        <p>
          <InlineCode>cargo check</InlineCode> compile করে কিন্তু executable
          produce করে না — তাই অনেক দ্রুত। লিখতে লিখতে বারবার এটা চালাতে পারো,
          আর যখন আসলে run করতে হবে তখন <InlineCode>cargo build</InlineCode> বা{" "}
          <InlineCode>cargo run</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Release build</h2>
        <p>
          Project শেষ করে যখন end-user-কে দেওয়ার মতো optimized binary দরকার,
          তখন:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build --release`}
        />
        <p>
          এটা optimization on করে compile করে, এবং binary রাখে{" "}
          <InlineCode>target/release/</InlineCode>-এ (debug-এ না)। Compile time
          বেশি, কিন্তু resulting binary অনেক fast। Performance benchmark করতে
          চাইলে সবসময় release build use করবে — debug build-এর number
          misleading।
        </p>
        <p>সংক্ষেপে:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>dev profile</strong> — দ্রুত rebuild, frequent compile-এর
            জন্য।
          </li>
          <li>
            <strong>release profile</strong> — optimization on, end-user-এর
            জন্য।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Existing project-কে Cargo-এ আনা</h2>
        <p>
          আগে থেকে যদি এমন কোনো Rust project থাকে যেটা cargo দিয়ে শুরু করা হয়নি,
          সেটাকেও cargo-এ convert করা যায়:
        </p>
        <ol class="ml-6 list-decimal space-y-1">
          <li>সব source file <InlineCode>src/</InlineCode> folder-এ সরাও।</li>
          <li>
            উপযুক্ত <InlineCode>Cargo.toml</InlineCode> file লেখো — অথবা cargo
            নিজেই বানিয়ে দিতে পারে:
          </li>
        </ol>
        <CodeBlock lang="bash" filename="terminal" code={`$ cargo init`} />
        <p>
          <InlineCode>cargo init</InlineCode> current folder-কেই project হিসেবে
          treat করে, নতুন folder বানায় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">যেকোনো Rust project-এ এটা কাজ করে</h2>
        <p>
          Cargo-এর সবচেয়ে বড় সুবিধা — সব Rust project-এই একই command কাজ করে।
          GitHub থেকে কারো project clone করে এনেছ?
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ git clone example.org/someproject
$ cd someproject
$ cargo build`}
        />
        <p>
          ব্যাস। Linux, macOS, Windows — সবখানে একই command, একই behavior।
          Cargo-এর full documentation আছে{" "}
          <a
            href="https://doc.rust-lang.org/cargo/"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            doc.rust-lang.org/cargo/
          </a>
          -এ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Cargo</strong> = Rust-এর build system + package manager।
          </li>
          <li>
            <InlineCode>cargo new {`<name>`}</InlineCode> দিয়ে নতুন project,{" "}
            <InlineCode>cargo init</InlineCode> দিয়ে existing folder-কে project
            করা।
          </li>
          <li>
            <InlineCode>Cargo.toml</InlineCode> — TOML format-এ
            metadata/dependency; <InlineCode>src/</InlineCode>-এ source code।
          </li>
          <li>
            <InlineCode>cargo build</InlineCode> — compile (debug,
            target/debug); <InlineCode>cargo run</InlineCode> — compile +
            execute; <InlineCode>cargo check</InlineCode> — শুধু check,
            executable নেই।
          </li>
          <li>
            <InlineCode>cargo build --release</InlineCode> — optimized build,
            target/release-এ।
          </li>
          <li>
            Rust-এ library-কে <strong>crate</strong> বলে — dependency-গুলো
            crate।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১.৩: Hello, Cargo! · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Cargo দিয়ে Rust project তৈরি, build, এবং run — cargo new, cargo build, cargo run, cargo check।",
    },
  ],
};
