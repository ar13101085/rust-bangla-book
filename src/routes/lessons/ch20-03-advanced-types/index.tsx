import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch20-03-advanced-types";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২০.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Advanced Type</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Advanced Types</p>
        <p class="mt-3">
          Rust-এর type system-এ আরও কিছু দরকারি ধারণা আছে — newtype pattern,
          type alias, never type (<InlineCode>!</InlineCode>), এবং dynamically
          sized type। সব মিলিয়ে complex API ও safe abstraction গড়ার যন্ত্রপাতি।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Newtype pattern — type safety</h2>
        <p>
          Newtype pattern শুধু orphan rule এড়াতে না — type confusion প্রতিরোধেও
          কাজ করে। যেমন <InlineCode>Millimeters(u32)</InlineCode> ও{" "}
          <InlineCode>Meters(u32)</InlineCode> — দু'টোই u32 wrap, কিন্তু compile
          time-এ আলাদা type। ভুল করে mix করলে compile error।
        </p>
        <p>
          আরেকটা ব্যবহার — internal implementation hide। যেমন{" "}
          <InlineCode>People</InlineCode> type{" "}
          <InlineCode>HashMap&lt;i32, String&gt;</InlineCode> wrap করে public
          API দেয় — user HashMap-এর existence জানতেও পারে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          Type alias — <InlineCode>type</InlineCode> keyword
        </h2>
        <p>
          <InlineCode>type</InlineCode> দিয়ে একটা type-এর synonym তৈরি:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    type Kilometers = i32;

    let x: i32 = 5;
    let y: Kilometers = 5;

    println!("x + y = {}", x + y);
}`}
        />
        <p>
          লক্ষ করো — <InlineCode>Kilometers</InlineCode> আলাদা type না, শুধু{" "}
          <InlineCode>i32</InlineCode>-এর synonym। তাই type-mix-এ compiler
          কিছু বলবে না। এই দিক থেকে newtype pattern-এর চেয়ে দুর্বল।
        </p>

        <h3 class="mt-6 text-xl font-bold">কখন alias দরকার</h3>
        <p>
          লম্বা type বারবার লেখা থেকে বাঁচাতে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let f: Box<dyn Fn() + Send + 'static> = Box::new(|| println!("hi"));

    fn takes_long_type(f: Box<dyn Fn() + Send + 'static>) {
        // --snip--
    }

    fn returns_long_type() -> Box<dyn Fn() + Send + 'static> {
        // --snip--
        Box::new(|| ())
    }
}`}
        />
        <p>Alias দিয়ে পরিষ্কার:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    type Thunk = Box<dyn Fn() + Send + 'static>;

    let f: Thunk = Box::new(|| println!("hi"));

    fn takes_long_type(f: Thunk) {
        // --snip--
    }

    fn returns_long_type() -> Thunk {
        // --snip--
        Box::new(|| ())
    }
}`}
        />

        <h3 class="mt-6 text-xl font-bold">
          Result alias — <InlineCode>std::io</InlineCode>-র অভ্যাস
        </h3>
        <CodeBlock
          lang="rust"
          code={`use std::fmt;

type Result<T> = std::result::Result<T, std::io::Error>;

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
    fn flush(&mut self) -> Result<()>;

    fn write_all(&mut self, buf: &[u8]) -> Result<()>;
    fn write_fmt(&mut self, fmt: fmt::Arguments) -> Result<()>;
}`}
        />
        <p>
          সবগুলো method-এ <InlineCode>std::io::Error</InlineCode> বার বার লেখার
          বদলে শুধু <InlineCode>Result&lt;T&gt;</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          Never type — <InlineCode>!</InlineCode>
        </h2>
        <p>
          <InlineCode>!</InlineCode> = empty type, never type। কোনো value নেই —
          এমন function-এর return type যা <em>কখনো return করে না</em>:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn bar() -> ! {
    // --snip--
    panic!();
}`}
        />
        <p>
          এ ধরনের function-কে বলে <strong>diverging function</strong>।
        </p>

        <h3 class="mt-6 text-xl font-bold">
          <InlineCode>!</InlineCode>-এর বাস্তব ব্যবহার
        </h3>
        <p>
          Match-এর সব arm-এর type একই হতে হবে — কিন্তু{" "}
          <InlineCode>continue</InlineCode>, <InlineCode>panic!</InlineCode>,
          <InlineCode>break</InlineCode>, infinite loop সবগুলোর type{" "}
          <InlineCode>!</InlineCode>। এটা যেকোনো type-এ coerce হতে পারে।
          Guessing game থেকে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let guess = "3";
    let guess = match guess.trim().parse() {
        Ok(num) => num,
        Err(_) => continue,
    };
}`}
        />
        <p>
          এক arm <InlineCode>u32</InlineCode>, আরেক arm{" "}
          <InlineCode>continue</InlineCode> — ! coerce হয়ে u32 হয়ে যায়,
          conflict নেই।
        </p>
        <p>
          <InlineCode>unwrap</InlineCode>-এর মধ্যেও একই কাজ:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum Option<T> {
    Some(T),
    None,
}

use crate::Option::*;

impl<T> Option<T> {
    pub fn unwrap(self) -> T {
        match self {
            Some(val) => val,
            None => panic!("called \`Option::unwrap()\` on a \`None\` value"),
        }
    }
}`}
        />
        <p>
          <InlineCode>panic!</InlineCode>-এর type{" "}
          <InlineCode>!</InlineCode> — তাই overall match{" "}
          <InlineCode>T</InlineCode> return করতে পারে।
        </p>
        <p>Infinite loop:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    print!("forever ");

    loop {
        print!("and ever ");
    }
}`}
        />
        <p>
          break ছাড়া infinite loop-এর type <InlineCode>!</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          Dynamically Sized Type এবং <InlineCode>Sized</InlineCode>
        </h2>
        <p>
          Rust সাধারণত compile time-এ সব type-এর size জানে। কিন্তু কিছু type-এর
          size শুধু runtime-এ — এদের বলে <strong>DST</strong> বা{" "}
          <em>unsized type</em>।
        </p>
        <p>
          সবচেয়ে চেনা — <InlineCode>str</InlineCode>। সরাসরি variable বানানো
          যায় না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1: str = "Hello there!";
    let s2: str = "How's it going?";
}`}
        />
        <p>
          কারণ <InlineCode>s1</InlineCode> = 12 byte, <InlineCode>s2</InlineCode>{" "}
          = 15 byte — same type-এর সব value একই size হতে হবে। সমাধান —
          pointer-এর পেছনে রাখা: <InlineCode>&str</InlineCode>। যা দু'টা value
          ধরে রাখে — pointer + length। তাই compile time-এ size জানা — সবসময়{" "}
          <InlineCode>2 * usize</InlineCode>।
        </p>

        <h3 class="mt-6 text-xl font-bold">DST-এর golden rule</h3>
        <p>
          DST-এর value সবসময় কোনো না কোনো pointer-এর পেছনে থাকতে হবে। যেমন:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li><InlineCode>&str</InlineCode>, <InlineCode>Box&lt;str&gt;</InlineCode>, <InlineCode>Rc&lt;str&gt;</InlineCode></li>
          <li>
            Trait-এ — <InlineCode>&dyn Trait</InlineCode>,{" "}
            <InlineCode>Box&lt;dyn Trait&gt;</InlineCode>,{" "}
            <InlineCode>Rc&lt;dyn Trait&gt;</InlineCode>
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">
          <InlineCode>Sized</InlineCode> trait
        </h3>
        <p>
          Compile time-এ size জানা type-গুলো auto <InlineCode>Sized</InlineCode>
          ।
        </p>
        <p>
          গোপন বিষয় — Rust প্রতিটা generic function-এ implicit{" "}
          <InlineCode>Sized</InlineCode> bound যোগ করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn generic<T>(t: T) {
    // --snip--
}`}
        />
        <p>আসলে এটা treat হয়:</p>
        <CodeBlock
          lang="rust"
          code={`fn generic<T: Sized>(t: T) {
    // --snip--
}`}
        />
        <p>
          DST allow করতে চাইলে <InlineCode>?Sized</InlineCode> bound:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn generic<T: ?Sized>(t: &T) {
    // --snip--
}`}
        />
        <p>
          মানে — "T sized হতে পারে, না-ও হতে পারে"। যেহেতু possibly unsized,
          parameter-কে pointer-এর পেছনে রাখতে হয় (এখানে{" "}
          <InlineCode>&T</InlineCode>)। <InlineCode>?Sized</InlineCode> শুধু{" "}
          <InlineCode>Sized</InlineCode>-এর জন্যই available।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Newtype — type confusion প্রতিরোধ ও implementation hide; runtime
            cost শূন্য।
          </li>
          <li>
            <InlineCode>type</InlineCode> alias — synonym, আলাদা type না; লম্বা
            type-নাম পরিষ্কার রাখার জন্য।
          </li>
          <li>
            Never type <InlineCode>!</InlineCode> — diverging function;{" "}
            <InlineCode>panic!</InlineCode>, <InlineCode>continue</InlineCode>,
            infinite loop-এর type।
          </li>
          <li>
            DST — runtime-এ size; pointer-এর পেছনে থাকতে হবে (যেমন{" "}
            <InlineCode>&str</InlineCode>, <InlineCode>Box&lt;dyn Trait&gt;</InlineCode>)।
          </li>
          <li>
            Generic-এ implicit <InlineCode>Sized</InlineCode> bound;{" "}
            <InlineCode>?Sized</InlineCode> দিয়ে relax করা যায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২০.৩: Advanced Type · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ newtype, type alias, never type, dynamically sized type এবং Sized trait।",
    },
  ],
};
