import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch03-02-data-types";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৩.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Data Type-সমূহ</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Data Types</p>
        <p class="mt-3">
          Rust একটা <em>statically typed</em> language — compile time-এ সব
          variable-এর type জানা থাকতে হবে। সাধারণত compiler value দেখে infer
          করতে পারে, কিন্তু একাধিক type সম্ভব হলে আমাদের explicit annotation
          দিতে হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`let guess: u32 = "42".parse().expect("Not a number!");`}
        />
        <p>
          <InlineCode>: u32</InlineCode> না দিলে compile error — কারণ{" "}
          <InlineCode>parse</InlineCode> অনেক type-এ convert করতে পারে।
        </p>
        <p>
          এই পাঠে দুটো বড় category দেখব — <strong>scalar</strong> (একটামাত্র
          value) এবং <strong>compound</strong> (একাধিক value একসাথে)।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Scalar type</h2>
        <p>
          Rust-এ চারটে primary scalar type — integer, floating-point, Boolean,
          এবং character।
        </p>

        <h3 class="mt-6 text-xl font-bold">Integer</h3>
        <p>
          সংখ্যা — যাদের decimal নেই। <InlineCode>i</InlineCode> দিয়ে শুরু হলে{" "}
          <strong>signed</strong> (negative হতে পারে), <InlineCode>u</InlineCode>{" "}
          দিয়ে শুরু হলে <strong>unsigned</strong> (শুধু non-negative)। size
          bits-এ:
        </p>
        <CodeBlock
          lang="text"
          filename="Table 3-1"
          code={`Length     | Signed | Unsigned
8-bit      | i8     | u8
16-bit     | i16    | u16
32-bit     | i32    | u32
64-bit     | i64    | u64
128-bit    | i128   | u128
arch-dep   | isize  | usize`}
        />
        <p>
          Signed range: −2^(n−1) থেকে 2^(n−1)−1। যেমন <InlineCode>i8</InlineCode>
          : −128 থেকে 127। Unsigned range: 0 থেকে 2^n−1। যেমন{" "}
          <InlineCode>u8</InlineCode>: 0 থেকে 255।
        </p>
        <p>
          <InlineCode>isize</InlineCode> ও <InlineCode>usize</InlineCode> তোমার
          machine-এর architecture-এর উপর নির্ভর করে — 64-bit machine-এ 64 bits,
          32-bit machine-এ 32 bits। সাধারণত collection index করার সময় use করা
          হয়।
        </p>
        <p>Rust-এ integer literal কয়েকভাবে লেখা যায়:</p>
        <CodeBlock
          lang="text"
          filename="Table 3-2"
          code={`Number literal | Example
Decimal        | 98_222
Hex            | 0xff
Octal          | 0o77
Binary         | 0b1111_0000
Byte (u8)      | b'A'`}
        />
        <p>
          <InlineCode>_</InlineCode> visual separator — <InlineCode>1_000</InlineCode>{" "}
          আর <InlineCode>1000</InlineCode> এক জিনিস। Suffix দিয়েও type
          fix করা যায় — যেমন <InlineCode>57u8</InlineCode>।
        </p>
        <p>
          কোন integer type use করব — confused হলে default-এ{" "}
          <InlineCode>i32</InlineCode> দিয়ে শুরু করো; বেশিরভাগ ক্ষেত্রে এটাই
          সঠিক।
        </p>

        <h4 class="mt-4 text-lg font-bold">Integer overflow</h4>
        <p>
          ধরো <InlineCode>u8</InlineCode>-এ 256 store করতে চাইলে — range-এর
          বাইরে। এটাকে বলে <strong>integer overflow</strong>।
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Debug build-এ</strong> — Rust panic করে runtime-এ। "panic"
            মানে program error দিয়ে exit করা।
          </li>
          <li>
            <strong>Release build-এ (<InlineCode>--release</InlineCode>)</strong>{" "}
            — overflow check off। Two's complement wrapping হয় — 256 হয়ে
            যাবে 0, 257 হবে 1, ইত্যাদি। Program crash হবে না, কিন্তু value তোমার
            expectation-এর সাথে মিলবে না।
          </li>
        </ul>
        <p>
          Overflow-কে explicit handle করতে standard library-তে কয়েকটা method
          family আছে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>wrapping_*</InlineCode> — সব mode-এ wrap (যেমন{" "}
            <InlineCode>wrapping_add</InlineCode>)।
          </li>
          <li>
            <InlineCode>checked_*</InlineCode> — overflow হলে{" "}
            <InlineCode>None</InlineCode> return।
          </li>
          <li>
            <InlineCode>overflowing_*</InlineCode> — value এবং একটা boolean
            (overflow হয়েছে কিনা) return।
          </li>
          <li>
            <InlineCode>saturating_*</InlineCode> — type-এর min/max-এ আটকে যায়।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">Floating-point</h3>
        <p>
          Decimal-যুক্ত সংখ্যা। দুটো type — <InlineCode>f32</InlineCode> (32
          bits) এবং <InlineCode>f64</InlineCode> (64 bits)। Default{" "}
          <InlineCode>f64</InlineCode> — modern CPU-তে f32-এর প্রায় same speed
          কিন্তু precision বেশি। দুটোই signed; IEEE-754 standard follow করে।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 2.0; // f64

    let y: f32 = 3.0; // f32
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Numeric operations</h3>
        <p>
          সব number type-এ basic math — addition, subtraction, multiplication,
          division, remainder। Integer division zero-এর দিকে truncate করে।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    // addition
    let sum = 5 + 10;

    // subtraction
    let difference = 95.5 - 4.3;

    // multiplication
    let product = 4 * 30;

    // division
    let quotient = 56.7 / 32.2;
    let truncated = -5 / 3; // Results in -1

    // remainder
    let remainder = 43 % 5;
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Boolean</h3>
        <p>
          <InlineCode>bool</InlineCode> type — দুটো value:{" "}
          <InlineCode>true</InlineCode>, <InlineCode>false</InlineCode>। size
          এক byte।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let t = true;

    let f: bool = false; // with explicit type annotation
}`}
        />
        <p>সাধারণত <InlineCode>if</InlineCode> condition-এ ব্যবহার হয়।</p>

        <h3 class="mt-6 text-xl font-bold">Character</h3>
        <p>
          <InlineCode>char</InlineCode> — Rust-এর সবচেয়ে primitive alphabetic
          type। একটা Unicode scalar value, 4 bytes size।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let c = 'z';
    let z: char = 'ℤ'; // with explicit type annotation
    let heart_eyed_cat = '😻';
}`}
        />
        <p>
          <InlineCode>char</InlineCode>-এর জন্য <strong>single quote</strong>{" "}
          (<InlineCode>'z'</InlineCode>); string-এর জন্য double quote (
          <InlineCode>"z"</InlineCode>)। ASCII-র বাইরে — Bangla, Chinese,
          Japanese, emoji — সব valid char। তবে সতর্ক: Unicode-এ "character"-এর
          definition আমাদের intuition-এর মতো নয়, পরে Chapter 8-এ দেখব।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Compound type</h2>
        <p>
          একাধিক value একসাথে রাখার জন্য Rust-এ দুটো primitive compound type —{" "}
          <strong>tuple</strong> এবং <strong>array</strong>।
        </p>

        <h3 class="mt-6 text-xl font-bold">Tuple</h3>
        <p>
          আলাদা আলাদা type-এর value group করার সাধারণ উপায়। fixed length —
          declare করার পর size বদলানো যায় না।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}`}
        />
        <p>
          Pattern matching দিয়ে individual value বের করা — একে বলে{" "}
          <strong>destructuring</strong>:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let tup = (500, 6.4, 1);

    let (x, y, z) = tup;

    println!("The value of y is: {y}");
}`}
        />
        <p>
          অথবা index দিয়ে সরাসরি access — index 0 থেকে শুরু:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x: (i32, f64, u8) = (500, 6.4, 1);

    let five_hundred = x.0;

    let six_point_four = x.1;

    let one = x.2;
}`}
        />
        <p>
          Empty tuple — <InlineCode>()</InlineCode> — একটা special name আছে:{" "}
          <strong>unit</strong>। যেসব expression কোনো value return করে না, তারা
          implicitly unit return করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Array</h3>
        <p>
          Tuple-এর মতো — তবে সব element-এর type একই হতে হবে। size fixed।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let a = [1, 2, 3, 4, 5];
}`}
        />
        <p>
          Array data <strong>stack</strong>-এ allocate হয় (heap-এ না)।
          Size-পরিবর্তনযোগ্য collection দরকার হলে{" "}
          <InlineCode>Vec</InlineCode> (vector) use করতে হবে — Chapter 8-এ আসবে।
        </p>
        <p>
          নির্দিষ্ট সংখ্যক element সবসময় থাকবে — যেমন বছরের ১২ মাস — তখন array
          ভালো:
        </p>
        <CodeBlock
          lang="rust"
          code={`let months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];`}
        />
        <p>
          Array-এর type — <InlineCode>[type; size]</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`let a: [i32; 5] = [1, 2, 3, 4, 5];`}
        />
        <p>
          সব element একই value হলে — <InlineCode>[value; count]</InlineCode>:
        </p>
        <CodeBlock lang="rust" code={`let a = [3; 5];`} />
        <p>
          এটা <InlineCode>[3, 3, 3, 3, 3]</InlineCode>-এর সমান।
        </p>

        <h4 class="mt-4 text-lg font-bold">Element access</h4>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let a = [1, 2, 3, 4, 5];

    let first = a[0];
    let second = a[1];
}`}
        />

        <h4 class="mt-4 text-lg font-bold">Invalid index → panic</h4>
        <p>
          Array-এর সীমার বাইরে index দিলে runtime error:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::io;

fn main() {
    let a = [1, 2, 3, 4, 5];

    println!("Please enter an array index.");

    let mut index = String::new();

    io::stdin()
        .read_line(&mut index)
        .expect("Failed to read line");

    let index: usize = index
        .trim()
        .parse()
        .expect("Index entered was not a number");

    let element = a[index];

    println!("The value of the element at index {index} is: {element}");
}`}
        />
        <p>User <InlineCode>10</InlineCode> দিলে:</p>
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`thread 'main' panicked at src/main.rs:19:19:
index out of bounds: the len is 5 but the index is 10
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace`}
        />
        <p>
          Rust runtime-এ check করে — index length-এর কম কিনা। কম না হলে
          panic, program exit। অনেক low-level language এই check করে না — invalid
          memory access হয়, বড় security risk। Rust এই error থেকে তোমাকে রক্ষা
          করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Scalar — integer (i8…i128, u8…u128, isize, usize), float (f32,
            f64), bool, char।
          </li>
          <li>
            Integer overflow — debug-এ panic, release-এ wrap;{" "}
            <InlineCode>wrapping_*</InlineCode>/<InlineCode>checked_*</InlineCode>
            /<InlineCode>overflowing_*</InlineCode>/
            <InlineCode>saturating_*</InlineCode> দিয়ে explicit handle।
          </li>
          <li>
            Compound — tuple (mixed type, fixed length, destructure বা{" "}
            <InlineCode>.0</InlineCode>); array (একই type, fixed size, stack
            allocation)।
          </li>
          <li>Array-এ out-of-bounds access হলে runtime panic।</li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৩.২: Data Type-সমূহ · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর scalar type (integer, float, bool, char) এবং compound type (tuple, array)।",
    },
  ],
};
