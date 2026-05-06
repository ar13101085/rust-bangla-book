import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-04-testing-the-librarys-functionality";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          TDD দিয়ে functionality যোগ করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Adding Functionality with Test Driven Development
        </p>
        <p class="mt-3">
          এখন আসল search logic add করব — <strong>Test Driven Development
          (TDD)</strong> approach-এ।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">TDD-এর তিন step</h2>
        <ol class="ml-6 list-decimal space-y-1">
          <li>একটা test লেখো যেটা fail করে; verify কর কেন fail করছে।</li>
          <li>Test pass করার মতো ন্যূনতম code লেখো।</li>
          <li>Refactor কর; test পাশ থাকবে।</li>
          <li>Repeat।</li>
        </ol>
        <p>
          এতে test coverage সবসময় high থাকে; bugs প্রথমেই ধরা পড়ে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Failing test লেখা</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    unimplemented!();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}`}
        />
        <p>
          <InlineCode>"\</InlineCode> string literal-এর শুরুতে — first newline
          ignore করতে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Lifetime কেন</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str>`}
        />
        <p>
          Return-করা <InlineCode>&str</InlineCode> slice-গুলো{" "}
          <InlineCode>contents</InlineCode>-এর substring। তাই return value-র
          lifetime <InlineCode>contents</InlineCode>-এর সাথে tied — query-এর
          সাথে না (query function-শেষে drop হলেও result valid থাকবে)। এই
          relationship lifetime annotation দিয়ে স্পষ্ট।
        </p>
        <p>
          এই lifetime না দিলে compile error:
        </p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0106]: missing lifetime specifier
 --> src/lib.rs:1:51
  |
1 | pub fn search(query: &str, contents: &str) -> Vec<&str> {
  |                      ----            ----         ^ expected named lifetime parameter`}
        />

        <h2 class="mt-10 text-2xl font-bold">Pass করানো — ন্যূনতম code</h2>

        <h3 class="mt-6 text-xl font-bold">Step 1 — empty Vec</h3>
        <p>
          প্রথমে compile করানো (<InlineCode>unimplemented!</InlineCode> sustitute):
        </p>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}`}
        />
        <p>Test compile হবে কিন্তু fail করবে — empty vec ≠ expected।</p>

        <h3 class="mt-6 text-xl font-bold">Step 2 — line দিয়ে iterate</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}`}
        />
        <p>
          <InlineCode>.lines()</InlineCode> string-এর প্রতিটা line-এর iterator
          দেয়।
        </p>

        <h3 class="mt-6 text-xl font-bold">Step 3 — query check</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}`}
        />
        <p>
          <InlineCode>.contains()</InlineCode> string method — substring check।
        </p>

        <h3 class="mt-6 text-xl font-bold">Step 4 — push এবং return</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}`}
        />
        <p>Test pass:</p>
        <CodeBlock
          lang="text"
          filename="cargo test"
          code={`running 1 test
test tests::one_result ... ok`}
        />

        <h2 class="mt-10 text-2xl font-bold">main-এ search use করা</h2>
        <p>
          <InlineCode>run</InlineCode> function update — search-এর result
          iterate করে print:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    for line in search(&config.query, &contents) {
        println!("{line}");
    }

    Ok(())
}`}
        />
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run -- frog poem.txt
How public, like a frog

$ cargo run -- body poem.txt
I'm nobody! Who are you?
Are you nobody, too?
How dreary to be somebody!

$ cargo run -- monomorphization poem.txt
(কোনো output নেই — match পাইনি)`}
        />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            TDD — fail-test → minimal pass code → refactor। Coverage সবসময়
            high।
          </li>
          <li>
            <InlineCode>fn search&lt;'a&gt;(...) -&gt; Vec&lt;&'a str&gt;</InlineCode>{" "}
            — return-এর reference contents থেকে আসছে, তাই lifetime tied।
          </li>
          <li>
            <InlineCode>.lines()</InlineCode>,{" "}
            <InlineCode>.contains()</InlineCode> — Rust string-এর ব্যবহারিক
            method।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.৪: TDD দিয়ে functionality · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "minigrep-এ Test Driven Development দিয়ে search function — lifetime, lines(), contains() ব্যবহার।",
    },
  ],
};
