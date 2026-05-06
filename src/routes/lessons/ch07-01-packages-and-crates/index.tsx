import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch07-01-packages-and-crates";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৭.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Package এবং Crate</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Packages and Crates</p>
        <p class="mt-3">
          Rust-এর module system-এর প্রথম দু'টা শব্দ — <strong>crate</strong>{" "}
          এবং <strong>package</strong>। এই পাঠে এদের পার্থক্য এবং{" "}
          <InlineCode>cargo new</InlineCode> এই দু'টোকে কীভাবে set up করে,
          সেটা দেখব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Crate কী?</h2>
        <p>
          <strong>Crate</strong> হলো Rust compiler একসাথে যেটুকু code consider
          করে — সবচেয়ে ছোট compile unit। <InlineCode>rustc</InlineCode>-কে
          একটামাত্র file দিলেও সেটা একটা crate হিসেবেই বিবেচনা করে। Crate-এ
          module থাকতে পারে, এবং সেই module-গুলো একাধিক file-এ ছড়ানো থাকতে
          পারে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Binary crate বনাম library crate</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Binary crate</strong> — যা compile করে executable হয়। CLI
            tool, server, ইত্যাদি। প্রতিটাতে <InlineCode>main</InlineCode>{" "}
            function থাকতে হবে — execute করলে সেটাই entry point। আমরা এতদূর
            যা বানিয়েছি, সব binary crate।
          </li>
          <li>
            <strong>Library crate</strong> — কোনো <InlineCode>main</InlineCode>{" "}
            নেই, executable হয় না। এটা শুধু functionality define করে যা
            অন্য project use করতে পারে। যেমন{" "}
            <InlineCode>rand</InlineCode> crate। বেশিরভাগ সময় Rustacean যখন
            "crate" বলে, তখন library-ই বোঝায়।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Crate root</h2>
        <p>
          Compiler যেই source file থেকে শুরু করে, সেটা <strong>crate root</strong>
          । এটাই তোমার crate-এর root module। Convention অনুযায়ী —
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>src/main.rs</InlineCode> — binary crate-এর root।
          </li>
          <li>
            <InlineCode>src/lib.rs</InlineCode> — library crate-এর root।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Package কী?</h2>
        <p>
          <strong>Package</strong> এক বা একাধিক crate-এর bundle, যা একটা{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ described। Cargo নিজেই একটা
          package — যার একটা binary crate (যেটা তুমি{" "}
          <InlineCode>cargo</InlineCode> command হিসেবে চালাও) এবং একটা
          library crate (binary-টা যার উপর depend করে) দু'টোই আছে।
        </p>
        <p>Package-এর rule:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            Library crate <strong>সর্বোচ্চ একটি</strong>।
          </li>
          <li>Binary crate যত খুশি।</li>
          <li>Crate অন্তত একটা থাকতেই হবে।</li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">cargo new দিয়ে package</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new my-project
     Created binary (application) \`my-project\` package
$ ls my-project
Cargo.toml
src
$ ls my-project/src
main.rs`}
        />
        <p>
          Cargo তৈরি করছে — <InlineCode>Cargo.toml</InlineCode> (package
          define হলো) এবং <InlineCode>src/main.rs</InlineCode> (binary crate-এর
          root)।
        </p>
        <p>
          লক্ষ্য করো — <InlineCode>Cargo.toml</InlineCode>-এ{" "}
          <InlineCode>src/main.rs</InlineCode>-এর কোনো mention নেই। Cargo
          convention follow করে — ঐ file থাকলেই বুঝে নেয় binary crate-এর
          root।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Different package configuration</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            শুধু <InlineCode>src/main.rs</InlineCode> — package-এ একটা binary
            crate (নাম package-এর সাথে মিল)।
          </li>
          <li>
            <InlineCode>src/main.rs</InlineCode> + <InlineCode>src/lib.rs</InlineCode>{" "}
            — package-এ দু'টা crate, একটা binary, একটা library, দু'টোরই নাম
            package-এর মতো।
          </li>
          <li>
            একাধিক binary crate চাইলে — <InlineCode>src/bin/</InlineCode>{" "}
            folder-এ আলাদা file। প্রতিটা file আলাদা binary crate।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Crate</strong> = compiler-এর একটা compile unit; binary
            (executable) বা library।
          </li>
          <li>
            <strong>Crate root</strong> = compile-এর entry source file —{" "}
            <InlineCode>src/main.rs</InlineCode> বা{" "}
            <InlineCode>src/lib.rs</InlineCode>।
          </li>
          <li>
            <strong>Package</strong> = Cargo.toml-যুক্ত এক বা একাধিক
            crate-এর bundle। Library একটাই, binary যতগুলো খুশি।
          </li>
          <li>
            একাধিক binary <InlineCode>src/bin/</InlineCode>-এ; convention
            follow করে Cargo automatic detect করে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৭.১: Package এবং Crate · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ crate (binary বনাম library), crate root, এবং Cargo package-এর গঠন।",
    },
  ],
};
