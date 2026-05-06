import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch07-05-separating-modules-into-different-files";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৭.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Module-গুলোকে আলাদা file-এ ভাগ করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Separating Modules into Different Files
        </p>
        <p class="mt-3">
          Module বড় হলে এক file-এ সব রাখা inconvenient। Rust সহজ convention
          দেয় — module-কে আলাদা file-এ সরানো। এই পাঠে restaurant example-এর
          module-গুলোকে file-এ split করব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Step 1 — front_of_house আলাদা করা</h2>
        <p>
          <InlineCode>src/lib.rs</InlineCode>-এ module body-র জায়গায় শুধু
          declaration:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}`}
        />
        <p>
          নতুন file <InlineCode>src/front_of_house.rs</InlineCode> বানিয়ে module
          body সেখানে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/front_of_house.rs"
          code={`pub mod hosting {
    pub fn add_to_waitlist() {}
}`}
        />
        <p>
          Compiler crate root-এ <InlineCode>mod front_of_house;</InlineCode>{" "}
          declaration দেখে — তারপর{" "}
          <InlineCode>src/front_of_house.rs</InlineCode>-এ body খুঁজে পায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 2 — hosting submodule আলাদা</h2>
        <p>
          <InlineCode>hosting</InlineCode>{" "}
          <InlineCode>front_of_house</InlineCode>-এর child। তাই এর file
          parent-এর নামের একটা directory-এ থাকতে হবে।
        </p>
        <p>
          <InlineCode>src/front_of_house.rs</InlineCode>-এ শুধু declaration:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/front_of_house.rs"
          code={`pub mod hosting;`}
        />
        <p>
          নতুন file <InlineCode>src/front_of_house/hosting.rs</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/front_of_house/hosting.rs"
          code={`pub fn add_to_waitlist() {}`}
        />
        <p>সবমিলিয়ে directory structure:</p>
        <CodeBlock
          lang="text"
          code={`restaurant
├── Cargo.toml
└── src
    ├── front_of_house
    │   └── hosting.rs
    ├── front_of_house.rs
    └── lib.rs`}
        />

        <h2 class="mt-10 text-2xl font-bold">গুরুত্বপূর্ণ — mod কোনো include না</h2>
        <p>
          <InlineCode>mod</InlineCode> declare করে — module-কে module tree-তে
          add করে। C-এর <InlineCode>#include</InlineCode>-এর মতো repeated
          inclusion <em>না</em>। একই module-কে module tree-তে একবারই declare
          করতে হয়; বাকি জায়গা থেকে path দিয়ে refer করা হয়।
        </p>
        <p>
          এই কারণে — <InlineCode>src/lib.rs</InlineCode>-এর{" "}
          <InlineCode>pub use crate::front_of_house::hosting</InlineCode> file
          split করার পরও বদলায়নি। <InlineCode>use</InlineCode> compile হওয়া
          file-এ কোনো প্রভাব ফেলে না — শুধু shortcut বানায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">পুরোনো style — mod.rs</h2>
        <p>Rust দুটো convention support করে:</p>
        <p>
          <strong><InlineCode>front_of_house</InlineCode>-এর জন্য:</strong>
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>src/front_of_house.rs</InlineCode> — modern, preferred।
          </li>
          <li>
            <InlineCode>src/front_of_house/mod.rs</InlineCode> — older, still
            supported।
          </li>
        </ul>
        <p>
          <strong><InlineCode>hosting</InlineCode>-এর জন্য:</strong>
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>src/front_of_house/hosting.rs</InlineCode> — modern,
            preferred।
          </li>
          <li>
            <InlineCode>src/front_of_house/hosting/mod.rs</InlineCode> —
            older, still supported।
          </li>
        </ul>
        <p>
          একই module-এর জন্য দুই style একসাথে use করলে compile error। Modern
          style preferred — editor-এ একই নামের অনেক <InlineCode>mod.rs</InlineCode>{" "}
          file খোলা থাকা confusing।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>mod name;</InlineCode> declaration — body{" "}
            <InlineCode>name.rs</InlineCode>-এ বা{" "}
            <InlineCode>name/mod.rs</InlineCode>-এ।
          </li>
          <li>
            Submodule — parent-এর folder-এর ভিতরে file (যেমন{" "}
            <InlineCode>front_of_house/hosting.rs</InlineCode>)।
          </li>
          <li>
            <InlineCode>mod</InlineCode> include না — declaration একবারই,
            refer path দিয়ে।
          </li>
          <li>
            Modern style (<InlineCode>name.rs</InlineCode>) preferred,{" "}
            <InlineCode>mod.rs</InlineCode> legacy কিন্তু supported।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৭.৫: Module-গুলোকে আলাদা file-এ ভাগ করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ module আলাদা file-এ rearrange করা — modern (name.rs) এবং legacy (name/mod.rs) convention।",
    },
  ],
};
