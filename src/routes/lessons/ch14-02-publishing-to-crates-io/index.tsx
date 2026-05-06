import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch14-02-publishing-to-crates-io";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৪.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Crates.io-তে crate publish করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Publishing a Crate to Crates.io
        </p>
        <p class="mt-3">
          Crates.io হলো Rust-এর package registry — অন্যদের লেখা crate এখানেই
          পাওয়া যায়, এবং নিজেও publish করে অন্যদের সাথে share করা যায়। এই
          পাঠে দেখব কী ভাবে documentation লিখতে হয়, public API design করতে হয়,
          metadata add করতে হয়, এবং শেষে publish ও version manage করতে হয়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Documentation comment</h2>
        <p>
          Documentation comment তিনটে slash <InlineCode>///</InlineCode>{" "}
          দিয়ে শুরু এবং Markdown support করে। Public API item-এর জন্য HTML
          documentation generate হয়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`/// Adds one to the number given.
///
/// # Examples
///
/// \`\`\`
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// \`\`\`
pub fn add_one(x: i32) -> i32 {
    x + 1
}`}
        />
        <p>HTML build করতে:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo doc          # target/doc/-এ HTML generate
$ cargo doc --open   # browser-এ open`}
        />

        <h3 class="mt-6 text-xl font-bold">প্রচলিত section</h3>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong># Examples</strong> — কীভাবে use করতে হয়।
          </li>
          <li>
            <strong># Panics</strong> — কোন scenario-তে function panic করতে
            পারে।
          </li>
          <li>
            <strong># Errors</strong> — <InlineCode>Result</InlineCode>-return
            করা function কোন কোন error দিতে পারে।
          </li>
          <li>
            <strong># Safety</strong> —{" "}
            <InlineCode>unsafe</InlineCode> function-এর caller-কে কোন invariant
            uphold করতে হবে।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">Doc-test হিসেবে example</h3>
        <p>
          Documentation-এর code example <InlineCode>cargo test</InlineCode>{" "}
          চালালে automatically run হয়। তাই documentation কখনো actual code-এর
          সাথে out of sync থাকে না।
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ cargo test`} />

        <h3 class="mt-6 text-xl font-bold">Containing item-এর comment</h3>
        <p>
          <InlineCode>//!</InlineCode> comment containing item document করে —
          সাধারণত crate বা module-এর top-এ লেখা হয়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`//! # My Crate
//!
//! \`my_crate\` is a collection of utilities to make performing certain
//! calculations more convenient.

/// Adds one to the number given.
pub fn add_one(x: i32) -> i32 {
    x + 1
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">pub use দিয়ে convenient public API</h2>
        <p>
          Internally module hierarchy অনেক গভীর হলেও user-এর জন্য সেটা চাপিয়ে
          দেওয়া উচিত না। <InlineCode>pub use</InlineCode> দিয়ে item top-level-এ
          re-export করে public API-কে flat রাখা যায়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`//! # Art
//!
//! A library for modeling artistic concepts.

pub use self::kinds::PrimaryColor;
pub use self::kinds::SecondaryColor;
pub use self::utils::mix;

pub mod kinds {
    /// The primary colors according to the RYB color model.
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// The secondary colors according to the RYB color model.
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    use crate::kinds::*;

    /// Combines two primary colors in equal amounts to create
    /// a secondary color.
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        SecondaryColor::Orange
    }
}`}
        />
        <p>Re-export-এর আগে user লিখত:</p>
        <CodeBlock
          lang="rust"
          code={`use art::kinds::PrimaryColor;
use art::utils::mix;`}
        />
        <p>Re-export-এর পরে:</p>
        <CodeBlock
          lang="rust"
          code={`use art::PrimaryColor;
use art::mix;`}
        />
        <p>Internal structure এখনো develop-করা সহজ — public API stable।</p>

        <h2 class="mt-10 text-2xl font-bold">Crates.io account</h2>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            <a href="https://crates.io/" class="underline">crates.io</a>-এ যাও,
            GitHub দিয়ে log in।
          </li>
          <li>Profile page থেকে API token নাও।</li>
          <li>Login command:</li>
        </ol>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo login
abcdefghijklmnopqrstuvwxyz012345`}
        />
        <p>
          Token <InlineCode>~/.cargo/credentials.toml</InlineCode>-এ save।{" "}
          <strong>সিক্রেট রাখো</strong> — share কোরো না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Metadata add করা</h2>
        <p>
          Crate-এর নাম <strong>unique</strong> হতে হবে — first-come,
          first-served:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[package]
name = "guessing_game"`}
        />
        <p>Publish-এর জন্য আরও কিছু metadata দরকার:</p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[package]
name = "guessing_game"
version = "0.1.0"
edition = "2024"
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>description</InlineCode> — search result-এ দেখানো হবে।
          </li>
          <li>
            <InlineCode>license</InlineCode> — SPDX identifier ব্যবহার করো।
            একাধিক license: <InlineCode>"MIT OR Apache-2.0"</InlineCode>।
            Custom license file-এর জন্য{" "}
            <InlineCode>license-file = "LICENSE.txt"</InlineCode>।
          </li>
        </ul>
        <p>Metadata না দিলে error:</p>
        <CodeBlock
          lang="text"
          filename="cargo publish error"
          code={`warning: manifest has no description, license, license-file, documentation, homepage or repository.
error: failed to publish to registry at https://crates.io
Caused by:
  the remote server responded with an error (status 400 Bad Request): missing or empty metadata fields: description, license.`}
        />

        <h2 class="mt-10 text-2xl font-bold">Publish করা</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo publish
    Updating crates.io index
   Packaging guessing_game v0.1.0 (file:///projects/guessing_game)
    Packaged 6 files, 1.2KiB (895.0B compressed)
   Verifying guessing_game v0.1.0 (file:///projects/guessing_game)
   Compiling guessing_game v0.1.0
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.19s
   Uploading guessing_game v0.1.0 (file:///projects/guessing_game)
    Uploaded guessing_game v0.1.0 to registry \`crates-io\`
    Published guessing_game v0.1.0 at registry \`crates-io\``}
        />
        <p>
          গুরুত্বপূর্ণ — একবার publish-করা version{" "}
          <strong>permanent</strong>। Overwrite বা delete করা যায় না। Crates.io
          permanent code archive হিসেবে কাজ করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">নতুন version publish</h2>
        <p>
          <InlineCode>Cargo.toml</InlineCode>-এ version update করে আবার publish।
          Version number{" "}
          <a href="https://semver.org/" class="underline">Semantic Versioning</a>{" "}
          rule অনুযায়ী বাড়াও।
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[package]
name = "guessing_game"
version = "0.2.0"`}
        />
        <CodeBlock lang="bash" filename="terminal" code={`$ cargo publish`} />

        <h2 class="mt-10 text-2xl font-bold">Version yank করা</h2>
        <p>
          Yank মানে — কোনো version-কে নতুন project-এর dependency হিসেবে use করা
          আটকানো। কিন্তু পুরোনো project-এ যাদের{" "}
          <InlineCode>Cargo.lock</InlineCode>-এ এই version আছে তাদের কোনো
          সমস্যা হবে না।
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo yank --vers 1.0.1
    Updating crates.io index
        Yank guessing_game@1.0.1`}
        />
        <p>Undo:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo yank --vers 1.0.1 --undo
    Updating crates.io index
      Unyank guessing_game@1.0.1`}
        />
        <p>
          সাবধান — yank code <strong>delete</strong> করে না। ভুল করে কোনো
          secret upload হলে সেটা সাথে সাথে rotate/reset করতেই হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>///</InlineCode> public item-এর জন্য,{" "}
            <InlineCode>//!</InlineCode> containing item-এর জন্য doc comment।
            Markdown supported।
          </li>
          <li>
            Doc-এর code example <InlineCode>cargo test</InlineCode>-এ run হয় —
            documentation আর code sync থাকে।
          </li>
          <li>
            <InlineCode>pub use</InlineCode> দিয়ে internal hierarchy hide করে
            convenient public API exposed করা যায়।
          </li>
          <li>
            Publish-এর জন্য{" "}
            <InlineCode>name</InlineCode>, <InlineCode>version</InlineCode>,{" "}
            <InlineCode>description</InlineCode>,{" "}
            <InlineCode>license</InlineCode> — সবই দরকার।
          </li>
          <li>
            <InlineCode>cargo publish</InlineCode> করলে version permanent —
            overwrite/delete নেই; SemVer follow করো।
          </li>
          <li>
            <InlineCode>cargo yank --vers X</InlineCode> দিয়ে broken version
            deprecate; existing user-দের ক্ষতি হয় না।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৪.২: Crates.io-তে crate publish · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Documentation comment, pub use, Cargo.toml metadata, cargo publish, এবং cargo yank দিয়ে crate manage।",
    },
  ],
};
