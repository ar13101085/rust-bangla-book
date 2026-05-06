import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch07-04-bringing-paths-into-scope-with-the-use-keyword";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৭.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          use keyword দিয়ে path scope-এ আনা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Bringing Paths Into Scope with the use Keyword
        </p>
        <p class="mt-3">
          লম্বা path বারবার লেখা ক্লান্তিকর। <InlineCode>use</InlineCode>{" "}
          দিয়ে একটা shortcut বানানো যায় — অনেকটা filesystem-এর symbolic
          link-এর মতো।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Basic use</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}`}
        />
        <p>
          <InlineCode>use</InlineCode>-এর পরে এখন আর full path লিখতে হচ্ছে না —{" "}
          <InlineCode>hosting::add_to_waitlist()</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Scope-specific</h2>
        <p>
          <InlineCode>use</InlineCode> শুধু যেই scope-এ লেখা, সেই scope-এই কাজ
          করে। Child module-এ কাজ করবে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

mod customer {
    pub fn eat_at_restaurant() {
        hosting::add_to_waitlist();  // ERROR
    }
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0433]: failed to resolve: use of unresolved module or unlinked crate \`hosting\``}
        />
        <p>
          সমাধান — <InlineCode>customer</InlineCode> module-এর ভিতরে আবার{" "}
          <InlineCode>use</InlineCode> লিখো, অথবা{" "}
          <InlineCode>super::hosting</InlineCode> ব্যবহার করো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Function — parent module import করো</h2>
        <p>
          Rust-এ idiom — function-এর জন্য full path-এর শেষে parent module
          পর্যন্ত import করা, function-টা না:
        </p>
        <CodeBlock
          lang="rust"
          code={`use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();  // ভালো — clear যে function বাইরের
}`}
        />
        <p>Function-টাই import করা <em>unidiomatic</em>:</p>
        <CodeBlock
          lang="rust"
          code={`use crate::front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
    add_to_waitlist();  // মনে হচ্ছে local function — confusing
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Struct/Enum — full path import করো</h2>
        <p>Type-এর জন্য convention উল্টো — পুরো path-ই import:</p>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}`}
        />
        <p>
          Community-তে এই convention organic-ভাবেই দাঁড়িয়েছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Name conflict — as keyword</h2>
        <p>দুই module-এ same নামের type — দু'টোই দরকার:</p>
        <CodeBlock
          lang="rust"
          code={`use std::fmt;
use std::io;

fn function1() -> fmt::Result {
    // --snip--
    Ok(())
}

fn function2() -> io::Result<()> {
    // --snip--
    Ok(())
}`}
        />
        <p>
          parent module-এর নাম দিয়ে আলাদা করা যায়। অথবা{" "}
          <InlineCode>as</InlineCode> দিয়ে rename:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
    Ok(())
}

fn function2() -> IoResult<()> {
    Ok(())
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Re-export — pub use</h2>
        <p>
          <InlineCode>use</InlineCode>-এ যা import করছ তা শুধু এই module-এ
          available। যদি বাইরের code-ও সেটা ঐ shortcut-এ access করতে পারে,
          তাহলে <InlineCode>pub use</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}`}
        />
        <p>
          <InlineCode>pub use</InlineCode>-এর আগে external code-কে লিখতে হত:
        </p>
        <CodeBlock
          lang="rust"
          code={`restaurant::front_of_house::hosting::add_to_waitlist()`}
        />
        <p>এখন:</p>
        <CodeBlock lang="rust" code={`restaurant::hosting::add_to_waitlist()`} />
        <p>
          Internal structure (যেমন <InlineCode>front_of_house</InlineCode>)
          লুকানো গেল, সাজানো API দিতে পারলাম। API restructuring-এর জন্য খুব
          useful।
        </p>

        <h2 class="mt-10 text-2xl font-bold">External package use করা</h2>
        <p>
          <InlineCode>Cargo.toml</InlineCode>-এ dependency:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[dependencies]
rand = "0.8.5"`}
        />
        <p>তারপর code-এ scope-এ আনা:</p>
        <CodeBlock
          lang="rust"
          code={`use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..=100);
    println!("{secret_number}");
}`}
        />
        <p>
          Standard library (<InlineCode>std</InlineCode>)-ও একটা crate, কিন্তু
          Rust-এর সাথেই আসে — Cargo.toml-এ লিখতে হয় না। শুধু{" "}
          <InlineCode>use std::...</InlineCode> দিয়েই scope-এ আনা।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Nested path — সাজানো use list</h2>
        <p>একই module থেকে অনেক import:</p>
        <CodeBlock
          lang="rust"
          code={`use std::cmp::Ordering;
use std::io;`}
        />
        <p>একটা line-এ:</p>
        <CodeBlock lang="rust" code={`use std::{cmp::Ordering, io};`} />
        <p>
          এক path-ই আরেকটার subpath — <InlineCode>self</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::io;
use std::io::Write;`}
        />
        <p>একসাথে:</p>
        <CodeBlock lang="rust" code={`use std::io::{self, Write};`} />

        <h2 class="mt-10 text-2xl font-bold">Glob — *</h2>
        <CodeBlock lang="rust" code={`use std::collections::*;`} />
        <p>
          সব public item import। সতর্ক — কোন নাম কোথা থেকে আসছে, পরে বোঝা
          কঠিন। dependency upgrade-এ surprise conflict হতে পারে। সাধারণত
          test module বা prelude pattern-এ ব্যবহার হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>use path</InlineCode> দিয়ে scope-এ shortcut; per-scope।
          </li>
          <li>
            Function — parent module-এ থামাও; struct/enum — full path।
          </li>
          <li>
            Conflict-এ <InlineCode>as</InlineCode> দিয়ে rename।
          </li>
          <li>
            <InlineCode>pub use</InlineCode> — re-export, external API
            restructure।
          </li>
          <li>
            Nested path (<InlineCode>{`{cmp::Ordering, io}`}</InlineCode>);{" "}
            <InlineCode>self</InlineCode> দিয়ে parent-ও যোগ; glob{" "}
            <InlineCode>*</InlineCode> সাবধানে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৭.৪: use keyword দিয়ে path scope-এ আনা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ use keyword, idiomatic import patterns, as rename, pub use re-export, এবং nested/glob paths।",
    },
  ],
};
