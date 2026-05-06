import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch14-03-cargo-workspaces";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৪.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Cargo Workspace</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Cargo Workspaces</p>
        <p class="mt-3">
          Project বড় হলে এক library crate-কে কয়েকটা ছোট crate-এ ভেঙে আলাদা
          আলাদা manage করা সুবিধাজনক। <strong>Workspace</strong> হলো একদল package
          যারা একই <InlineCode>Cargo.lock</InlineCode> আর{" "}
          <InlineCode>target</InlineCode> directory share করে। এতে related crate
          একসাথে develop করা সহজ হয়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Workspace বানানো</h2>
        <p>প্রথমে directory আর root <InlineCode>Cargo.toml</InlineCode>:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ mkdir add
$ cd add`}
        />
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[workspace]
resolver = "3"`}
        />
        <p>
          Workspace root-এ <InlineCode>[package]</InlineCode>{" "}
          section নেই — শুধু <InlineCode>[workspace]</InlineCode>।{" "}
          <InlineCode>resolver = "3"</InlineCode> latest dependency resolver
          algorithm use করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">প্রথম package — binary crate</h3>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new adder
     Created binary (application) \`adder\` package
      Adding \`adder\` as member of workspace at \`file:///projects/add\``}
        />
        <p>
          <InlineCode>cargo new</InlineCode> automatically{" "}
          <InlineCode>members</InlineCode>-এ যোগ করে দেয়:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[workspace]
resolver = "3"
members = ["adder"]`}
        />
        <p>
          <InlineCode>cargo build</InlineCode>-এর পরে directory structure:
        </p>
        <CodeBlock
          lang="text"
          code={`├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target`}
        />
        <p>
          লক্ষ করো — <InlineCode>target</InlineCode> directory একটাই, top-level-এ।{" "}
          <InlineCode>adder</InlineCode>-এর ভেতর থেকে build করলেও artifact{" "}
          <InlineCode>add/target</InlineCode>-এ যাবে,{" "}
          <InlineCode>add/adder/target</InlineCode>-এ না। এতে workspace-এর
          crate-গুলো একে অপরের ওপর depend করলে অপ্রয়োজনীয় recompilation এড়ানো
          যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">দ্বিতীয় package — library crate</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new add_one --lib
     Created library \`add_one\` package
      Adding \`add_one\` as member of workspace at \`file:///projects/add\``}
        />
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[workspace]
resolver = "3"
members = ["adder", "add_one"]`}
        />
        <CodeBlock
          lang="text"
          code={`├── Cargo.lock
├── Cargo.toml
├── add_one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target`}
        />

        <h3 class="mt-6 text-xl font-bold">Library function</h3>
        <CodeBlock
          lang="rust"
          filename="add_one/src/lib.rs"
          code={`pub fn add_one(x: i32) -> i32 {
    x + 1
}`}
        />

        <h3 class="mt-6 text-xl font-bold">
          Workspace crate-এর মধ্যে dependency
        </h3>
        <p>
          Cargo automatically assume করে না যে workspace-এর crate-গুলো একে
          অপরের ওপর depend করবে। তোমাকে explicitly declare করতে হবে — path
          dependency দিয়ে:
        </p>
        <CodeBlock
          lang="toml"
          filename="adder/Cargo.toml"
          code={`[dependencies]
add_one = { path = "../add_one" }`}
        />
        <CodeBlock
          lang="rust"
          filename="adder/src/main.rs"
          code={`fn main() {
    let num = 10;
    println!("Hello, world! {num} plus one is {}!", add_one::add_one(num));
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Build এবং run</h3>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.22s`}
        />
        <p>
          নির্দিষ্ট package run করতে <InlineCode>-p</InlineCode> flag:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run -p adder
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running \`target/debug/adder\`
Hello, world! 10 plus one is 11!`}
        />

        <h2 class="mt-10 text-2xl font-bold">External dependency</h2>
        <p>
          Workspace-এ একটাই <InlineCode>Cargo.lock</InlineCode> — top level-এ।
          এতে সব crate একই version-এর external dependency use করে, compatibility
          নিশ্চিত হয়।
        </p>
        <CodeBlock
          lang="toml"
          filename="add_one/Cargo.toml"
          code={`[dependencies]
rand = "0.8.5"`}
        />
        <CodeBlock
          lang="rust"
          filename="add_one/src/lib.rs"
          code={`use rand;

pub fn add_one(x: i32) -> i32 {
    x + 1
}`}
        />
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build
    Updating crates.io index
  Downloaded rand v0.8.5
   --snip--
   Compiling rand v0.8.5
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
warning: unused import: \`rand\`
 --> add_one/src/lib.rs:1:5
  |
1 | use rand;
  |     ^^^^
  |
  = note: \`#[warn(unused_imports)]\` on by default

warning: \`add_one\` (lib) generated 1 warning (run \`cargo fix --lib -p add_one\` to apply 1 suggestion)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.95s`}
        />

        <h3 class="mt-6 text-xl font-bold">Dependency automatic share হয় না</h3>
        <p>
          এক crate-এ <InlineCode>rand</InlineCode> add করলে অন্য crate
          সেটা automatically পাবে না। অন্য crate use করতে চাইলে তারও{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ declare করতে হবে।
        </p>
        <CodeBlock
          lang="text"
          filename="cargo build error"
          code={`$ cargo build
  --snip--
   Compiling adder v0.1.0 (file:///projects/add/adder)
error[E0432]: unresolved import \`rand\`
 --> adder/src/main.rs:2:5
  |
2 | use rand;
  |     ^^^^ no external crate \`rand\``}
        />
        <p>
          <InlineCode>adder/Cargo.toml</InlineCode>-এ{" "}
          <InlineCode>rand</InlineCode> add করে দাও — Cargo{" "}
          <InlineCode>Cargo.lock</InlineCode>-এ থাকা একই version reuse করবে,
          আলাদা copy compile করবে না। দুই crate incompatible version চাইলে
          Cargo দু'টোই resolve করে, কিন্তু version সংখ্যা minimize-এর চেষ্টা
          করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Workspace-এ test</h2>
        <CodeBlock
          lang="rust"
          filename="add_one/src/lib.rs"
          code={`pub fn add_one(x: i32) -> i32 {
    x + 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(3, add_one(2));
    }
}`}
        />
        <p>
          <InlineCode>cargo test</InlineCode> top-level-এ run করলে workspace-এর
          সব crate-এর test চলবে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo test
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished \`test\` profile [unoptimized + debuginfo] target(s) in 0.20s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/adder-3a47283c568d2b6a)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s`}
        />
        <p>নির্দিষ্ট crate-এর test:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo test -p add_one
    Finished \`test\` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s`}
        />

        <h2 class="mt-10 text-2xl font-bold">Workspace crate publish</h2>
        <p>
          Workspace-এর প্রতিটা crate-কে আলাদা ভাবে crates.io-তে publish করতে হয়:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo publish -p add_one`}
        />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Workspace = একদল crate, share করে একটা{" "}
            <InlineCode>Cargo.lock</InlineCode> এবং{" "}
            <InlineCode>target</InlineCode>।
          </li>
          <li>
            Root <InlineCode>Cargo.toml</InlineCode>-এ{" "}
            <InlineCode>[workspace]</InlineCode> +{" "}
            <InlineCode>members</InlineCode>।
          </li>
          <li>
            Workspace crate-গুলোর মধ্যে dependency explicit{" "}
            <InlineCode>path</InlineCode> দিয়ে declare করতে হয়।
          </li>
          <li>
            External dependency প্রতিটা crate-এ আলাদা declare; Cargo single
            version reuse করে।
          </li>
          <li>
            <InlineCode>cargo build/test/run -p &lt;name&gt;</InlineCode> দিয়ে
            specific crate target করা যায়।
          </li>
          <li>
            Publish আলাদা ভাবে — <InlineCode>cargo publish -p &lt;name&gt;</InlineCode>।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৪.৩: Cargo Workspace · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Cargo workspace বানানো, members add করা, internal/external dependency, এবং -p flag-এ specific crate target করা।",
    },
  ],
};
