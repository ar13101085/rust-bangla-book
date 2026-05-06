import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch07-02-defining-modules-to-control-scope-and-privacy";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৭.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Module দিয়ে scope ও privacy control করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Defining Modules to Control Scope and Privacy
        </p>
        <p class="mt-3">
          <strong>Module</strong> related code-কে group করে, এবং কী public আর
          কী private সেটা নির্ধারণ করে। এই পাঠে module declare করা, file-এ
          extend করা, এবং module tree-এর কাঠামো দেখব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Module cheat sheet</h2>
        <p>সংক্ষেপে Rust-এর module system এই কয়েকটা rule-এ চলে:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Crate root থেকে শুরু:</strong> compile-এর সময় Rust{" "}
            <InlineCode>src/lib.rs</InlineCode> বা{" "}
            <InlineCode>src/main.rs</InlineCode>-এ প্রথমে যায়।
          </li>
          <li>
            <strong>Module declare:</strong> crate root-এ{" "}
            <InlineCode>mod garden;</InlineCode> লিখলে compiler module-এর
            content খুঁজবে — (১) inline curly bracket-এ, (২){" "}
            <InlineCode>src/garden.rs</InlineCode>-এ, বা (৩){" "}
            <InlineCode>src/garden/mod.rs</InlineCode>-এ।
          </li>
          <li>
            <strong>Submodule declare:</strong>{" "}
            <InlineCode>src/garden.rs</InlineCode>-এ{" "}
            <InlineCode>mod vegetables;</InlineCode> দিলে compiler খুঁজবে — (১)
            inline, (২) <InlineCode>src/garden/vegetables.rs</InlineCode>-এ,
            (৩) <InlineCode>src/garden/vegetables/mod.rs</InlineCode>-এ।
          </li>
          <li>
            <strong>Path:</strong> এক crate-এর যেকোনো জায়গা থেকে module-এর
            item-কে refer করা যায় path দিয়ে — যেমন{" "}
            <InlineCode>crate::garden::vegetables::Asparagus</InlineCode>।
          </li>
          <li>
            <strong>Private vs public:</strong> Module-এর code default-এ parent
            থেকে private। <InlineCode>pub mod</InlineCode> বা{" "}
            <InlineCode>pub</InlineCode> দিয়ে public।
          </li>
          <li>
            <strong>use keyword:</strong> Long path-এর shortcut বানাতে।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Backyard example</h2>
        <p>Directory structure:</p>
        <CodeBlock
          lang="text"
          code={`backyard
├── Cargo.lock
├── Cargo.toml
└── src
    ├── garden
    │   └── vegetables.rs
    ├── garden.rs
    └── main.rs`}
        />
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use crate::garden::vegetables::Asparagus;

pub mod garden;

fn main() {
    let plant = Asparagus {};
    println!("I'm growing {plant:?}!");
}`}
        />
        <CodeBlock
          lang="rust"
          filename="src/garden.rs"
          code={`pub mod vegetables;`}
        />
        <CodeBlock
          lang="rust"
          filename="src/garden/vegetables.rs"
          code={`#[derive(Debug)]
pub struct Asparagus {}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Restaurant — main example</h2>
        <p>
          এই পাঠের পরের অংশে আমরা একটা restaurant library use করব। নতুন project:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new restaurant --lib`}
        />
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}`}
        />
        <p>
          <InlineCode>mod</InlineCode> keyword + module-এর নাম + curly
          bracket-এ body। Module-এর ভিতরে আরও module রাখা যায় (নেস্টেড)। এছাড়া
          struct, enum, constant, trait, function — সব রাখা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Module tree</h2>
        <p>উপরের code-এর module tree:</p>
        <CodeBlock
          lang="text"
          code={`crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment`}
        />
        <p>
          Hierarchical structure — এর ভিতরে যেগুলো same level-এ, সেগুলো{" "}
          <strong>sibling</strong>; ভিতরের module <strong>child</strong>,
          বাইরেরটা <strong>parent</strong>। সবার উপরে implicit{" "}
          <InlineCode>crate</InlineCode> module।
        </p>
        <p>
          এটা অনেকটা filesystem-এর মতো — হোম directory-র ভিতরে folder, তার
          ভিতরে folder। পরের পাঠে দেখব এদের refer করতে path use করা হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>mod name {`{...}`}</InlineCode> দিয়ে module declare —
            inline বা separate file।
          </li>
          <li>
            File-এ ছড়াতে — <InlineCode>mod name;</InlineCode> declare,{" "}
            compiler <InlineCode>name.rs</InlineCode> বা{" "}
            <InlineCode>name/mod.rs</InlineCode>-এ খুঁজবে।
          </li>
          <li>
            Module tree — crate root থেকে শুরু, parent/child/sibling relationship।
          </li>
          <li>
            Default-এ module private; <InlineCode>pub</InlineCode> দিয়ে public।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৭.২: Module দিয়ে scope ও privacy control · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ module declare, nested module, module tree, এবং private/public-এর basic।",
    },
  ],
};
