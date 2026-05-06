import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-01-box";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Box&lt;T&gt; দিয়ে heap-এ data রাখা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Using Box&lt;T&gt; to Point to Data on the Heap
        </p>
        <p class="mt-3">
          সবচেয়ে সরল smart pointer হলো <strong>box</strong> — type হিসেবে{" "}
          <InlineCode>Box&lt;T&gt;</InlineCode>। Box তোমার data-কে stack-এর
          বদলে heap-এ রাখে; stack-এ থাকে শুধু সেই heap-data-এর pointer। আগের
          ৪ নম্বর অধ্যায়ে stack ও heap নিয়ে কথা বলেছিলাম — সেটা মাথায় রাখো।
        </p>
        <p class="mt-3">
          Box-এর কোনো performance overhead নেই (heap-এ data থাকা ছাড়া), আবার
          extra capability-ও নেই। তিনটি situation-এ এটা সবচেয়ে কাজে আসে:
        </p>
        <ul class="ml-6 mt-2 list-disc space-y-1">
          <li>
            যখন type-এর size compile time-এ জানা যায় না, কিন্তু এমন context-এ
            value দরকার যেখানে exact size লাগে।
          </li>
          <li>
            যখন বড় amount data-এর ownership transfer করতে চাও, কিন্তু সেই
            transfer-এ data copy হোক চাও না।
          </li>
          <li>
            যখন তুমি একটা value own করতে চাও, কিন্তু আগ্রহ শুধু এতেই — সেটা
            একটা specific trait implement করে কিনা, type কোনটা সেটা না (এটাকে
            বলে <em>trait object</em>; অধ্যায় ১৮-এ আসবে)।
          </li>
        </ul>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Heap-এ data store</h2>
        <p>
          Syntax আগে দেখি — কীভাবে box-এর সাথে interact হয়।
          নিচে একটা <InlineCode>i32</InlineCode> heap-এ রাখা হচ্ছে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let b = Box::new(5);
    println!("b = {b}");
}`}
        />
        <p>
          <InlineCode>b</InlineCode> একটা <InlineCode>Box</InlineCode> —
          heap-এ থাকা <InlineCode>5</InlineCode>-কে point করছে। Print হবে{" "}
          <InlineCode>b = 5</InlineCode>। যেকোনো owned value-এর মতো,
          scope-এর শেষে box deallocate হয় — box নিজে (stack-এ) এবং সে
          যেই data-কে point করছিল (heap-এ), দুটোই।
        </p>
        <p>
          একটা single value box-এ রাখা সাধারণত খুব useful না — i32-এর মতো
          জিনিস stack-এ থাকাই ভালো। আসল কাজে box লাগে এমন সব জায়গায় যেখানে
          box ছাড়া type-ই define করা যায় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Recursive type — box ছাড়া অসম্ভব</h2>
        <p>
          <strong>Recursive type</strong> মানে — একটা type-এর value-এর
          ভেতরে আবার সেই same type-এর value থাকতে পারে। সমস্যা হলো — Rust-কে
          compile time-এ জানতে হয় একটা type কত space নেবে। কিন্তু recursive
          nesting theoretically infinite হতে পারে — Rust জানে না কত space
          লাগবে। Box-এর size তো জানা (একটা pointer-এর size); তাই recursive
          definition-এ box ঢুকিয়ে দিলে compiler-এর সমস্যা মিটে যায়।
        </p>

        <h3 class="mt-6 text-xl font-bold">Cons list — example</h3>
        <p>
          Recursive type-এর classic example হিসেবে <strong>cons list</strong>{" "}
          দেখব। এটা Lisp-এর data structure — দুই-element pair-এর nested
          chain, Lisp-এর version-এর linked list। নাম এসেছে{" "}
          <InlineCode>cons</InlineCode> function থেকে (construct function),
          যেটা দু'টা argument থেকে নতুন pair বানায়। একটা pair-এ একটা value আর
          আরেকটা pair — recursive ভাবে chain করলে পুরো list।
        </p>
        <p>
          Pseudocode-এ <InlineCode>1, 2, 3</InlineCode> list:
        </p>
        <CodeBlock lang="text" code={`(1, (2, (3, Nil)))`} />
        <p>
          প্রতিটা item-এ দুটো জিনিস — current value, এবং next item। শেষ
          item-এ value নেই, শুধু <InlineCode>Nil</InlineCode> — recursion-এর
          base case। (এটা চ্যাপ্টার ৬-এর "null" বা "nil" না — সেটা invalid
          value, এটা list-এর ending marker।)
        </p>
        <p>
          Rust-এ cons list প্রায়শই use হয় না — সাধারণত{" "}
          <InlineCode>Vec&lt;T&gt;</InlineCode> ভালো। কিন্তু concept-এর জন্য
          এটা সরল।
        </p>

        <h3 class="mt-6 text-xl font-bold">প্রথম attempt — compile হবে না</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, List),
    Nil,
}

fn main() {}`}
        />
        <p>
          <em>Note:</em> generics দিয়ে যেকোনো type-এর জন্য বানানো যেত —
          সরলতার জন্য শুধু <InlineCode>i32</InlineCode>।
        </p>
        <p>
          List <InlineCode>1, 2, 3</InlineCode> use করতে চাইলে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, List),
    Nil,
}

// --snip--

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}`}
        />
        <p>Compile করতে গেলে error:</p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0072]: recursive type \`List\` has infinite size
 --> src/main.rs:1:1
  |
1 | enum List {
  | ^^^^^^^^^
2 |     Cons(i32, List),
  |               ---- recursive without indirection
  |
help: insert some indirection (e.g., a \`Box\`, \`Rc\`, or \`&\`) to break the cycle
  |
2 |     Cons(i32, Box<List>),
  |               ++++    +`}
        />
        <p>
          "infinite size" — কারণ <InlineCode>Cons</InlineCode> variant-এ আরেকটা
          List directly। কেন এটা সমস্যা সেটা বোঝার জন্য আগে দেখি Rust
          non-recursive type-এর size কিভাবে calculate করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Non-recursive type-এর size</h3>
        <p>
          চ্যাপ্টার ৬-এর <InlineCode>Message</InlineCode> enum:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {}`}
        />
        <p>
          Rust প্রতিটা variant দেখে — কোনটা সবচেয়ে বেশি জায়গা নেয়।{" "}
          <InlineCode>Quit</InlineCode> কিছুই না,{" "}
          <InlineCode>Move</InlineCode> দুটো i32, ইত্যাদি। যেহেতু একসাথে শুধু
          একটাই variant হবে — সবচেয়ে বড় variant-এর সমান space-ই যথেষ্ট।
        </p>
        <p>
          কিন্তু List-এর ক্ষেত্রে — Cons variant-এ একটা i32 + একটা List।
          সেই List-এর size জানতে আবার Cons-এ ঢুকতে হবে — i32 + List → i32 +
          List → ... অনন্ত। Compiler-এর কাছে কোনো end নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Box দিয়ে fix</h2>
        <p>
          Compiler নিজেই hint দিয়েছে — "Box, Rc, বা & দিয়ে indirection
          ঢোকাও"। Indirection মানে — value সরাসরি না রেখে value-এর pointer
          রাখা।
        </p>
        <p>
          <InlineCode>Box&lt;T&gt;</InlineCode> একটা pointer — তার size fixed,
          T যতই বড় হোক না কেন। তাই <InlineCode>Cons</InlineCode>-এ List-এর
          জায়গায় <InlineCode>Box&lt;List&gt;</InlineCode> দিলে — actual List
          variant-এর ভেতরে না থেকে heap-এ থাকবে, Cons-এ থাকবে শুধু pointer।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
}`}
        />
        <p>
          এখন <InlineCode>Cons</InlineCode> = i32 + box-এর pointer-data —
          fixed size। <InlineCode>Nil</InlineCode> তো কিছুই না। Compile হবে।
        </p>
        <p>
          Box শুধু indirection আর heap allocation দেয় — অন্য কোনো special
          capability না। Cons list-এ এটাই দরকার।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Smart pointer হিসেবে box</h2>
        <p>
          <InlineCode>Box&lt;T&gt;</InlineCode>-কে smart pointer বলা হয়
          কারণ এটা <InlineCode>Deref</InlineCode> trait implement করে — এর
          ফলে regular reference-এর মতো behave করে। আবার scope-এর শেষে box
          drop হলে এর{" "}
          <InlineCode>Drop</InlineCode> implementation heap-data-ও cleanup
          করে। পরের দু'টা পাঠে এই দুই trait — যেটা এই অধ্যায়ের বাকি smart
          pointer-গুলোর foundation।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Box&lt;T&gt;</InlineCode> data-কে heap-এ রাখে; stack-এ
            থাকে pointer।
          </li>
          <li>
            Box-এর তিন main use — recursive/unknown-size type, বড় data
            move-এ copy এড়ানো, এবং trait object।
          </li>
          <li>
            Recursive type যেমন cons list — direct nesting-এ "infinite size"
            error; <InlineCode>Box&lt;List&gt;</InlineCode> দিয়ে indirection
            ঢুকিয়ে fix।
          </li>
          <li>
            Box smart pointer — <InlineCode>Deref</InlineCode> এবং{" "}
            <InlineCode>Drop</InlineCode> implement করে। পরের পাঠে detail।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.১: Box<T> দিয়ে heap-এ data · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর Box<T> smart pointer — heap allocation, recursive type-এর জন্য indirection, এবং cons list।",
    },
  ],
};
