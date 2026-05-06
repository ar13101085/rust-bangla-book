import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch08-02-strings";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৮.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          String দিয়ে UTF-8 text রাখা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Storing UTF-8 Encoded Text with Strings
        </p>
        <p class="mt-3">
          Rust-এর core-এ দু'টা string type:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>&str</InlineCode> — borrowed, immutable string slice।
          </li>
          <li>
            <InlineCode>String</InlineCode> — standard library থেকে; growable,
            mutable, owned, UTF-8 encoded।
          </li>
        </ul>
        <p>
          <InlineCode>String</InlineCode> আসলে একটা{" "}
          <InlineCode>Vec&lt;u8&gt;</InlineCode>-এর wrapper — extra guarantee
          সহ।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">String তৈরি</h2>
        <CodeBlock lang="rust" code={`let mut s = String::new();`} />
        <p>Literal থেকে — দু'রকমেই কাজ করে:</p>
        <CodeBlock
          lang="rust"
          code={`let s = "initial contents".to_string();
let s = String::from("initial contents");`}
        />
        <p>
          <InlineCode>String::from</InlineCode> এবং{" "}
          <InlineCode>.to_string()</InlineCode> একই কাজ করে — style choice।
        </p>
        <p>
          UTF-8 — সব valid:
        </p>
        <CodeBlock
          lang="rust"
          code={`let hello = String::from("السلام عليكم");
let hello = String::from("Dobrý den");
let hello = String::from("Hello");
let hello = String::from("שלום");
let hello = String::from("नमस्ते");
let hello = String::from("こんにちは");
let hello = String::from("안녕하세요");
let hello = String::from("你好");
let hello = String::from("Olá");
let hello = String::from("Здравствуйте");
let hello = String::from("Hola");
let hello = String::from("নমস্কার");`}
        />

        <h2 class="mt-10 text-2xl font-bold">Update — push_str ও push</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("foo");
    s.push_str("bar");
    // s == "foobar"
}`}
        />
        <p>
          <InlineCode>push_str</InlineCode> <InlineCode>&str</InlineCode> নেয় —
          ownership নেয় না, তাই original valid থাকে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s1 = String::from("foo");
    let s2 = "bar";
    s1.push_str(s2);
    println!("s2 is {s2}");
}`}
        />
        <p>
          <InlineCode>push</InlineCode> একটা single character যোগ করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("lo");
    s.push('l');
    // s == "lol"
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">+ operator দিয়ে concatenate</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2; // note s1 has been moved here
}`}
        />
        <p>এর behavior দেখতে অদ্ভুত। ভিতরে কী হচ্ছে দেখি।</p>
        <p>
          <InlineCode>+</InlineCode> operator{" "}
          <InlineCode>add</InlineCode> method call করে:
        </p>
        <CodeBlock lang="rust" code={`fn add(self, s: &str) -> String { ... }`} />
        <p>
          দু'টো লক্ষণীয় বিষয়:
        </p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            <strong>s2-এর আগে &</strong> দরকার — কারণ{" "}
            <InlineCode>add</InlineCode> <InlineCode>&str</InlineCode> চায়।{" "}
            <InlineCode>&s2</InlineCode> <InlineCode>&String</InlineCode> দেয় —
            Rust deref coercion দিয়ে <InlineCode>&str</InlineCode>-এ convert
            করে নেয়।
          </li>
          <li>
            <strong>s1 move হয়</strong> — <InlineCode>add</InlineCode>{" "}
            <InlineCode>self</InlineCode> নেয় (reference না)। তাই{" "}
            <InlineCode>+</InlineCode>-এর পরে <InlineCode>s1</InlineCode>{" "}
            ব্যবহার করা যাবে না।
          </li>
        </ol>

        <h2 class="mt-10 text-2xl font-bold">format! macro — cleaner</h2>
        <p>
          অনেকগুলো string concatenate করতে <InlineCode>+</InlineCode> verbose:
        </p>
        <CodeBlock
          lang="rust"
          code={`let s = s1 + "-" + &s2 + "-" + &s3;`}
        />
        <p><InlineCode>format!</InlineCode> অনেক ভালো:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("tic");
    let s2 = String::from("tac");
    let s3 = String::from("toe");

    let s = format!("{s1}-{s2}-{s3}");
}`}
        />
        <p>
          <InlineCode>format!</InlineCode> <InlineCode>println!</InlineCode>-এর
          মতো — কিন্তু print না করে <InlineCode>String</InlineCode> return
          করে। এটা reference নেয় — কোনো argument move হয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">String index — allowed না</h2>
        <CodeBlock
          lang="rust"
          code={`let s1 = String::from("hi");
let h = s1[0];`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: the type \`str\` cannot be indexed by \`{integer}\``}
        />
        <p>
          কেন? — কারণ <InlineCode>String</InlineCode> = <InlineCode>Vec&lt;u8&gt;</InlineCode>
          । প্রতিটা byte access করতে দিলে UTF-8 character-এর মাঝখানে কেটে
          যাওয়ার সম্ভাবনা।
        </p>
        <p>
          উদাহরণ: <InlineCode>"Hola"</InlineCode> — ৪ byte (প্রতি letter ১
          byte)। কিন্তু <InlineCode>"Здравствуйте"</InlineCode> — ২৪ byte
          (প্রতি Cyrillic letter ২ byte)। index 0 দিলে byte 208 — কোনো character
          না, <InlineCode>З</InlineCode>-এর প্রথম byte।
        </p>

        <h3 class="mt-6 text-xl font-bold">UTF-8 কে ৩-ভাবে দেখা যায়</h3>
        <p>
          নমস্কার-এর hindi version <InlineCode>नमस्ते</InlineCode>-কে দেখো:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Bytes</strong> (১৮টা): [224, 164, 168, 224, 164, 174, 224,
            164, 184, 224, 165, 141, 224, 164, 164, 224, 165, 135]
          </li>
          <li>
            <strong>Unicode scalar value</strong> (<InlineCode>char</InlineCode>
            , ৬টা): ['न', 'म', 'स', '्', 'त', 'े'] — ৪র্থ এবং ৬ষ্ঠ diacritic,
            একা অর্থহীন।
          </li>
          <li>
            <strong>Grapheme cluster</strong> (মানুষের দেখা letter, ৪টা):
            ["न", "म", "स्", "ते"]
          </li>
        </ul>
        <p>
          Rust তিনটা interpretation-এর জন্য আলাদা method দেয়, যাতে তুমিই ঠিক
          করতে পার কোন level-এ কাজ করবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">String slice — সাবধানে</h2>
        <p>Range দিয়ে slice করা যায়:</p>
        <CodeBlock
          lang="rust"
          code={`let hello = "Здравствуйте";

let s = &hello[0..4]; // s == "Зд" (প্রতি Cyrillic letter ২ byte)`}
        />
        <p>
          কিন্তু character-এর মাঝখানে slice করলে runtime panic:
        </p>
        <CodeBlock
          lang="text"
          filename="runtime panic"
          code={`thread 'main' panicked at src/main.rs:4:19:
byte index 1 is not a char boundary; it is inside 'З' (bytes 0..2) of \`Здравствуйте\``}
        />

        <h2 class="mt-10 text-2xl font-bold">Iterate — chars() ও bytes()</h2>
        <CodeBlock
          lang="rust"
          code={`for c in "Зд".chars() {
    println!("{c}");
}
// З
// д`}
        />
        <CodeBlock
          lang="rust"
          code={`for b in "Зд".bytes() {
    println!("{b}");
}
// 208
// 151
// 208
// 180`}
        />
        <p>
          Grapheme cluster-এর iteration standard library-তে নেই — crates.io-এর
          third-party crate লাগবে। কারণ — grapheme cluster computation
          surprisingly complex।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>String</InlineCode> = <InlineCode>Vec&lt;u8&gt;</InlineCode>{" "}
            wrapper, UTF-8 encoded। Create:{" "}
            <InlineCode>String::new()</InlineCode>,{" "}
            <InlineCode>String::from()</InlineCode>,{" "}
            <InlineCode>.to_string()</InlineCode>।
          </li>
          <li>
            <InlineCode>push_str</InlineCode> (str), <InlineCode>push</InlineCode>{" "}
            (char), <InlineCode>+</InlineCode> (left moves), <InlineCode>format!</InlineCode>{" "}
            (cleanest, no move)।
          </li>
          <li>
            String index allowed না — UTF-8 byte boundary-এর জন্য।
          </li>
          <li>
            Slice possible (<InlineCode>&s[0..4]</InlineCode>) কিন্তু character
            boundary-এ না হলে panic।
          </li>
          <li>
            <InlineCode>.chars()</InlineCode>,{" "}
            <InlineCode>.bytes()</InlineCode> — দু'রকম iteration; grapheme
            cluster তৃতীয়-পক্ষ crate লাগে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৮.২: String দিয়ে UTF-8 text রাখা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ String, UTF-8 encoding, push_str/push/+/format!, কেন index disallowed, এবং chars/bytes iteration।",
    },
  ],
};
