import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch11-01-writing-tests";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১১.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Test কীভাবে লিখব</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">How to Write Tests</p>
        <p class="mt-3">
          Test হলো এমন function যা আমাদের non-test code-এর behavior verify
          করে। সাধারণ structure — (১) data বা state setup, (২) যা test করতে
          চাও সেটা run, (৩) result expected কিনা assert।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">#[test] attribute</h2>
        <p>
          Test হলো <InlineCode>#[test]</InlineCode> দিয়ে annotated function।{" "}
          <InlineCode>cargo test</InlineCode> চালালে Rust একটা test runner
          binary build করে এবং সেগুলো run করে।
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new adder --lib`}
        />
        <p>
          Auto-generated <InlineCode>src/lib.rs</InlineCode>:
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
          <InlineCode>#[cfg(test)]</InlineCode> module-কে শুধু test build-এ
          include করে — release-এ bake হয় না। Test module-এর ভিতরে non-test
          helper function-ও থাকতে পারে; <InlineCode>#[test]</InlineCode> attached
          না থাকলে runner সেগুলো test হিসেবে চালায় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">cargo test</h2>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo test
running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out`}
        />
        <p>
          Test fail (panic) হলে output-এ ঐ test-এর details আলাদা section-এ:
        </p>
        <CodeBlock
          lang="text"
          code={`failures:
---- tests::another stdout ----
thread 'tests::another' panicked at src/lib.rs:17:9:
Make this test fail`}
        />

        <h2 class="mt-10 text-2xl font-bold">assert! macro</h2>
        <p>
          <InlineCode>assert!(condition)</InlineCode> — condition true হলে
          কিছু না, false হলে panic + test fail।
        </p>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle { width: 8, height: 7 };
        let smaller = Rectangle { width: 5, height: 1 };

        assert!(larger.can_hold(&smaller));
    }

    #[test]
    fn smaller_cannot_hold_larger() {
        let larger = Rectangle { width: 8, height: 7 };
        let smaller = Rectangle { width: 5, height: 1 };

        assert!(!smaller.can_hold(&larger));
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">assert_eq! এবং assert_ne!</h2>
        <p>
          সরাসরি equality test — fail হলে দু'টো value print করে দেয়, debug
          সহজ:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub fn add_two(a: u64) -> u64 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds_two() {
        let result = add_two(2);
        assert_eq!(result, 4);
    }
}`}
        />
        <p>
          Wrong value হলে output:
        </p>
        <CodeBlock
          lang="text"
          code={`assertion \`left == right\` failed
  left: 5
 right: 4`}
        />
        <p>
          <strong>Important:</strong> compared types-এ{" "}
          <InlineCode>PartialEq</InlineCode> এবং <InlineCode>Debug</InlineCode>{" "}
          trait দরকার। Custom struct/enum-এ derive করো:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[derive(PartialEq, Debug)]
struct MyStruct {
    field: i32,
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Custom failure message</h2>
        <p>
          assert/assert_eq/assert_ne — required arg-এর পরে format-style extra
          arg:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub fn greeting(name: &str) -> String {
    format!("Hello {name}!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(
            result.contains("Carol"),
            "Greeting did not contain name, value was \`{result}\`"
        );
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">should_panic — panic check</h2>
        <p>
          কোনো code panic করার কথা — তাহলেই test pass:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }
        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
    }
}`}
        />
        <p>
          Panic-এর message-এ specific text থাকতে হবে — তখন{" "}
          <InlineCode>expected</InlineCode> argument:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[test]
#[should_panic(expected = "less than or equal to 100")]
fn greater_than_100() {
    Guess::new(200);
}`}
        />
        <p>
          এই precision-এ panic ঠিক জায়গা থেকেই হচ্ছে — ভুল reason-এ panic
          করলে test fail।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Result&lt;T, E&gt; return-করা test</h2>
        <CodeBlock
          lang="rust"
          code={`pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() -> Result<(), String> {
        let result = add(2, 2);

        if result == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}`}
        />
        <p>
          Test body-তে <InlineCode>?</InlineCode> operator use করতে চাইলে এই
          form। <InlineCode>Err</InlineCode> return হলে test fail।
        </p>
        <p>
          Note: Result-returning test-এ <InlineCode>#[should_panic]</InlineCode>{" "}
          use করা যায় না। Err হবে কিনা চাইলে — body-তে{" "}
          <InlineCode>assert!(value.is_err())</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>#[test]</InlineCode> + <InlineCode>#[cfg(test)] mod tests</InlineCode>{" "}
            convention; <InlineCode>cargo test</InlineCode>।
          </li>
          <li>
            <InlineCode>assert!</InlineCode>, <InlineCode>assert_eq!</InlineCode>
            , <InlineCode>assert_ne!</InlineCode> — fail-এ panic;
            assert_eq/ne-এ <InlineCode>PartialEq + Debug</InlineCode> দরকার।
          </li>
          <li>
            Custom failure message — extra format arg।
          </li>
          <li>
            <InlineCode>#[should_panic(expected = "...")]</InlineCode> —
            specific panic test।
          </li>
          <li>
            Test <InlineCode>Result</InlineCode> return করতে পারে — body-তে{" "}
            <InlineCode>?</InlineCode>; should_panic-এর সাথে mix না।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১১.১: Test কীভাবে লিখব · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ #[test] attribute, assert! macro family, should_panic, এবং Result-returning test।",
    },
  ],
};
