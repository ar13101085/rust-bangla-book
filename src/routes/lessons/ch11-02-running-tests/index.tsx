import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch11-02-running-tests";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১১.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Test কীভাবে run হবে control করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Controlling How Tests Are Run
        </p>
        <p class="mt-3">
          <InlineCode>cargo test</InlineCode> code compile করে test binary
          বানায় এবং run করে। Default — সব test parallel-এ চলে এবং passing
          test-এর output capture (hidden) করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">cargo test বনাম test binary args</h2>
        <p>
          কিছু option <InlineCode>cargo test</InlineCode>-এর জন্য, কিছু binary
          (test runner)-এর জন্য। Separator <InlineCode>--</InlineCode>:
        </p>
        <CodeBlock
          lang="bash"
          code={`$ cargo test --help        # cargo test-এর option
$ cargo test -- --help     # test binary-র option`}
        />

        <h2 class="mt-10 text-2xl font-bold">Parallel বনাম consecutive</h2>
        <p>
          Default parallel — দ্রুত feedback। কিন্তু test-এ shared state
          (file, env var, working dir) থাকলে interfere করতে পারে।
        </p>
        <p>
          সবগুলো একে একে চালাতে:
        </p>
        <CodeBlock
          lang="bash"
          code={`$ cargo test -- --test-threads=1`}
        />
        <p>
          Slower, কিন্তু safe। আদর্শ সমাধান — প্রতিটা test আলাদা file/env
          দিয়ে independent করো; এই flag last resort।
        </p>

        <h2 class="mt-10 text-2xl font-bold">println! output দেখা</h2>
        <p>
          Default-এ test pass করলে <InlineCode>println!</InlineCode> capture
          হয় (hidden)। Fail করলে দেখায়। সব test-এর print দেখতে চাইলে:
        </p>
        <CodeBlock lang="bash" code={`$ cargo test -- --show-output`} />

        <h2 class="mt-10 text-2xl font-bold">Subset of tests by name</h2>
        <p>Sample lib:</p>
        <CodeBlock
          lang="rust"
          code={`pub fn add_two(a: u64) -> u64 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_two_and_two() {
        let result = add_two(2);
        assert_eq!(result, 4);
    }

    #[test]
    fn add_three_and_two() {
        let result = add_two(3);
        assert_eq!(result, 5);
    }

    #[test]
    fn one_hundred() {
        let result = add_two(100);
        assert_eq!(result, 102);
    }
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Single test</h3>
        <CodeBlock
          lang="bash"
          code={`$ cargo test one_hundred
running 1 test
test tests::one_hundred ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out`}
        />

        <h3 class="mt-6 text-xl font-bold">Filter — partial match</h3>
        <CodeBlock
          lang="bash"
          code={`$ cargo test add
running 2 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok
test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out`}
        />
        <p>
          নাম-এ "add" থাকা test-গুলো ran। Module-এর নাম-ও test-এর full name-এর
          অংশ — তাই module-এর নাম দিলেই সেই module-এর সব test।
        </p>

        <h2 class="mt-10 text-2xl font-bold">#[ignore] দিয়ে slow test বাদ</h2>
        <p>
          কিছু test slow — সাধারণ <InlineCode>cargo test</InlineCode>-এ skip
          চাও:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    #[ignore]
    fn expensive_test() {
        // code that takes an hour to run
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`running 2 tests
test tests::expensive_test ... ignored
test tests::it_works ... ok`}
        />
        <p>শুধু ignored test:</p>
        <CodeBlock lang="bash" code={`$ cargo test -- --ignored`} />
        <p>সব (ignored সহ):</p>
        <CodeBlock lang="bash" code={`$ cargo test -- --include-ignored`} />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>--</InlineCode> এর আগে cargo arg, পরে test binary arg।
          </li>
          <li>
            Default parallel; <InlineCode>--test-threads=1</InlineCode>{" "}
            consecutive।
          </li>
          <li>
            <InlineCode>--show-output</InlineCode> — passing test-এর print
            দেখাও।
          </li>
          <li>
            <InlineCode>cargo test name</InlineCode> — exact বা partial match।
          </li>
          <li>
            <InlineCode>#[ignore]</InlineCode> + <InlineCode>--ignored</InlineCode>{" "}
            / <InlineCode>--include-ignored</InlineCode>।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১১.২: Test কীভাবে run হবে control · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ cargo test args, parallel/consecutive, --show-output, name filtering, এবং #[ignore]।",
    },
  ],
};
