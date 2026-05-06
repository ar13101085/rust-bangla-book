import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch08-01-vectors";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৮.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Vector দিয়ে list রাখা</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Storing Lists of Values with Vectors
        </p>
        <p class="mt-3">
          <InlineCode>Vec&lt;T&gt;</InlineCode> Rust-এর growable list — একই
          type-এর একাধিক value contiguous memory-তে রাখে। array-এর মতো —
          কিন্তু size dynamic, heap-এ থাকে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">নতুন Vector তৈরি</h2>
        <p>খালি vector — type annotate করতে হয়:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v: Vec<i32> = Vec::new();
}`}
        />
        <p>
          কোনো initial value না দেওয়ায় Rust infer করতে পারছে না — তাই{" "}
          <InlineCode>: Vec&lt;i32&gt;</InlineCode>।
        </p>
        <p>
          সাধারণত আমরা <InlineCode>vec!</InlineCode> macro use করি — initial
          value-গুলো দিলে type infer হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v = vec![1, 2, 3];
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Update — push</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut v = Vec::new();

    v.push(5);
    v.push(6);
    v.push(7);
    v.push(8);
}`}
        />
        <p>
          <InlineCode>mut</InlineCode> দরকার (modify হচ্ছে)। Type compiler
          push-এর value দেখে infer করছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Element read করার দু'উপায়</h2>
        <p>
          <strong>১. Index access</strong> — out-of-bounds হলে panic:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v = vec![1, 2, 3, 4, 5];

    let third: &i32 = &v[2];
    println!("The third element is {third}");
}`}
        />
        <p>
          <strong>২. .get()</strong> — out-of-bounds হলে{" "}
          <InlineCode>None</InlineCode> return, panic না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v = vec![1, 2, 3, 4, 5];

    let third: Option<&i32> = v.get(2);
    match third {
        Some(third) => println!("The third element is {third}"),
        None => println!("There is no third element."),
    }
}`}
        />
        <p>
          কখন কোনটা?<InlineCode>[]</InlineCode> — যখন invalid access হলে
          program crash চাও (bug সাথে সাথে ধরা পড়ুক)। <InlineCode>.get()</InlineCode>{" "}
          — যখন graceful handle করতে চাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Borrow-checker — reference vs push</h2>
        <p>
          এই code compile হবে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut v = vec![1, 2, 3, 4, 5];

    let first = &v[0];

    v.push(6);

    println!("The first element is: {first}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0502]: cannot borrow \`v\` as mutable because it is also borrowed as immutable`}
        />
        <p>
          কেন? — vector full হয়ে গেলে <InlineCode>push</InlineCode> reallocate
          করে data নতুন memory-তে copy করে। তখন আগের{" "}
          <InlineCode>first</InlineCode> reference invalid হয়ে যেত। Rust এই
          dangling pointer compile-time-এই block করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Iterate করা</h2>
        <p>Immutable iterate:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v = vec![100, 32, 57];
    for i in &v {
        println!("{i}");
    }
}`}
        />
        <p>Mutable iterate — element-গুলো বদলাতে:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut v = vec![100, 32, 57];
    for i in &mut v {
        *i += 50;
    }
}`}
        />
        <p>
          <InlineCode>*i</InlineCode> — <strong>dereference</strong>।{" "}
          <InlineCode>i</InlineCode> reference, <InlineCode>*i</InlineCode>{" "}
          মূল value। <InlineCode>*</InlineCode> operator-এর বিস্তারিত Chapter
          15-এ।
        </p>
        <p>
          Iterate-এর সময় insert/remove allowed না — borrow-checker prevent করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">একাধিক type — enum দিয়ে trick</h2>
        <p>
          Vec-এ সব same type। কিন্তু compile-time-এ জানা variant-গুলোর
          combination চাইলে enum:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];`}
        />
        <p>
          সব element <InlineCode>SpreadsheetCell</InlineCode> type-এর — Rust
          satisfied। যখন iterate বা access করব, তখন{" "}
          <InlineCode>match</InlineCode> দিয়ে variant-অনুযায়ী handle করতে হবে।
        </p>
        <p>
          Compile-time-এ variant জানা না থাকলে — trait object (Chapter 18-এ)।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Vector drop = element-ও drop</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    {
        let v = vec![1, 2, 3, 4];

        // do stuff with v
    } // <- v goes out of scope and is freed here
}`}
        />
        <p>
          Vec drop হলে এর সব element-ও drop হয়। Borrow-checker নিশ্চিত করে —
          vec valid থাকা পর্যন্তই তার element-এর reference valid।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Vec::new()</InlineCode> বা <InlineCode>vec![1,2,3]</InlineCode>
            ; <InlineCode>.push()</InlineCode> দিয়ে add (mut)।
          </li>
          <li>
            Read — <InlineCode>&v[i]</InlineCode> (panic) বা{" "}
            <InlineCode>v.get(i)</InlineCode> (Option)।
          </li>
          <li>
            Reference + push একসাথে allowed না — reallocation invalidate করে।
          </li>
          <li>
            <InlineCode>for i in &v</InlineCode>, <InlineCode>for i in &mut v</InlineCode>{" "}
            (with <InlineCode>*i</InlineCode> dereference)।
          </li>
          <li>
            একাধিক type চাইলে enum variant; compile-time-এ unknown হলে trait
            object (পরে আসবে)।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৮.১: Vector দিয়ে list রাখা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Vec<T> তৈরি, push, indexing vs .get(), iteration, এবং enum দিয়ে heterogeneous content।",
    },
  ],
};
