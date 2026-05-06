import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch03-05-control-flow";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৩.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Control Flow</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Control Flow</p>
        <p class="mt-3">
          Condition-এর উপর ভিত্তি করে code চালানো বা কোনো block বারবার চালানো
          — এগুলো প্রায় সব language-এর মৌলিক building block। Rust-এ এর জন্য{" "}
          <InlineCode>if</InlineCode> এবং তিন ধরনের loop —{" "}
          <InlineCode>loop</InlineCode>, <InlineCode>while</InlineCode>,{" "}
          <InlineCode>for</InlineCode>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">if expression</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}`}
        />
        <p>
          <InlineCode>if</InlineCode> keyword + condition + curly bracket-এ
          body। <InlineCode>else</InlineCode> optional — না দিলে condition false
          হলে কিছুই হবে না।
        </p>
        <p>
          <InlineCode>if</InlineCode>-এর প্রতিটা branch-কে <em>arm</em> বলে —
          আগের <InlineCode>match</InlineCode>-এর arm-এর মতো।
        </p>

        <h3 class="mt-6 text-xl font-bold">Condition অবশ্যই bool হতে হবে</h3>
        <p>
          JavaScript বা Python-এর মতো truthy/falsy concept Rust-এ নেই।
          condition-এ integer দিলে error:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let number = 3;

    if number {
        println!("number was three");
    }
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
 --> src/main.rs:4:8
  |
4 |     if number {
  |        ^^^^^^ expected \`bool\`, found integer`}
        />
        <p>সঠিক উপায় — explicit comparison:</p>
        <CodeBlock
          lang="rust"
          code={`if number != 0 {
    println!("number was something other than zero");
}`}
        />

        <h3 class="mt-6 text-xl font-bold">else if</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}`}
        />
        <p>
          Rust top-down চেক করে — প্রথম যে condition true হয়, তার block চলে।
          উদাহরণে number=6 — 4 দিয়ে ভাগ হয় না কিন্তু 3 দিয়ে হয়, তাই "divisible
          by 3" print হবে। 2 দিয়ে-ও ভাগ হয় কিন্তু সেটা পরীক্ষা করা হবে না।
        </p>
        <p>
          অনেকগুলো <InlineCode>else if</InlineCode> থাকলে code untidy হয়ে যায়
          — তখন <InlineCode>match</InlineCode> use করা ভালো (Chapter 6-এ)।
        </p>

        <h3 class="mt-6 text-xl font-bold">if expression — let-এর ডানে</h3>
        <p>
          <InlineCode>if</InlineCode> একটা expression, তাই value দেয় —{" "}
          <InlineCode>let</InlineCode>-এ assign করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };

    println!("The value of number is: {number}");
}`}
        />
        <p>
          দুটো arm-ই same type return করতে হবে — না হলে compile error:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let condition = true;

    let number = if condition { 5 } else { "six" };

    println!("The value of number is: {number}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: \`if\` and \`else\` have incompatible types
 --> src/main.rs:4:44
  |
4 |     let number = if condition { 5 } else { "six" };
  |                                 -          ^^^^^ expected integer, found \`&str\``}
        />
        <p>
          কারণ — Rust-কে compile time-এ <InlineCode>number</InlineCode>-এর type
          জানতে হবে; integer আর string একসাথে রাখা যায় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">loop — infinite loop</h2>
        <p>
          <InlineCode>loop</InlineCode> keyword block-কে অনন্তবার চালায় — যতক্ষণ
          না explicitly থামাও।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    loop {
        println!("again!");
    }
}`}
        />
        <p>
          Terminal-এ ctrl-C চাপলে interrupt হবে। Code থেকে থামাতে{" "}
          <InlineCode>break</InlineCode>; পরের iteration-এ যেতে{" "}
          <InlineCode>continue</InlineCode>।
        </p>

        <h3 class="mt-6 text-xl font-bold">loop থেকে value return</h3>
        <p>
          <InlineCode>break</InlineCode>-এর পরে value দিলে সেটা loop-এর result
          হয়:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");
}`}
        />
        <p>
          counter 1 থেকে 10 পর্যন্ত বাড়ে, 10 হলে <InlineCode>break counter * 2</InlineCode>
          {" "} → <InlineCode>20</InlineCode> return। result-এ 20 bind হয়।
        </p>
        <p>
          (<InlineCode>return</InlineCode> পুরো function থেকে exit করে,{" "}
          <InlineCode>break</InlineCode> শুধু loop থেকে।)
        </p>

        <h3 class="mt-6 text-xl font-bold">Loop label</h3>
        <p>
          নেস্টেড loop-এ <InlineCode>break</InlineCode>/
          <InlineCode>continue</InlineCode> default-এ সবচেয়ে ভেতরের loop-এ
          কাজ করে। বাইরের loop থামাতে চাইলে <strong>label</strong> দিতে হয় —
          single quote দিয়ে শুরু:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {count}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`count = 0
remaining = 10
remaining = 9
count = 1
remaining = 10
remaining = 9
count = 2
remaining = 10
End count = 2`}
        />

        <h2 class="mt-10 text-2xl font-bold">while loop</h2>
        <p>
          condition-based loop-এর জন্য common pattern হলো{" "}
          <InlineCode>loop + if + break</InlineCode>। Rust-এ এর জন্য shortcut —{" "}
          <InlineCode>while</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{number}!");

        number -= 1;
    }

    println!("LIFTOFF!!!");
}`}
        />
        <p>condition true থাকা পর্যন্ত body চলে; false হলে exit।</p>

        <h2 class="mt-10 text-2xl font-bold">for loop — collection-এর উপর</h2>
        <p>
          Array-এর উপর <InlineCode>while</InlineCode> দিয়ে iterate করা যায়,
          কিন্তু সেটা error-prone (index ভুল হতে পারে) এবং slow (প্রতিটা
          iteration-এ bound check):
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index += 1;
    }
}`}
        />
        <p>
          এই কাজের জন্য আসলে <InlineCode>for</InlineCode> use করা উচিত —
          সংক্ষিপ্ত, safe, fast:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a {
        println!("the value is: {element}");
    }
}`}
        />
        <p>
          Array-এর size বদলালে অন্য কিছু change করতে হবে না।{" "}
          <InlineCode>for</InlineCode> Rust-এ সবচেয়ে use-হওয়া loop।
        </p>
        <p>
          নির্দিষ্ট সংখ্যক বার চালাতে হলেও <InlineCode>for</InlineCode>-ই
          preferred — <InlineCode>Range</InlineCode> এবং{" "}
          <InlineCode>.rev()</InlineCode> দিয়ে countdown:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    for number in (1..4).rev() {
        println!("{number}!");
    }
    println!("LIFTOFF!!!");
}`}
        />
        <p>
          <InlineCode>1..4</InlineCode> — 1, 2, 3 (4 inclusive না);{" "}
          <InlineCode>.rev()</InlineCode> reverse করে — 3, 2, 1।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>if</InlineCode>/<InlineCode>else</InlineCode> branching;
            condition <strong>অবশ্যই bool</strong>।
          </li>
          <li>
            <InlineCode>if</InlineCode> একটা expression — দুই arm-এ same type
            থাকলে <InlineCode>let</InlineCode>-এ assign করা যায়।
          </li>
          <li>
            তিন ধরনের loop — <InlineCode>loop</InlineCode> (infinite),{" "}
            <InlineCode>while</InlineCode> (condition), <InlineCode>for</InlineCode>{" "}
            (collection)।
          </li>
          <li>
            <InlineCode>break</InlineCode>-এর পর value দিয়ে loop থেকে result
            return; loop label দিয়ে নেস্টেড loop-এর কোনটা থামবে control।
          </li>
          <li>
            <InlineCode>for</InlineCode> Rust-এ সবচেয়ে preferred —{" "}
            <InlineCode>(1..4).rev()</InlineCode>-এর মতো range-ও iterate করা
            যায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৩.৫: Control Flow · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ if/else, loop, while, for, loop label, এবং range-based iteration।",
    },
  ],
};
