import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch04-02-references-and-borrowing";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৪.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Reference এবং Borrowing
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          References and Borrowing
        </p>
        <p class="mt-3">
          আগের পাঠে দেখলাম — function-কে value pass করলে ownership move হয়,
          আবার ফেরত পেতে return করতে হয়। এটা irritating। এর সমাধান —{" "}
          <strong>reference</strong>। Reference হলো address — তুমি data দেখতে
          পারো কিন্তু owner হবে না।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">&String — reference নেওয়া</h2>
        <p>
          আগের <InlineCode>calculate_length</InlineCode> function-কে রিরাইট
          করি — ownership-এর বদলে reference নেবে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{s1}' is {len}.");
}

fn calculate_length(s: &String) -> usize {
    s.len()
}`}
        />
        <p>
          লক্ষ্য করো — tuple-return-এর ceremony চলে গেছে।{" "}
          <InlineCode>&s1</InlineCode> argument হিসেবে যাচ্ছে; function-এর
          parameter <InlineCode>s: &String</InlineCode>।{" "}
          <InlineCode>&</InlineCode> চিহ্নটা reference বোঝায়।
        </p>
        <p>
          Reference একটা pointer-এর মতো — address থাকে, address follow করলে
          data পাওয়া যায়। কিন্তু pointer থেকে আলাদা: Rust-এর reference সবসময়{" "}
          <em>একটা valid value</em>-এর দিকে point করে — compiler গ্যারান্টি দেয়।
        </p>
        <p>
          <InlineCode>&s1</InlineCode> reference তৈরি করে, যেটা{" "}
          <InlineCode>s1</InlineCode>-এর value-র দিকে নির্দেশ করে কিন্তু
          ownership নেয় না। তাই function শেষ হলে value drop হয় না — কারণ
          reference-এর কাছে ownership-ই ছিল না।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn calculate_length(s: &String) -> usize { // s is a reference to a String
    s.len()
} // Here, s goes out of scope. But because s does not have ownership of what
  // it refers to, the String is not dropped.`}
        />

        <h2 class="mt-10 text-2xl font-bold">Borrowing</h2>
        <p>
          Reference তৈরি করার action-কে আমরা <strong>borrowing</strong> বলি।
          জীবনের মতোই — কারো জিনিস নিতে পারো, কিন্তু কাজ শেষে ফেরত দিতে হয়।
          মালিক তো হও না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Reference default-এ immutable</h2>
        <p>
          Reference-এর মাধ্যমে data modify করতে চাইলে — কাজ করবে না:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let s = String::from("hello");

    change(&s);
}

fn change(some_string: &String) {
    some_string.push_str(", world");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0596]: cannot borrow \`*some_string\` as mutable, as it is behind a \`&\` reference
 --> src/main.rs:8:5
  |
8 |     some_string.push_str(", world");
  |     ^^^^^^^^^^^ \`some_string\` is a \`&\` reference, so the data it refers to cannot be borrowed as mutable
  |
help: consider changing this to be a mutable reference
  |
7 | fn change(some_string: &mut String) {
  |                         +++`}
        />
        <p>
          Variable-এর মতো reference-ও default-এ immutable। Borrow করা data
          modify করার অধিকার আমাদের নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Mutable reference — &mut</h2>
        <p>Mutate করতে — তিনটে ছোট পরিবর্তন:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let mut s = String::from("hello");

    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}`}
        />
        <ol class="ml-6 list-decimal space-y-1">
          <li>
            <InlineCode>s</InlineCode>-কে <InlineCode>mut</InlineCode> করো।
          </li>
          <li>
            Reference-এ <InlineCode>&mut s</InlineCode> পাঠাও।
          </li>
          <li>
            Function signature-এ <InlineCode>&mut String</InlineCode> নাও।
          </li>
        </ol>
        <p>
          এখন function intent স্পষ্ট — এটা borrowed value mutate করবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Mutable reference-এর restriction</h2>
        <p>
          <strong>একই value-র mutable reference একসাথে একটাই থাকতে পারে।</strong>
          {" "}অন্য কোনো reference (mutable হোক বা immutable) ঐ সময় থাকতে পারবে
          না।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");

    let r1 = &mut s;
    let r2 = &mut s;

    println!("{r1}, {r2}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0499]: cannot borrow \`s\` as mutable more than once at a time
 --> src/main.rs:5:14
  |
4 |     let r1 = &mut s;
  |              ------ first mutable borrow occurs here
5 |     let r2 = &mut s;
  |              ^^^^^^ second mutable borrow occurs here
6 |
7 |     println!("{r1}, {r2}");
  |                -- first borrow later used here`}
        />
        <p>এই restriction-এ benefit হলো — Rust compile time-এ <strong>data race</strong> prevent করতে পারে।</p>
        <p>Data race-এর তিন শর্ত — যা একসাথে হলে সমস্যা:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>একই data-তে দু'টা বা তার বেশি pointer access করছে।</li>
          <li>অন্তত একটা write করছে।</li>
          <li>Synchronization-এর কোনো mechanism নেই।</li>
        </ul>
        <p>
          Data race undefined behavior তৈরি করে, runtime-এ debug করা ভয়ংকর।
          Rust এই code compile-ই করতে দেয় না।
        </p>

        <h3 class="mt-6 text-xl font-bold">Curly bracket দিয়ে scope বানিয়ে আলাদা করা</h3>
        <p>
          একসাথে না হলে — মানে একটা reference শেষ হয়ে আরেকটা — সমস্যা নেই।
          Scope তৈরি করে আলাদা করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");

    {
        let r1 = &mut s;
    } // r1 goes out of scope here, so we can make a new reference with no problems.

    let r2 = &mut s;
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Mutable + immutable mix-ও না</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");

    let r1 = &s; // no problem
    let r2 = &s; // no problem
    let r3 = &mut s; // BIG PROBLEM

    println!("{r1}, {r2}, and {r3}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0502]: cannot borrow \`s\` as mutable because it is also borrowed as immutable
 --> src/main.rs:6:14
  |
4 |     let r1 = &s; // no problem
  |              -- immutable borrow occurs here
5 |     let r2 = &s; // no problem
6 |     let r3 = &mut s; // BIG PROBLEM
  |              ^^^^^^ mutable borrow occurs here`}
        />
        <p>
          কারণ — যারা immutable reference use করছে, তাদের expectation-এ value
          stable। হঠাৎ পাল্টে গেলে subtle bug। তবে একাধিক immutable reference{" "}
          <em>একসাথে</em> থাকতে পারে — কেউ write করছে না, কারো interfere
          নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Reference-এর scope = শেষ use পর্যন্ত</h2>
        <p>
          Reference-এর scope যেখানে introduce করা হয়েছে সেখান থেকে শুরু হয়ে
          শেষ use পর্যন্ত যায়। এই code compile হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");

    let r1 = &s; // no problem
    let r2 = &s; // no problem
    println!("{r1} and {r2}");
    // Variables r1 and r2 will not be used after this point.

    let r3 = &mut s; // no problem
    println!("{r3}");
}`}
        />
        <p>
          <InlineCode>r1</InlineCode>, <InlineCode>r2</InlineCode>{" "}
          <InlineCode>println!</InlineCode>-এর পর আর use হয় না — তাদের scope
          সেখানেই শেষ। তারপর <InlineCode>r3</InlineCode> মুক্তভাবে borrow করতে
          পারে। একে বলে <strong>Non-Lexical Lifetimes (NLL)</strong> — compiler
          পরের use-পর্যন্তই reference live রাখে, scope-এর শেষ পর্যন্ত না।
        </p>
        <p>
          Borrowing error frustrating মনে হলেও, মনে রেখো — Rust compiler
          potential bug-কে compile time-এ ধরিয়ে দিচ্ছে, যাতে runtime-এ debug
          করতে না হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Dangling reference</h2>
        <p>
          C-তে dangling pointer easily বানানো যায় — memory free হয়ে গেছে কিন্তু
          তার pointer-টা রয়ে গেছে। Rust-এ এটা compile-time-এ blocked।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");

    &s
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0106]: missing lifetime specifier
 --> src/main.rs:5:16
  |
5 | fn dangle() -> &String {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from`}
        />
        <p>
          Error-এ <em>lifetime</em>-এর কথা — সেটা পরের পাঠে আসছে। মূল কথা:{" "}
          <InlineCode>s</InlineCode> function-এর ভিতরে তৈরি, function শেষ হলেই
          drop। সেই drop-হওয়া <InlineCode>s</InlineCode>-এর reference return
          করলে — invalid pointer। Rust এটা হতে দেয় না।
        </p>
        <p>সমাধান — reference না দিয়ে value-ই return:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let string = no_dangle();
}

fn no_dangle() -> String {
    let s = String::from("hello");

    s
}`}
        />
        <p>Ownership move হয়ে যায়, কিছুই drop হয় না, dangling-ও নেই।</p>

        <h2 class="mt-10 text-2xl font-bold">Reference-এর rule (সংক্ষেপে)</h2>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            যেকোনো সময়ে — <em>হয়</em> একটা mutable reference, <em>না হয়</em>{" "}
            যেকোনো সংখ্যক immutable reference (একসাথে দু'টা mode না)।
          </li>
          <li>Reference সবসময় valid থাকতে হবে।</li>
        </ol>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>&value</InlineCode> দিয়ে immutable reference,{" "}
            <InlineCode>&mut value</InlineCode> দিয়ে mutable। Reference owner
            হয় না — borrowing।
          </li>
          <li>
            একসাথে একটা mutable reference অথবা যেকোনো সংখ্যক immutable —
            data race prevention।
          </li>
          <li>
            Reference-এর scope শেষ use পর্যন্ত (NLL) — কড়া না, compiler
            smart।
          </li>
          <li>
            Dangling reference Rust-এ অসম্ভব — compile-time-এ block।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৪.২: Reference এবং Borrowing · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ reference, &, &mut, borrowing rule, এবং dangling reference prevention।",
    },
  ],
};
