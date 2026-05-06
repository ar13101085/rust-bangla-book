import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch06-03-if-let";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৬.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          if let এবং let...else দিয়ে concise control flow
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Concise Control Flow with if let and let...else
        </p>
        <p class="mt-3">
          <InlineCode>match</InlineCode> exhaustive এবং powerful, কিন্তু কখনো
          কখনো একটা মাত্র case-এর জন্য পুরো match লেখা verbose মনে হয়। এই
          পাঠে সংক্ষেপিত form দু'টা দেখব — <InlineCode>if let</InlineCode>{" "}
          এবং <InlineCode>let...else</InlineCode>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Verbose match — শুধু এক arm-এর জন্য</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let config_max = Some(3u8);
    match config_max {
        Some(max) => println!("The maximum is configured to be {max}"),
        _ => (),
    }
}`}
        />
        <p>
          <InlineCode>_ =&gt; ()</InlineCode> শুধু exhaustiveness satisfy
          করতে — কাজের কাজ কিছু না। এই boilerplate এড়ানো যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">if let — সংক্ষিপ্ত form</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let config_max = Some(3u8);
    if let Some(max) = config_max {
        println!("The maximum is configured to be {max}");
    }
}`}
        />
        <p>
          Syntax — <InlineCode>if let pattern = expression {`{...}`}</InlineCode>
          । Match-এর প্রথম arm হিসেবে ভাবতে পারো; pattern fit করলে
          block-এর code চলে, না হলে skip।
        </p>
        <p>
          <strong>Trade-off:</strong> conciseness gain, কিন্তু exhaustiveness
          check হারালাম। কোনটা ভালো — situation-এর উপর depend করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">if let + else</h2>
        <p>
          match-এর <InlineCode>_</InlineCode> arm-এর equivalent হিসেবে{" "}
          <InlineCode>else</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn main() {
    let coin = Coin::Penny;
    let mut count = 0;
    if let Coin::Quarter(state) = coin {
        println!("State quarter from {state:?}!");
    } else {
        count += 1;
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">let...else — early return pattern</h2>
        <p>
          একটা common pattern — value extract কর; না পেলে early return। এটা{" "}
          <InlineCode>if let</InlineCode> দিয়ে লিখলে nested আকার নেয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn describe_state_quarter(coin: Coin) -> Option<String> {
    let state = if let Coin::Quarter(state) = coin {
        state
    } else {
        return None;
    };

    if state.existed_in(1900) {
        Some(format!("{state:?} is pretty old, for America!"))
    } else {
        Some(format!("{state:?} is relatively new."))
    }
}`}
        />
        <p>
          এই কাজটা cleaner হয় <InlineCode>let...else</InlineCode>-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl UsState {
    fn existed_in(&self, year: u16) -> bool {
        match self {
            UsState::Alabama => year >= 1819,
            UsState::Alaska => year >= 1959,
            // --snip--
        }
    }
}

fn describe_state_quarter(coin: Coin) -> Option<String> {
    let Coin::Quarter(state) = coin else {
        return None;
    };

    if state.existed_in(1900) {
        Some(format!("{state:?} is pretty old, for America!"))
    } else {
        Some(format!("{state:?} is relatively new."))
    }
}`}
        />
        <p>
          Syntax — pattern বাঁদিকে, expression ডানদিকে; pattern match হলে
          variable bind হয় outer scope-এ। Match না হলে{" "}
          <InlineCode>else</InlineCode> branch চলে — সেটা অবশ্যই{" "}
          <em>diverge</em> করতে হবে (return, break, panic, ইত্যাদি)। এর
          ফলে main "happy path" indentation-হীন থাকে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কখন কোনটা?</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>match</InlineCode> — সব variant-এর জন্য আলাদা logic;
            exhaustiveness দরকার।
          </li>
          <li>
            <InlineCode>if let</InlineCode> — শুধু একটা specific pattern-এ কিছু
            করতে চাও।
          </li>
          <li>
            <InlineCode>if let ... else</InlineCode> — দু'টা branch, একটা
            specific pattern, একটা default।
          </li>
          <li>
            <InlineCode>let...else</InlineCode> — extract কর, না পেলে early
            return; happy path-কে indentation-হীন রাখো।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>if let pattern = expr {`{...}`}</InlineCode> — match-এর
            single-arm shorthand।
          </li>
          <li>
            <InlineCode>if let ... else</InlineCode> — দু'টা case-এর জন্য
            shortcut।
          </li>
          <li>
            <InlineCode>let pattern = expr else {`{ return ... }`}</InlineCode>{" "}
            — early-return pattern, happy path flat।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৬.৩: if let এবং let...else · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ if let দিয়ে concise pattern matching এবং let...else দিয়ে early-return।",
    },
  ],
};
