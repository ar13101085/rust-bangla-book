import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch13-01-closures";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৩.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Closure</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Closures: Anonymous Functions that Capture Their Environment
        </p>
        <p class="mt-3">
          <strong>Closure</strong> = anonymous function — variable-এ রাখা যায়,
          argument হিসেবে pass করা যায়। Function থেকে আলাদা — closure
          enclosing scope থেকে variable <em>capture</em> করতে পারে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Closure syntax</h2>
        <p>
          Pipe <InlineCode>|...|</InlineCode> দিয়ে parameter। Type annotation
          optional — Rust use দেখে infer করে।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;`}
        />

        <h2 class="mt-10 text-2xl font-bold">Environment capture</h2>
        <p>T-shirt giveaway example:</p>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug, PartialEq, Copy, Clone)]
enum ShirtColor {
    Red,
    Blue,
}

struct Inventory {
    shirts: Vec<ShirtColor>,
}

impl Inventory {
    fn giveaway(&self, user_preference: Option<ShirtColor>) -> ShirtColor {
        user_preference.unwrap_or_else(|| self.most_stocked())
    }

    fn most_stocked(&self) -> ShirtColor {
        let mut num_red = 0;
        let mut num_blue = 0;

        for color in &self.shirts {
            match color {
                ShirtColor::Red => num_red += 1,
                ShirtColor::Blue => num_blue += 1,
            }
        }
        if num_red > num_blue { ShirtColor::Red } else { ShirtColor::Blue }
    }
}`}
        />
        <p>
          <InlineCode>|| self.most_stocked()</InlineCode> closure{" "}
          <InlineCode>self</InlineCode>-এর immutable reference capture করছে।
          Function এটা পারে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Type inference — locked after first use</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let example_closure = |x| x;

    let s = example_closure(String::from("hello"));
    let n = example_closure(5);  // ERROR
}`}
        />
        <p>
          প্রথম call-এ type infer হয়ে <InlineCode>String</InlineCode> fixed —
          পরে integer দিলে error।
        </p>

        <h2 class="mt-10 text-2xl font-bold">তিনভাবে capture</h2>

        <h3 class="mt-6 text-xl font-bold">১. Immutable borrow</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let list = vec![1, 2, 3];
    println!("Before defining closure: {list:?}");

    let only_borrows = || println!("From closure: {list:?}");

    println!("Before calling closure: {list:?}");
    only_borrows();
    println!("After calling closure: {list:?}");
}`}
        />
        <p>list pre, during, post — সবখানে accessible (just reading)।</p>

        <h3 class="mt-6 text-xl font-bold">২. Mutable borrow</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut list = vec![1, 2, 3];

    let mut borrows_mutably = || list.push(7);

    borrows_mutably();
    println!("After calling closure: {list:?}");
}`}
        />
        <p>
          Closure-ও <InlineCode>mut</InlineCode>। closure-এর use period-এ
          list অন্য জায়গায় access করা যাবে না।
        </p>

        <h3 class="mt-6 text-xl font-bold">৩. Move ownership</h3>
        <CodeBlock
          lang="rust"
          code={`use std::thread;

fn main() {
    let list = vec![1, 2, 3];

    thread::spawn(move || println!("From thread: {list:?}"))
        .join()
        .unwrap();
}`}
        />
        <p>
          <InlineCode>move</InlineCode> keyword — closure ownership নেয়।
          Thread-এ পাঠানোর সময় essential — main thread আগে শেষ হয়ে গেলে
          reference invalid হয়ে যেত।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Fn trait family</h2>
        <p>
          Closure কীভাবে capture handle করছে তার উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে
          এক বা একাধিক trait implement করে:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>FnOnce</strong> — সবাই implement করে, কারণ অন্তত একবার call
            করা যায়। Captured value-কে <em>move</em> করে এমন closure শুধু
            FnOnce।
          </li>
          <li>
            <strong>FnMut</strong> — captured value mutate করে, কিন্তু move
            করে না। একাধিকবার call করা যায়।
          </li>
          <li>
            <strong>Fn</strong> — neither move nor mutate। concurrent call-ও
            safe।
          </li>
        </ul>
        <p>
          <InlineCode>unwrap_or_else</InlineCode>-এর signature এই concept use
          করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl<T> Option<T> {
    pub fn unwrap_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T
    {
        match self {
            Some(x) => x,
            None => f(),
        }
    }
}`}
        />
        <p>
          <InlineCode>FnOnce</InlineCode> — সবচেয়ে flexible bound, কারণ একবার
          call হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">sort_by_key — FnMut লাগে</h2>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    list.sort_by_key(|r| r.width);
    println!("{list:#?}");
}`}
        />
        <p>
          <InlineCode>sort_by_key</InlineCode> closure-কে multiple বার call
          করে — প্রতিটা item-এর জন্য — তাই FnMut চায়।
        </p>

        <h3 class="mt-6 text-xl font-bold">FnOnce-এর মতো closure দিলে fail</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    let mut sort_operations = vec![];
    let value = String::from("closure called");

    list.sort_by_key(|r| {
        sort_operations.push(value);  // value MOVE হচ্ছে — শুধু একবার-যোগ্য
        r.width
    });
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0507]: cannot move out of \`value\`, a captured variable in an \`FnMut\` closure`}
        />
        <p>
          <InlineCode>value</InlineCode> ownership-by-move — দ্বিতীয়বার call-এ
          আর থাকবে না। FnOnce এ ঠিক, কিন্তু sort_by_key FnMut চায়।
        </p>

        <h3 class="mt-6 text-xl font-bold">Fix — counting</h3>
        <CodeBlock
          lang="rust"
          code={`let mut num_sort_operations = 0;
list.sort_by_key(|r| {
    num_sort_operations += 1;
    r.width
});`}
        />
        <p>
          এখানে closure শুধু mutable reference capture করছে (move না) — FnMut
          satisfied।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Closure বনাম Function — পার্থক্য</h2>
        <table class="border-collapse text-sm">
          <thead>
            <tr class="border-b border-[var(--border)]">
              <th class="px-4 py-2 text-left">Feature</th>
              <th class="px-4 py-2 text-left">Closure</th>
              <th class="px-4 py-2 text-left">Function</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-[var(--border)]">
              <td class="px-4 py-2">Capture environment</td>
              <td class="px-4 py-2">✓</td>
              <td class="px-4 py-2">✗</td>
            </tr>
            <tr class="border-b border-[var(--border)]">
              <td class="px-4 py-2">Type annotation</td>
              <td class="px-4 py-2">Optional</td>
              <td class="px-4 py-2">আবশ্যক</td>
            </tr>
            <tr>
              <td class="px-4 py-2">Inline syntax</td>
              <td class="px-4 py-2">|x| x + 1</td>
              <td class="px-4 py-2">fn ...</td>
            </tr>
          </tbody>
        </table>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>|x| body</InlineCode> closure syntax; type inferred।
          </li>
          <li>
            Capture তিন ভাবে — immutable borrow, mutable borrow,{" "}
            <InlineCode>move</InlineCode> ownership।
          </li>
          <li>
            <InlineCode>FnOnce</InlineCode> / <InlineCode>FnMut</InlineCode> /{" "}
            <InlineCode>Fn</InlineCode> — call frequency + mutation
            constraint।
          </li>
          <li>
            Higher-order method (e.g., <InlineCode>unwrap_or_else</InlineCode>,
            <InlineCode>sort_by_key</InlineCode>) appropriate trait bound use
            করে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৩.১: Closure · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ closure syntax, environment capture, move keyword, এবং FnOnce/FnMut/Fn trait family।",
    },
  ],
};
