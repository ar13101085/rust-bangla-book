import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch11-03-test-organization";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১১.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Test organize করা</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Test Organization</p>
        <p class="mt-3">
          Rust community-তে test দু'ভাগে — <strong>unit test</strong> এবং{" "}
          <strong>integration test</strong>।
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Unit test</strong> — ছোট, focused; এক module-কে isolation-এ
            test, private function-ও access করতে পারে।
          </li>
          <li>
            <strong>Integration test</strong> — library-এর বাইরে; শুধু public
            API use করে, একাধিক module একসাথে ব্যবহার করতে পারে।
          </li>
        </ul>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Unit test</h2>
        <p>
          <InlineCode>src/</InlineCode>-এর মধ্যে — যেই file-এ code, সেই file-এই
          test। Convention — প্রতিটা file-এ একটা <InlineCode>tests</InlineCode>{" "}
          নামের module, <InlineCode>#[cfg(test)]</InlineCode> সহ।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}`}
        />
        <p>
          <InlineCode>#[cfg(test)]</InlineCode> = "এই module শুধু test build-এ
          compile কর"। release build-এ থাকবেই না — compile time + binary size
          save।
        </p>

        <h3 class="mt-6 text-xl font-bold">Private function test</h3>
        <p>
          Rust-এ test code-ও সাধারণ code। <InlineCode>tests</InlineCode>{" "}
          module child — তাই parent-এর private item access করতে পারে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub fn add_two(a: u64) -> u64 {
    internal_adder(a, 2)
}

fn internal_adder(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        let result = internal_adder(2, 2);
        assert_eq!(result, 4);
    }
}`}
        />
        <p>
          <InlineCode>internal_adder</InlineCode> private হলেও child{" "}
          <InlineCode>tests</InlineCode> module থেকে access করা যাচ্ছে।{" "}
          <InlineCode>use super::*</InlineCode> পুরো parent scope নিয়ে আসে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Integration test</h2>
        <p>
          Project root-এ <InlineCode>tests/</InlineCode> directory (
          <InlineCode>src/</InlineCode>-এর পাশে)। এর প্রতিটা file{" "}
          <em>আলাদা crate</em>।
        </p>
        <CodeBlock
          lang="text"
          code={`adder
├── Cargo.lock
├── Cargo.toml
├── src
│   └── lib.rs
└── tests
    └── integration_test.rs`}
        />
        <CodeBlock
          lang="rust"
          filename="tests/integration_test.rs"
          code={`use adder::add_two;

#[test]
fn it_adds_two() {
    let result = add_two(2);
    assert_eq!(result, 4);
}`}
        />
        <p>
          <InlineCode>#[cfg(test)]</InlineCode> দরকার নেই — Cargo এই directory
          special-ভাবে treat করে। আর library-কে use করতে{" "}
          <InlineCode>use adder::add_two;</InlineCode> লিখতে হয়, কারণ এই file
          আলাদা crate।
        </p>

        <h3 class="mt-6 text-xl font-bold">cargo test output — তিন section</h3>
        <CodeBlock
          lang="text"
          code={`     Running unittests src/lib.rs (...)
running 1 test
test tests::internal ... ok

     Running tests/integration_test.rs (...)
running 1 test
test it_adds_two ... ok

   Doc-tests adder
running 0 tests`}
        />
        <p>
          Unit, integration, doc — তিন section। কোনো section-এ test fail করলে
          পরের section-গুলো run হয় না।
        </p>

        <h3 class="mt-6 text-xl font-bold">Specific integration test file</h3>
        <CodeBlock lang="bash" code={`$ cargo test --test integration_test`} />

        <h2 class="mt-10 text-2xl font-bold">Submodule integration test-এ</h2>
        <p>
          একাধিক integration test file-এর মধ্যে helper share করতে চাই।{" "}
          <InlineCode>tests/common.rs</InlineCode> বানালে — সেটা একটা আলাদা
          test crate হয়ে যায়:
        </p>
        <CodeBlock
          lang="text"
          filename="cargo test output (unwanted)"
          code={`     Running tests/common.rs (...)
running 0 tests`}
        />
        <p>
          এই empty section ugly। সমাধান —{" "}
          <InlineCode>tests/common/mod.rs</InlineCode>:
        </p>
        <CodeBlock
          lang="text"
          code={`tests
├── common
│   └── mod.rs
└── integration_test.rs`}
        />
        <p>
          Subdirectory-এর file আলাদা crate হয় না — শুধু helper module।
        </p>
        <CodeBlock
          lang="rust"
          filename="tests/integration_test.rs"
          code={`use adder::add_two;

mod common;

#[test]
fn it_adds_two() {
    common::setup();

    let result = add_two(2);
    assert_eq!(result, 4);
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Binary crate-এ integration test?</h2>
        <p>
          শুধু <InlineCode>src/main.rs</InlineCode> থাকলে — integration test
          সম্ভব না। কারণ binary crate-এর function অন্য crate use করতে পারে
          না।
        </p>
        <p>
          সমাধান — convention হলো ছোট{" "}
          <InlineCode>src/main.rs</InlineCode> যেটা সব logic-কে{" "}
          <InlineCode>src/lib.rs</InlineCode>-এ delegate করে। তখন integration
          test library-কে test করে; main.rs-এর সামান্য code-ও indirectly
          covered।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Unit test — <InlineCode>src/</InlineCode>-এ, same file,{" "}
            <InlineCode>#[cfg(test)] mod tests</InlineCode>; private access
            possible।
          </li>
          <li>
            Integration test — <InlineCode>tests/</InlineCode>{" "}
            directory-তে, প্রতিটা file আলাদা crate; শুধু public API।
          </li>
          <li>
            Three section output — unit, integration, doc।
          </li>
          <li>
            Helper module — <InlineCode>tests/common/mod.rs</InlineCode>{" "}
            (subdirectory)।
          </li>
          <li>
            Binary-only crate-এ integration test হয় না — main.rs-কে পাতলা রাখো,
            logic lib.rs-এ।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১১.৩: Test organize করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ unit test বনাম integration test, #[cfg(test)], tests/ directory, এবং common helper pattern।",
    },
  ],
};
