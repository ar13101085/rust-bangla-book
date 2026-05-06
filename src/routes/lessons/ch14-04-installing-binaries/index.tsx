import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch14-04-installing-binaries";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৪.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          cargo install দিয়ে binary install করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Installing Binaries with cargo install
        </p>
        <p class="mt-3">
          <InlineCode>cargo install</InlineCode> command দিয়ে crates.io-তে
          shared binary crate locally install করা যায় — অন্যদের লেখা useful
          tool নিজের machine-এ চটজলদি বসানোর সহজ উপায়। এটা system package
          manager-এর বিকল্প না, বরং Rust ecosystem-এর tool share করার ব্যবস্থা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Binary target কী</h2>
        <p>
          <InlineCode>cargo install</InlineCode>{" "}
          শুধু <strong>binary target</strong>-যুক্ত package install করতে পারে।
          Binary target মানে — একটা runnable program; crate-এ{" "}
          <InlineCode>src/main.rs</InlineCode> থাকে বা অন্য কোনো file binary
          হিসেবে specified থাকে।
        </p>
        <p>
          অপরদিকে library target নিজে চালানো যায় না, কিন্তু অন্য program-এর
          মধ্যে include করা যায়। সাধারণত crate-এর README-তে লেখা থাকে এটা
          library, binary, নাকি দু'টোই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কোথায় install হয়</h2>
        <p>
          <InlineCode>cargo install</InlineCode>-এর সব binary installation
          root-এর <InlineCode>bin</InlineCode> folder-এ যায়। Rust যদি{" "}
          <em>rustup.rs</em> দিয়ে install করো এবং custom config না থাকে — তাহলে
          সেটা:
        </p>
        <CodeBlock lang="text" code={`$HOME/.cargo/bin`} />
        <p>
          গুরুত্বপূর্ণ — এই directory তোমার <InlineCode>$PATH</InlineCode>-এ
          থাকতেই হবে, না হলে install-করা program command line থেকে চালাতে পারবে
          না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">উদাহরণ — ripgrep install</h2>
        <p>
          <InlineCode>ripgrep</InlineCode> file search-এর জন্য{" "}
          <InlineCode>grep</InlineCode>-এর Rust-এ লেখা fast, ergonomic বিকল্প।
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo install ripgrep
    Updating crates.io index
  Downloaded ripgrep v14.1.1
  Downloaded 1 crate (213.6 KB) in 0.40s
  Installing ripgrep v14.1.1
--snip--
   Compiling grep v0.3.2
    Finished \`release\` profile [optimized + debuginfo] target(s) in 6.73s
  Installing ~/.cargo/bin/rg
   Installed package \`ripgrep v14.1.1\` (executable \`rg\`)`}
        />
        <p>
          লক্ষ করো — output-এর শেষ লাইন বলছে binary{" "}
          <InlineCode>rg</InlineCode> install হয়েছে{" "}
          <InlineCode>~/.cargo/bin/rg</InlineCode>-তে। Path setup ঠিক থাকলে
          সরাসরি run:
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ rg --help`} />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>cargo install &lt;crate&gt;</InlineCode> — crates.io
            থেকে binary tool নিজের system-এ install।
          </li>
          <li>
            শুধু binary target-যুক্ত crate install করা যায় — library only crate
            না।
          </li>
          <li>
            Default install path —{" "}
            <InlineCode>$HOME/.cargo/bin</InlineCode>। সেটা{" "}
            <InlineCode>$PATH</InlineCode>-এ থাকা চাই।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৪.৪: cargo install দিয়ে binary install · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "cargo install দিয়ে crates.io-র binary tool locally install করা; ~/.cargo/bin আর PATH।",
    },
  ],
};
