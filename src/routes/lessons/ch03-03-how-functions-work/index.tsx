import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch03-03-how-functions-work";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৩.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Function কীভাবে কাজ করে
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Functions</p>
        <p class="mt-3">
          Function Rust code-এর basic building block। এই পাঠে আমরা দেখব function
          declare করা, parameter এবং return value পাঠানো, এবং Rust-এর সবচেয়ে
          গুরুত্বপূর্ণ একটা concept — <strong>statement বনাম expression</strong>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Function syntax</h2>
        <p>
          <InlineCode>fn</InlineCode> keyword দিয়ে function declare হয়। Rust-এর
          convention — function এবং variable নাম <strong>snake_case</strong>:
          সব lowercase, word-এর মাঝে underscore।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`Hello, world!
Another function.`}
        />
        <p>
          লক্ষ্য করো — <InlineCode>another_function</InlineCode>{" "}
          <InlineCode>main</InlineCode>-এর <em>পরে</em> define করা; কিন্তু
          আমরা আগে call করতে পারছি। Rust-এ function কোথায় define করা সেটা
          গুরুত্বপূর্ণ না, যতক্ষণ caller-এর scope-এ visible।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Parameter</h2>
        <p>
          Function-এর signature-এ parameter declare করা যায় — প্রতিটার type{" "}
          <em>আবশ্যক</em>। এই deliberate decision-এর কারণে compiler-এর error
          message সাহায্যকারী হয়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {x}");
}`}
        />
        <p>একাধিক parameter — comma-separated:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`The measurement is: 5h`}
        />

        <h2 class="mt-10 text-2xl font-bold">Statement বনাম Expression</h2>
        <p>
          Rust একটা <em>expression-based</em> language — এই পার্থক্যটা না বুঝলে
          পরের অনেক কিছু confusing লাগবে।
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Statement</strong> — কোনো action perform করে, কিন্তু value
            return করে না।
          </li>
          <li>
            <strong>Expression</strong> — evaluate হয়ে একটা value দেয়।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">Statement — value return করে না</h3>
        <p>
          <InlineCode>let</InlineCode> দিয়ে variable bind করা একটা statement।
          Function definition-ও statement।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let y = 6;
}`}
        />
        <p>
          এই কারণে <InlineCode>let</InlineCode>-কে আরেকটা variable-এ assign
          করা যায় না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = (let y = 6);
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error: expected expression, found \`let\` statement
 --> src/main.rs:2:14
  |
2 |     let x = (let y = 6);
  |              ^^^`}
        />
        <p>
          C, Ruby, JavaScript-এ <InlineCode>x = y = 6</InlineCode> কাজ করে —
          কারণ assignment ঐ language-গুলোতে value return করে। Rust-এ করে না।
        </p>

        <h3 class="mt-6 text-xl font-bold">Expression — value হয়</h3>
        <p>
          Math operation (<InlineCode>5 + 6</InlineCode>) → <InlineCode>11</InlineCode>
          ; function call expression; macro call expression; <strong>block</strong>{" "}
          (curly bracket) expression।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let y = {
        let x = 3;
        x + 1
    };

    println!("The value of y is: {y}");
}`}
        />
        <p>
          Block-টা evaluate হয়ে <InlineCode>4</InlineCode> দিচ্ছে, যেটা{" "}
          <InlineCode>y</InlineCode>-এ bind হলো।
        </p>
        <p>
          <strong>খুবই গুরুত্বপূর্ণ:</strong> expression-এর শেষে semicolon{" "}
          <em>নেই</em>। semicolon দিলে এটা statement হয়ে যাবে — value আর return
          করবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Return value</h2>
        <p>
          Return type declare হয় <InlineCode>-&gt;</InlineCode> arrow-এর পরে।
          Function-এর শেষ expression-এর value-ই return হয় (early return চাইলে{" "}
          <InlineCode>return</InlineCode> keyword)।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn five() -> i32 {
    5
}

fn main() {
    let x = five();

    println!("The value of x is: {x}");
}`}
        />
        <p>
          লক্ষ্য করো — <InlineCode>5</InlineCode>-এর পর semicolon নেই। থাকলে
          এটা statement হয়ে যেত, return হতো না।
        </p>
        <p>Parameter সহ:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let x = plus_one(5);

    println!("The value of x is: {x}");
}

fn plus_one(x: i32) -> i32 {
    x + 1
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Semicolon-এর ভুল</h3>
        <p>
          নতুন Rust developer-এর সবচেয়ে common bug:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn plus_one(x: i32) -> i32 {
    x + 1;
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
 --> src/main.rs:7:24
  |
7 | fn plus_one(x: i32) -> i32 {
  |    --------            ^^^ expected \`i32\`, found \`()\`
  |    |
  |    implicitly returns \`()\` as its body has no tail or \`return\` expression
8 |     x + 1;
  |          - help: remove this semicolon to return this value`}
        />
        <p>
          Function declaration বলেছে <InlineCode>i32</InlineCode> return করবে,
          কিন্তু body-এর শেষে semicolon থাকায় কিছুই return হচ্ছে না (অর্থাৎ{" "}
          <InlineCode>()</InlineCode> — unit type)। Compiler সরাসরি বলে দিচ্ছে
          — semicolon সরাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>fn</InlineCode> দিয়ে function; convention{" "}
            <strong>snake_case</strong>।
          </li>
          <li>Parameter-এর type আবশ্যক; multiple parameter comma-separated।</li>
          <li>
            <strong>Statement</strong> action করে, value return করে না;{" "}
            <strong>expression</strong> value-এ evaluate হয়।
          </li>
          <li>
            Block (<InlineCode>{`{...}`}</InlineCode>) একটা expression — শেষ
            expression-ই value।
          </li>
          <li>
            Return type <InlineCode>-&gt; T</InlineCode>; function body-এর শেষ
            expression-ই return value (semicolon থাকলে statement হয়ে যাবে)।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৩.৩: Function কীভাবে কাজ করে · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ function declare করা, parameter, return value, এবং statement বনাম expression-এর পার্থক্য।",
    },
  ],
};
