import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch03-01-variables-and-mutability";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৩.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Variable এবং Mutability
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Variables and Mutability
        </p>
        <p class="mt-3">
          Rust-এ variable default-এ <strong>immutable</strong> — মান একবার দিলে
          আর বদলানো যায় না। এটা language-এর অন্যতম পরিচায়ক feature, যেটা
          safety এবং easy concurrency-র দিকে তোমাকে ঠেলে দেয়। দরকার হলে অবশ্যই
          mutable বানানো যায়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Default-এ immutable</h2>
        <p>
          একটা নতুন project বানিয়ে test করি:
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ cargo new variables`} />
        <p>
          <InlineCode>src/main.rs</InlineCode>-এ এই code লেখো — এটা compile হবে
          না:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let x = 5;
    println!("The value of x is: {x}");
    x = 6;
    println!("The value of x is: {x}");
}`}
        />
        <p><InlineCode>cargo run</InlineCode> চালালে error:</p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0384]: cannot assign twice to immutable variable \`x\`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         - first assignment to \`x\`
3 |     println!("The value of x is: {x}");
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable
  |
help: consider making this binding mutable
  |
2 |     let mut x = 5;
  |         +++`}
        />
        <p>
          Compiler বলছে — immutable variable-এ দ্বিতীয়বার assign করা যাবে না।
          এই compile-time error গুরুত্বপূর্ণ: যখন তুমি বলেছ একটা value বদলাবে
          না, Rust নিশ্চিত করে যে আসলেই বদলায়নি। ফলে code পড়া সহজ — কোথাও
          surprise বদল নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Mutable variable</h2>
        <p>
          mutable করতে variable-এর নামের আগে <InlineCode>mut</InlineCode>{" "}
          keyword যোগ করো। <InlineCode>mut</InlineCode> পরবর্তী reader-কে
          জানিয়েও দেয় — "এই variable-এর value পরে বদলাবে"।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let mut x = 5;
    println!("The value of x is: {x}");
    x = 6;
    println!("The value of x is: {x}");
}`}
        />
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run
The value of x is: 5
The value of x is: 6`}
        />
        <p>
          <InlineCode>mut</InlineCode> use করব কিনা — এটা পুরোটাই তোমার
          choice। কিছু জায়গায় mutability code-কে স্পষ্ট করে, কিছু জায়গায়
          immutability।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Constants</h2>
        <p>
          <strong>Constant</strong>-ও immutable variable-এর মতো — কিন্তু কয়েকটা
          পার্থক্য আছে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>mut</InlineCode> use করা যায় না — constant সবসময়
            immutable।
          </li>
          <li>
            <InlineCode>let</InlineCode>-এর জায়গায় <InlineCode>const</InlineCode>{" "}
            keyword।
          </li>
          <li>Type annotate করা <em>আবশ্যক</em>।</li>
          <li>যেকোনো scope-এ declare করা যায়, এমনকি global-এও।</li>
          <li>
            শুধু <em>constant expression</em> set করা যায় — runtime-এ compute
            হওয়া কিছু না।
          </li>
        </ul>
        <CodeBlock
          lang="rust"
          code={`const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;`}
        />
        <p>
          Constant-এর নামের convention — সব uppercase, word-এর মাঝে underscore।
          Rust compile-time-এ কিছু simple operation evaluate করতে পারে, তাই{" "}
          <InlineCode>10_800</InlineCode> না লিখে{" "}
          <InlineCode>60 * 60 * 3</InlineCode> লেখা যায় — পরের developer-এর জন্য
          অর্থ স্পষ্ট থাকে।
        </p>
        <p>
          Constants সারা program-এ valid থাকে এবং একই hardcoded value
          একাধিক জায়গায় ব্যবহার হলে সেগুলোকে constant হিসেবে নাম দেওয়া
          maintainability-র জন্য ভালো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Shadowing</h2>
        <p>
          Rust-এ একই নামে নতুন variable declare করা যায় — পুরোনোটাকে নতুনটা{" "}
          <strong>shadow</strong> করে। এর মানে compiler পরবর্তী জায়গায় সেই
          নাম দেখলে নতুন variable-টাই দেখবে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let x = 5;

    let x = x + 1;

    {
        let x = x * 2;
        println!("The value of x in the inner scope is: {x}");
    }

    println!("The value of x is: {x}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`The value of x in the inner scope is: 12
The value of x is: 6`}
        />
        <p>
          এখানে — প্রথমে <InlineCode>x = 5</InlineCode>, তারপর{" "}
          <InlineCode>let x = x + 1</InlineCode> পুরোনো x (5) ব্যবহার করে নতুন
          x (6) তৈরি করে। inner block-এ আবার <InlineCode>let x = x * 2</InlineCode>{" "}
          নতুন একটা x (12) বানায় — কিন্তু সেটা শুধু সেই block-এর ভিতরে valid।
          Block শেষ হলে outer-এর x-এ ফিরে আসা হয়, যার value 6।
        </p>

        <h3 class="mt-6 text-xl font-bold">Shadowing বনাম mut — পার্থক্য</h3>
        <p>
          <strong>প্রথম পার্থক্য</strong> — shadowing-এর জন্য{" "}
          <InlineCode>let</InlineCode> keyword আবার লিখতে হয়। ভুলে গেলে compile
          error — যেটা একটা গুরুত্বপূর্ণ safeguard। Transformation-এর পর
          variable-টা আবার immutable হয়ে যায়।
        </p>
        <p>
          <strong>দ্বিতীয় পার্থক্য</strong> — shadowing আসলে নতুন variable
          তৈরি করে, তাই type-ও বদলানো যায়। Mutable variable-এ type বদলানো যায়
          না।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let spaces = "   ";
    let spaces = spaces.len();
}`}
        />
        <p>
          এখানে প্রথম <InlineCode>spaces</InlineCode> string, দ্বিতীয়টা number।
          Shadowing-এ type-conversion-এর জন্য আলাদা নাম (<InlineCode>spaces_str</InlineCode>
          , <InlineCode>spaces_num</InlineCode>) লাগে না।
        </p>
        <p>
          কিন্তু <InlineCode>mut</InlineCode> দিয়ে এটা করতে চাইলে error:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut spaces = "   ";
    spaces = spaces.len();
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
2 |     let mut spaces = "   ";
  |                      ----- expected due to this value
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected \`&str\`, found \`usize\``}
        />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>let</InlineCode>-এ variable default-এ immutable;{" "}
            <InlineCode>let mut</InlineCode> দিয়ে mutable।
          </li>
          <li>
            <InlineCode>const</InlineCode> সবসময় immutable, type annotation
            আবশ্যক, শুধু constant expression।
          </li>
          <li>
            <strong>Shadowing</strong> — একই নামে নতুন{" "}
            <InlineCode>let</InlineCode>; type বদলানো যায়, scope শেষ হলে
            পুরোনোটায় ফেরা।
          </li>
          <li>
            <InlineCode>mut</InlineCode> বনাম shadowing — mut একই variable-এর
            value বদলায়, shadowing নতুন variable বানায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৩.১: Variable এবং Mutability · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ variable, let, mut, const, এবং shadowing — কখন কোনটা ব্যবহার করব।",
    },
  ],
};
