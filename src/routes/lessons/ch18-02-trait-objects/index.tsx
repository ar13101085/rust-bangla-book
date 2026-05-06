import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch18-02-trait-objects";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৮.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Trait Object দিয়ে shared behavior abstract করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Using Trait Objects That Allow for Values of Different Types
        </p>
        <p class="mt-3">
          কখনো এমন collection দরকার হয় যাতে একই trait implement করা একাধিক
          আলাদা <em>concrete type</em> একসাথে রাখা যায়। Rust-এ এই কাজে আসে{" "}
          <strong>trait object</strong> — <InlineCode>dyn Trait</InlineCode>{" "}
          syntax-এ লেখা একটা pointer, যেটা runtime-এ method dispatch করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">সমস্যা — Vec একটাই type রাখতে পারে</h2>
        <p>
          সাধারণ <InlineCode>Vec&lt;T&gt;</InlineCode> একটাই concrete type রাখতে
          পারে। Enum দিয়ে fixed কয়েকটা type-এর জন্য workaround করা যায়
          (যেমন <InlineCode>SpreadsheetCell</InlineCode>), কিন্তু library author
          চাইতে পারে user নিজের নতুন type যোগ করুক — যেগুলো compile-time-এ unknown।
          এই problem-এর সমাধান trait object।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Common behavior-এর জন্য trait define</h2>
        <p>
          ধরো একটা GUI library বানাচ্ছি, যেখানে অনেক ধরনের component থাকবে — সবাই
          নিজেকে draw করতে জানে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub trait Draw {
    fn draw(&self);
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Trait object দিয়ে Screen</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub trait Draw {
    fn draw(&self);
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}`}
        />
        <p>
          <InlineCode>Vec&lt;Box&lt;dyn Draw&gt;&gt;</InlineCode> — এই vector-এ{" "}
          <strong>একাধিক ভিন্ন concrete type</strong> রাখা যাবে, যত যেগুলোই{" "}
          <InlineCode>Draw</InlineCode> implement করবে। Trait object একটা
          pointer — point করে dual করে: instance-এর data, এবং vtable
          (virtual method table) যেটা runtime-এ method lookup করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Generic-এর সাথে পার্থক্য</h2>
        <p>Generic + trait bound দিয়ে একই কাজ লেখা যায়, কিন্তু আচরণ ভিন্ন:</p>
        <CodeBlock
          lang="rust"
          code={`pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
where
    T: Draw,
{
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}`}
        />
        <p>
          এখানে <InlineCode>Screen&lt;T&gt;</InlineCode>-এর প্রতিটা instance{" "}
          <strong>একটাই concrete type</strong> ধরে রাখতে পারবে — হয় শুধু{" "}
          <InlineCode>Button</InlineCode>, অথবা শুধু{" "}
          <InlineCode>TextField</InlineCode>; mix না।
        </p>
        <p>সারসংক্ষেপ:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Generic</strong> — monomorphization, static dispatch, fast,
            কিন্তু এক instance-এ এক type।
          </li>
          <li>
            <strong>Trait object</strong> — dynamic dispatch (vtable lookup),
            inlining সম্ভব না, একটু runtime overhead, কিন্তু এক collection-এ
            heterogeneous type।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Trait implement</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // code to actually draw a button
    }
}`}
        />
        <p>User-defined type — library-র বাইরে থেকে যোগ করা:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use gui::Draw;

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // code to actually draw a select box
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Mixed collection ব্যবহার</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use gui::{Button, Screen};

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No"),
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}`}
        />
        <p>
          <InlineCode>run</InlineCode> method-কে concrete type জানতে হয় না — সে
          শুধু জানে প্রতিটা component <InlineCode>Draw</InlineCode> implement
          করে, তাই <InlineCode>draw()</InlineCode> call করা safe।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Duck typing — কিন্তু compile-time safe</h2>
        <p>
          এটা dynamically-typed language-এর "duck typing"-এর মতো —{" "}
          <em>If it walks like a duck and quacks like a duck, then it must be a duck!</em>{" "}
          কিন্তু Rust compile-time-এ check করে। Trait implement না করা type
          collection-এ ঢোকালে error:
        </p>
        <CodeBlock
          lang="rust"
          code={`use gui::Screen;

fn main() {
    let screen = Screen {
        components: vec![Box::new(String::from("Hi"))],
    };

    screen.run();
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: the trait bound \`String: Draw\` is not satisfied
 --> src/main.rs:5:26
  |
5 |         components: vec![Box::new(String::from("Hi"))],
  |                          ^^^^^^^^^^^^^^^^^^^^^^^^^ the trait \`Draw\` is not implemented for \`String\``}
        />
        <p>
          Dynamic language-এ এই ভুল production-এ runtime exception হয়ে আঘাত
          করে। Rust আগে থেকে আটকায় — flexibility সাথে safety।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Static vs dynamic dispatch</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Static dispatch (generic)</strong> — compiler প্রতিটা
            concrete type-এর জন্য আলাদা code generate করে (monomorphization)।
            Inlining আর full optimization সম্ভব। Runtime-এ কোনো extra cost নেই।
          </li>
          <li>
            <strong>Dynamic dispatch (trait object)</strong> — compiler emit
            করা code runtime-এ vtable pointer follow করে method খুঁজে বের করে।
            Inlining আটকায়, performance overhead সামান্য, কিন্তু flexibility
            বেশি।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Object safety / dyn compatibility</h2>
        <p>
          সব trait <InlineCode>dyn</InlineCode>-এর সাথে use করা যায় না — কিছু
          rule আছে যেগুলো "dyn compatibility" বলে। বিস্তারিত Rust reference-এর
          object safety section-এ। আপাতত মনে রাখো — কিছু trait method (যেমন{" "}
          <InlineCode>Self</InlineCode> return করা, generic method-যুক্ত)
          object-safe না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Trait object — <InlineCode>Box&lt;dyn Trait&gt;</InlineCode> বা{" "}
            <InlineCode>&dyn Trait</InlineCode> — pointer + vtable; runtime
            dispatch।
          </li>
          <li>
            Generic এক instance-এ এক type রাখে; trait object একই collection-এ
            ভিন্ন ভিন্ন type রাখতে দেয়।
          </li>
          <li>
            Static dispatch দ্রুত (monomorphization, inlining), dynamic dispatch
            flexible (heterogeneous collection)।
          </li>
          <li>
            Trait implement না করা type ঢোকালে compile error — type safety
            অক্ষুণ্ণ।
          </li>
          <li>
            Library design-এ trait object দিয়ে user-defined extension allow
            করা সহজ হয়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৮.২: Trait Object · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Box<dyn Trait> দিয়ে heterogeneous collection, dynamic dispatch, এবং generic-এর সাথে trade-off।",
    },
  ],
};
