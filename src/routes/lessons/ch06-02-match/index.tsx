import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch06-02-match";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৬.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">match Control Flow</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          The match Control Flow Construct
        </p>
        <p class="mt-3">
          <InlineCode>match</InlineCode> Rust-এর সবচেয়ে শক্তিশালী control flow
          construct — একটা value-কে কয়েকটা pattern-এর সাথে compare করে, যেটা
          match হয় তার code চালায়। Coin-sorting machine-এর মতো — প্রতিটা coin
          নির্দিষ্ট ছিদ্রে গিয়ে পড়ে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Basic match — Coin enum</h2>
        <CodeBlock
          lang="rust"
          code={`enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}`}
        />
        <p>
          প্রতিটা arm-এ দু'অংশ — pattern এবং{" "}
          <InlineCode>=&gt;</InlineCode>-এর পরে কোড। উপর থেকে নিচে যেটা
          প্রথম match হয়, তার code চলে। match-এর result expression-এর
          value।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Multi-line arm</h2>
        <p>একটা arm-এ একাধিক line দরকার হলে curly bracket:</p>
        <CodeBlock
          lang="rust"
          code={`fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Pattern-এ value bind করা</h2>
        <p>Variant-এ থাকা data extract করতে — pattern-এ variable binding:</p>
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

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        }
    }
}

fn main() {
    value_in_cents(Coin::Quarter(UsState::Alaska));
}`}
        />
        <p>
          <InlineCode>Coin::Quarter(state)</InlineCode> pattern match হলে,
          ভেতরের <InlineCode>UsState</InlineCode>{" "}
          <InlineCode>state</InlineCode> variable-এ bind হয়। তারপর arm-এর
          body-তে use করা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Option&lt;T&gt; match করা</h2>
        <p>
          <InlineCode>plus_one</InlineCode> — input <InlineCode>Some(i)</InlineCode>{" "}
          হলে এক বাড়ায়, <InlineCode>None</InlineCode> হলে None ফেরত:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);`}
        />
        <p>
          <InlineCode>Some(5)</InlineCode>{" "}
          <InlineCode>Some(i)</InlineCode>-এর সাথে match হলে{" "}
          <InlineCode>i</InlineCode>-এ 5 bind, then{" "}
          <InlineCode>Some(6)</InlineCode> return।
        </p>

        <h2 class="mt-10 text-2xl font-bold">match exhaustive — সব case handle</h2>
        <p>
          Rust force করে — সব possible variant cover করতে হবে। নিচের code
          compile হবে না (None case missing):
        </p>
        <CodeBlock
          lang="rust"
          code={`fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}`}
        />
        <p>
          এই exhaustiveness check Rust-এর সবচেয়ে boring কিন্তু সবচেয়ে দরকারি
          feature-গুলোর একটা। Null-pointer-style bug compile-time-এ ধরা পড়ে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Catch-all এবং _ placeholder</h2>
        <p>
          সব case explicitly লিখতে হবে না — শেষে catch-all। Variable দিয়ে
          remaining value capture:
        </p>
        <CodeBlock
          lang="rust"
          code={`let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other),
}`}
        />
        <p>
          <InlineCode>other</InlineCode>-এ remaining value bind হয়। Value
          লাগবে না — শুধু match catch করতে চাই — তখন{" "}
          <InlineCode>_</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => reroll(),
}`}
        />
        <p>
          কিছুই করতে চাও না — unit value <InlineCode>()</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => (),
}`}
        />
        <p>
          লক্ষ্য করো — catch-all arm সবসময় <em>শেষে</em>। তার আগে রাখলে আগের
          arm-গুলো unreachable হয়ে যায়, compiler warning দেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>match</InlineCode> — pattern + code, top-down, প্রথম
            match-এর code চলে।
          </li>
          <li>
            Variant-এর data extract করতে pattern-এ binding (
            <InlineCode>Coin::Quarter(state)</InlineCode>)।
          </li>
          <li>
            <strong>Exhaustive</strong> — সব variant cover করতে হবে; না হলে
            compile error।
          </li>
          <li>
            Catch-all variable-এ (<InlineCode>other</InlineCode>) বা{" "}
            <InlineCode>_</InlineCode>-এ; কিছু না করতে চাইলে{" "}
            <InlineCode>=&gt; ()</InlineCode>।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৬.২: match Control Flow · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ match expression, pattern binding, exhaustiveness check, এবং catch-all (_) placeholder।",
    },
  ],
};
