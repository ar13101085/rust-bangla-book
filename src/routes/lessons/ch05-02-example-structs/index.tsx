import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch05-02-example-structs";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৫.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Struct ব্যবহার করে একটি example program
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          An Example Program Using Structs
        </p>
        <p class="mt-3">
          কখন struct use করা উচিত — সেটা একটা ছোট program-এর তিন stage refactor
          করে দেখব। কাজটা সহজ: rectangle-এর area বের করা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Stage 1 — আলাদা variable</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`The area of the rectangle is 1500 square pixels.`}
        />
        <p>
          কাজ করছে। কিন্তু <InlineCode>width1</InlineCode> ও{" "}
          <InlineCode>height1</InlineCode> — দুটো variable একসাথে
          সম্পর্কিত, এই কথা code-এ কোথাও বলা নেই।{" "}
          <InlineCode>area</InlineCode>-এ দুটো parameter আলাদা — আসলে এটা যে
          একটা <em>rectangle</em>, সেটা signature-এ বোঝা যাচ্ছে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Stage 2 — tuple দিয়ে refactor</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let rect1 = (30, 50);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}`}
        />
        <p>
          এক গ্রুপ-এ এসেছে — কিন্তু{" "}
          <InlineCode>.0</InlineCode> width, না{" "}
          <InlineCode>.1</InlineCode>? Code পড়ে বোঝা যাচ্ছে না।
          Width-height পরে swap করে ফেললে bug ধরা যাবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Stage 3 — struct দিয়ে refactor</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        area(&rect1)
    );
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.width * rectangle.height
}`}
        />
        <p>
          এখন signature বলছে — "একটা <InlineCode>Rectangle</InlineCode>-এর area
          বের কর"।
        </p>
        <p>
          লক্ষ্য করো — <InlineCode>area(&rect1)</InlineCode>। ownership transfer
          না করে reference নিচ্ছি, যাতে main-এ{" "}
          <InlineCode>rect1</InlineCode> পরে-ও ব্যবহার করা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Struct print করা</h2>
        <p>
          <InlineCode>println!("rect1 is {`{rect1}`}");</InlineCode> চেষ্টা
          করলে error:
        </p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: \`Rectangle\` doesn't implement \`std::fmt::Display\``}
        />
        <p>
          <InlineCode>{`{}`}</InlineCode> placeholder <InlineCode>Display</InlineCode>{" "}
          trait দিয়ে print করে — যা primitive type-এ আছে কিন্তু custom
          struct-এ default-এ নেই (কারণ struct-এর field কীভাবে দেখাবে সেটা
          Rust জানে না)।
        </p>

        <h3 class="mt-6 text-xl font-bold">#[derive(Debug)] + {`{:?}`}</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {rect1:?}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`rect1 is Rectangle { width: 30, height: 50 }`}
        />
        <p>
          <InlineCode>#[derive(Debug)]</InlineCode> attribute Rust-কে বলে
          "auto-generate <InlineCode>Debug</InlineCode> trait-এর implementation
          করে দাও"। তারপর <InlineCode>{`{:?}`}</InlineCode> placeholder এই debug
          format use করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Pretty-print — {`{:#?}`}</h3>
        <p>বড় struct-এ পড়ার সুবিধার জন্য multi-line:</p>
        <CodeBlock lang="rust" code={`println!("rect1 is {rect1:#?}");`} />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`rect1 is Rectangle {
    width: 30,
    height: 50,
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">dbg! macro</h2>
        <p>
          <InlineCode>dbg!</InlineCode> debugging-এর জন্য আরও powerful — file
          name, line number, expression text এবং value সব print করে। কিন্তু
          সাবধানে — এটা <em>ownership নেয়</em>, তারপর ফেরত দেয়। তাই reference
          না-পাঠালে variable move হয়ে যাবে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: dbg!(30 * scale),
        height: 50,
    };

    dbg!(&rect1);
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output (stderr)"
          code={`[src/main.rs:10:16] 30 * scale = 60
[src/main.rs:14:5] &rect1 = Rectangle {
    width: 60,
    height: 50,
}`}
        />
        <p>
          <InlineCode>dbg!(30 * scale)</InlineCode> — value print করে এবং সেই
          value-ই return করে, তাই width-এ ৬০ বসে যাচ্ছে।{" "}
          <InlineCode>dbg!(&rect1)</InlineCode> — ownership না নিয়ে print
          করছি, তাই rect1 পরে-ও use করা যায়।
        </p>
        <p>
          <InlineCode>println!</InlineCode> stdout-এ লেখে,{" "}
          <InlineCode>dbg!</InlineCode> stderr-এ — তাই প্রোগ্রামের মূল
          output-এর সাথে debug output mix হয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            আলাদা variable → tuple → struct — code clarity-র progression।
          </li>
          <li>
            Struct print করতে <InlineCode>#[derive(Debug)]</InlineCode> + {" "}
            <InlineCode>{`{:?}`}</InlineCode> বা <InlineCode>{`{:#?}`}</InlineCode>{" "}
            (pretty)।
          </li>
          <li>
            <InlineCode>dbg!</InlineCode> — ownership নেয় (reference পাঠাও),
            stderr-এ print, file/line info দেয়।
          </li>
          <li>
            <InlineCode>derive</InlineCode> attribute — auto-generated trait
            implementation।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৫.২: Struct ব্যবহার করে example program · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "একটা rectangle area program-কে আলাদা variable থেকে tuple, এবং তারপর struct-এ refactor; #[derive(Debug)] এবং dbg! macro।",
    },
  ],
};
