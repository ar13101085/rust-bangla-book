import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch10-03-lifetime-syntax";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১০.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Lifetime দিয়ে reference validate করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Validating References with Lifetimes
        </p>
        <p class="mt-3">
          <strong>Lifetime</strong> এক ধরনের generic — কিন্তু type না, একটা
          reference কতদূর পর্যন্ত valid সেটা describe করে। বেশিরভাগ সময় Rust
          implicitly infer করে; কিন্তু সম্ভাব্য একাধিক relationship থাকলে
          আমাদের explicitly বলে দিতে হয়। Lifetime-এর মূল লক্ষ্য —{" "}
          <strong>dangling reference prevent করা</strong>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Dangling reference</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let r;

    {
        let x = 5;
        r = &x;
    }

    println!("r: {r}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0597]: \`x\` does not live long enough
 --> src/main.rs:6:13
  |
5 |         let x = 5;
  |             - binding \`x\` declared here
6 |         r = &x;
  |             ^^ borrowed value does not live long enough
7 |     }
  |     - \`x\` dropped here while still borrowed`}
        />
        <p>
          <InlineCode>x</InlineCode> inner block-এর শেষে drop। কিন্তু{" "}
          <InlineCode>r</InlineCode> তখনো বাইরে — তার reference invalid হত।
          Rust borrow-checker এই সম্পর্ক compile time-এ চেক করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Lifetime diagram</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {r}");   //          |
}                         // ---------+`}
        />
        <p>
          <InlineCode>'b</InlineCode> (x-এর lifetime) <InlineCode>'a</InlineCode>{" "}
          (r-এর lifetime)-এর চেয়ে ছোট। Reference-এর জন্য এটা violation —
          borrowed data borrower-এর চেয়ে দীর্ঘ বাঁচতে হবে।
        </p>
        <p>উল্টোটা valid:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {r}");   //   |       |
                          // --+       |
}                         // ----------+`}
        />

        <h2 class="mt-10 text-2xl font-bold">Function-এ generic lifetime</h2>
        <p>
          এই function লিখব — দুটো string slice-এর মধ্যে যেটা বড়, সেটা
          return:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}

fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0106]: missing lifetime specifier
 --> src/main.rs:9:33
  |
9 | fn longest(x: &str, y: &str) -> &str {
  |               ----     ----     ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from \`x\` or \`y\``}
        />
        <p>
          Compiler বলছে — return-এর reference x থেকে আসছে না y থেকে, signature-এ
          নেই। Borrow checker bound check করতে পারছে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Lifetime annotation syntax</h2>
        <p>
          Lifetime parameter apostrophe <InlineCode>'</InlineCode> দিয়ে শুরু,
          সাধারণত ছোট nameing যেমন <InlineCode>'a</InlineCode>। Reference-এ{" "}
          <InlineCode>&</InlineCode>-এর পরে:
        </p>
        <CodeBlock
          lang="rust"
          code={`&i32        // a reference
&'a i32     // a reference with an explicit lifetime
&'a mut i32 // a mutable reference with an explicit lifetime`}
        />
        <p>
          Lifetime annotation reference-এর actual lifetime <em>change</em> করে
          না — শুধু একটা relationship describe করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">longest — fixed</h2>
        <CodeBlock
          lang="rust"
          code={`fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}`}
        />
        <p>
          মানে — "এমন একটা lifetime <InlineCode>'a</InlineCode> আছে যেখানে x ও
          y দু'জনেই অন্তত ততটুকু বাঁচে, এবং return-করা reference-ও ততটুকু
          বাঁচে"। Returned reference-এর effective lifetime হবে input দু'টোর
          মধ্যে <strong>যেটা ছোট</strong>।
        </p>

        <h3 class="mt-6 text-xl font-bold">Compile-হওয়া example</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {result}");
    }
}`}
        />
        <p>
          <InlineCode>result</InlineCode> ব্যবহার হচ্ছে inner block-এর ভিতরে —
          যেখানে দু'টোই valid। Compiles।
        </p>

        <h3 class="mt-6 text-xl font-bold">Fail-করা example</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {result}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0597]: \`string2\` does not live long enough`}
        />
        <p>
          string2 inner block-এর শেষে drop। result সেটার reference হতে পারত
          (bigger পেলে) — পরে use unsafe। Rust সরাসরি block।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কখন কোন param-এ lifetime</h2>
        <p>
          সব reference-এ same lifetime দরকার নেই। যদি function কোনো particular
          parameter-ই return করে — তাহলে শুধু সেটাকেই annotate:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}`}
        />
        <p>
          এখানে y-এর lifetime নিয়ে concern নেই। Return-এর reference শুধু
          x-এর সাথে tied।
        </p>
        <p>
          Local data-র reference return — সবসময় ভুল:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0515]: cannot return value referencing local variable \`result\``}
        />
        <p>
          Function শেষ হলে <InlineCode>result</InlineCode> drop — তার reference
          dangling। সমাধান: reference না, owned <InlineCode>String</InlineCode>{" "}
          return।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Struct-এ lifetime</h2>
        <p>
          Struct-এ reference field রাখতে চাইলে lifetime annotate দরকার:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}`}
        />
        <p>
          Instance-টা তার field-এর reference-এর চেয়ে বেশিদিন বাঁচতে পারবে
          না। Compiler enforce করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Lifetime elision rules</h2>
        <p>
          আগে আমরা <InlineCode>first_word(s: &str) -&gt; &str</InlineCode>{" "}
          লিখেছি কোনো annotation ছাড়াই। কীভাবে compile হলো?
        </p>
        <p>
          Compiler কিছু সহজ pattern recognize করে — সেগুলোতে annotation
          automatic infer। তিনটা rule:
        </p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            <strong>Rule 1 (input):</strong> প্রতিটা reference parameter আলাদা
            lifetime পায়। <InlineCode>fn f(x: &i32, y: &i32)</InlineCode> →{" "}
            <InlineCode>fn f&lt;'a, 'b&gt;(x: &'a i32, y: &'b i32)</InlineCode>।
          </li>
          <li>
            <strong>Rule 2 (single input):</strong> ঠিক একটাই input lifetime
            থাকলে, সেটাই সব output-এ apply।{" "}
            <InlineCode>fn f(x: &i32) -&gt; &i32</InlineCode> →{" "}
            <InlineCode>fn f&lt;'a&gt;(x: &'a i32) -&gt; &'a i32</InlineCode>।
          </li>
          <li>
            <strong>Rule 3 (method):</strong> Multiple input lifetime, কিন্তু
            একটা <InlineCode>&self</InlineCode> বা{" "}
            <InlineCode>&mut self</InlineCode> — তখন self-এর lifetime সব
            output-এ।
          </li>
        </ol>
        <p>
          <InlineCode>first_word(s: &str) -&gt; &str</InlineCode> rule 1
          একটা input lifetime দেয়, rule 2 সেটাই output-এ — হয়ে গেল।
        </p>
        <p>
          <InlineCode>longest(x: &str, y: &str) -&gt; &str</InlineCode> — rule 1
          দু'টা lifetime, rule 2 apply হয় না (multiple input), rule 3 apply হয়
          না (no self)। তাই compile error।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Method-এ lifetime</h2>
        <CodeBlock
          lang="rust"
          code={`impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}`}
        />
        <p>
          <InlineCode>impl&lt;'a&gt;</InlineCode> declare করতে হয়;{" "}
          <InlineCode>&self</InlineCode>-এর lifetime elision-এ infer।
        </p>
        <CodeBlock
          lang="rust"
          code={`impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}`}
        />
        <p>
          Rule 3-এ output-এর lifetime self-এর সাথে tied — কোনো explicit
          annotation দরকার নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">'static lifetime</h2>
        <p>
          Special lifetime <InlineCode>'static</InlineCode> — পুরো program
          চলাকালীন valid। সব string literal-এর lifetime{" "}
          <InlineCode>'static</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`let s: &'static str = "I have a static lifetime.";`}
        />
        <p>
          কারণ — literal-এর data executable-এর binary-তে hardcoded।
        </p>
        <p>
          সতর্কতা: error message-এ "consider 'static" দেখলে সাবধান। অধিকাংশ
          সময় আসল সমস্যা — কোথাও dangling reference, যেটা fix করতে হবে। শুধু{" "}
          <InlineCode>'static</InlineCode> বসিয়ে compiler-কে চুপ করানো ভুল।
        </p>

        <h2 class="mt-10 text-2xl font-bold">তিনটাই একসাথে</h2>
        <CodeBlock
          lang="rust"
          code={`use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {ann}");
    if x.len() > y.len() { x } else { y }
}`}
        />
        <p>
          Generic type <InlineCode>T</InlineCode> + lifetime{" "}
          <InlineCode>'a</InlineCode> + trait bound{" "}
          <InlineCode>T: Display</InlineCode> — সব এক signature-এ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Lifetime — reference কতদূর valid তার generic; main goal dangling
            prevent।
          </li>
          <li>
            Annotation syntax — <InlineCode>&'a T</InlineCode>; relationship
            describe করে, change না।
          </li>
          <li>
            Function-এ একাধিক reference + reference return → annotation দরকার;
            single input → elision-এ ok।
          </li>
          <li>
            Struct-এ reference field → struct-এ lifetime parameter।
          </li>
          <li>
            তিনটা elision rule — input, single-input, method।
          </li>
          <li>
            <InlineCode>'static</InlineCode> = program-জীবনের জন্য valid; শুধু
            literal-এর জন্য সরাসরি, অন্যত্র সাবধানে।
          </li>
          <li>
            Generic + trait bound + lifetime সব এক signature-এ মিলতে পারে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১০.৩: Lifetime দিয়ে reference validate · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ lifetime annotation, dangling prevention, three elision rules, struct lifetime, এবং 'static।",
    },
  ],
};
