import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch19-01-all-the-places-for-patterns";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৯.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Pattern কোথায় কোথায় ব্যবহার হয়
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          All the Places Patterns Can Be Used
        </p>
        <p class="mt-3">
          Pattern Rust-এর অনেক জায়গায় ছড়িয়ে আছে — তুমি না বুঝেই
          এগুলো অনেকবার use করেছ। এই পাঠে দেখব pattern কোথায় কোথায় valid।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">match arm</h2>
        <p>
          চ্যাপ্টার ৬-এ আমরা <InlineCode>match</InlineCode>-এর arm-এ pattern
          use করেছি। Formally — <InlineCode>match</InlineCode>-এর structure
          এমন:
        </p>
        <CodeBlock
          lang="rust"
          code={`match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}`}
        />
        <p>চ্যাপ্টার ৬-এর একটা example:</p>
        <CodeBlock
          lang="rust"
          code={`match x {
    None => None,
    Some(i) => Some(i + 1),
}`}
        />
        <p>
          এখানে pattern হলো <InlineCode>None</InlineCode> এবং{" "}
          <InlineCode>Some(i)</InlineCode>।
        </p>
        <p>
          <InlineCode>match</InlineCode>-এ একটা rule — সব possibility cover
          করতে হবে (exhaustive)। Last arm-এ catch-all pattern রাখলে এটা
          নিশ্চিত। বিশেষভাবে <InlineCode>_</InlineCode> pattern — match করে
          সবকিছুর সাথে, কিন্তু variable bind করে না; তাই ignore-এর জন্য
          আদর্শ। বিস্তারিত পরের পাঠে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">let statement</h2>
        <p>
          এই অধ্যায়ের আগে আমরা শুধু <InlineCode>match</InlineCode> এবং{" "}
          <InlineCode>if let</InlineCode>-এ pattern নিয়ে কথা বলেছি, কিন্তু
          আসলে <InlineCode>let</InlineCode>-ও pattern use করে।
        </p>
        <CodeBlock
          lang="rust"
          code={`#![allow(unused)]
fn main() {
let x = 5;
}`}
        />
        <p>
          সাধারণ <InlineCode>let x = 5;</InlineCode>-এ <InlineCode>x</InlineCode>{" "}
          একটা pattern — সবচেয়ে simple form। Formally:
        </p>
        <CodeBlock lang="text" code={`let PATTERN = EXPRESSION;`} />
        <p>
          Variable name একটা trivial pattern — "এই value-কে x নামক
          variable-এ bind করো"।
        </p>
        <p>Tuple destructure-এ pattern-এর শক্তি আরো স্পষ্ট:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let (x, y, z) = (1, 2, 3);
}`}
        />
        <p>
          Rust value <InlineCode>(1, 2, 3)</InlineCode>-কে pattern{" "}
          <InlineCode>(x, y, z)</InlineCode>-এর সাথে match করে — element
          সংখ্যা মিলে যাচ্ছে — তাই 1 → x, 2 → y, 3 → z।
        </p>
        <p>Element-সংখ্যা না মিললে error:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let (x, y) = (1, 2, 3);
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
 --> src/main.rs:2:9
  |
2 |     let (x, y) = (1, 2, 3);
  |         ^^^^^^   --------- this expression has type \`({integer}, {integer}, {integer})\`
  |         |
  |         expected a tuple with 3 elements, found one with 2 elements`}
        />
        <p>
          ঠিক করতে — হয় কয়েকটা element <InlineCode>_</InlineCode> বা{" "}
          <InlineCode>..</InlineCode> দিয়ে ignore করো, অথবা variable-সংখ্যা
          এবং element-সংখ্যা match করাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">if let — conditional</h2>
        <p>
          চ্যাপ্টার ৬-এ <InlineCode>if let</InlineCode> দেখেছি — এক arm-এর{" "}
          <InlineCode>match</InlineCode>-এর shorthand। এতে{" "}
          <InlineCode>else</InlineCode>-ও থাকতে পারে, এবং{" "}
          <InlineCode>else if</InlineCode> /{" "}
          <InlineCode>else if let</InlineCode> দিয়ে chain করা যায়। সবগুলো
          condition একটাই value-এর সাথে relate করতে বাধ্য না — এটা
          match-এর চেয়ে flexible।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(color) = favorite_color {
        println!("Using your favorite color, {color}, as the background");
    } else if is_tuesday {
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            println!("Using purple as the background color");
        } else {
            println!("Using orange as the background color");
        }
    } else {
        println!("Using blue as the background color");
    }
}`}
        />
        <p>
          User favorite color দিলে সেটা background; না দিলে Tuesday হলে green;
          না হলে age parse হলে 30-এর উপর — purple, না হলে orange; কোনোটাই
          না হলে blue।
        </p>
        <p>
          লক্ষ্য করো —{" "}
          <InlineCode>else if let Ok(age) = age</InlineCode>-এ ভিতরের{" "}
          <InlineCode>age</InlineCode> বাইরের <InlineCode>age</InlineCode>-কে
          shadow করছে; তাই <InlineCode>if age &gt; 30</InlineCode> সেই block-এর
          ভিতরে। বাইরের scope-এ valid না।
        </p>
        <p>
          Disadvantage — exhaustiveness check হয় না।{" "}
          <InlineCode>match</InlineCode>-এ compiler সব case cover হচ্ছে কিনা
          ধরে; <InlineCode>if let</InlineCode> chain-এ একটা case ভুলে গেলে
          compiler বলবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">while let — conditional loop</h2>
        <p>
          <InlineCode>if let</InlineCode>-এর কাজিন — যতক্ষণ pattern match
          হচ্ছে loop চলে।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for val in [1, 2, 3] {
            tx.send(val).unwrap();
        }
    });

    while let Ok(value) = rx.recv() {
        println!("{value}");
    }
}`}
        />
        <p>
          এই code 1, 2, 3 print করবে। <InlineCode>recv</InlineCode> message
          নিয়ে <InlineCode>Ok(value)</InlineCode> দেয়; sender disconnect
          হলে <InlineCode>Err</InlineCode> — pattern match fail, loop শেষ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">for loop</h2>
        <p>
          <InlineCode>for</InlineCode>-এর পরের অংশ একটা pattern।{" "}
          <InlineCode>for x in y</InlineCode>-এ <InlineCode>x</InlineCode>{" "}
          pattern। Tuple destructure-এ এটা স্পষ্ট:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v = vec!['a', 'b', 'c'];

    for (index, value) in v.iter().enumerate() {
        println!("{value} is at index {index}");
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`a is at index 0
b is at index 1
c is at index 2`}
        />
        <p>
          <InlineCode>enumerate</InlineCode> — index ও value-এর tuple দেয়;
          সেটা pattern <InlineCode>(index, value)</InlineCode>-এ destructure।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Function parameter</h2>
        <p>
          Function-এর parameter-ও pattern।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn foo(x: i32) {
    // code goes here
}

fn main() {}`}
        />
        <p>
          এখানে <InlineCode>x</InlineCode> একটা pattern (সবচেয়ে সরল
          form)। আবার tuple destructure-ও parameter-এ করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({x}, {y})");
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}`}
        />
        <p>
          <InlineCode>&(3, 5)</InlineCode> match হয় pattern{" "}
          <InlineCode>&(x, y)</InlineCode>-এর সাথে — x = 3, y = 5।
        </p>
        <p>
          Closure-এর parameter list-ও same — closure function-এর কাছাকাছি,
          আগের অধ্যায়ে দেখেছি।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Refutable vs irrefutable</h2>
        <p>
          সব pattern সব জায়গায় use করা যায় না। কোথাও pattern-কে fail হওয়া
          চলবে না (irrefutable), কোথাও fail করা যাবে (refutable)। পরের
          পাঠে এই দু'টো concept।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Pattern Rust-এর অনেক জায়গায় — match, if let, while let, for, let,
            function parameter।
          </li>
          <li>
            <InlineCode>let x = 5;</InlineCode> এমনকি একটা pattern (সরল form)।
          </li>
          <li>
            Tuple destructure — <InlineCode>let (x, y, z) = ...</InlineCode>{" "}
            ও <InlineCode>fn f(&amp;(x, y): &amp;(i32, i32))</InlineCode>।
          </li>
          <li>
            <InlineCode>if let</InlineCode> chain flexible, কিন্তু
            exhaustiveness check নেই।
          </li>
          <li>
            <InlineCode>while let</InlineCode> — pattern fail না করা পর্যন্ত
            loop।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৯.১: Pattern কোথায় ব্যবহার হয় · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর pattern কোথায় কোথায় valid — match, if let, while let, for, let statement, function parameter।",
    },
  ],
};
