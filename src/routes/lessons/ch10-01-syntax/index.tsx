import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch10-01-syntax";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১০.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Generic data type</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Generic Data Types</p>
        <p class="mt-3">
          <strong>Generic</strong> দিয়ে আমরা এমন code লিখি যা একাধিক type-এ
          কাজ করে — duplicate না করে। Function, struct, enum, method — সবেই
          generic ব্যবহার করা যায়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Function-এ generic</h2>
        <p>
          ধরো আমাদের একটা list-এর largest element বের করতে হবে। প্রথমে i32-এর
          জন্য:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn largest_i32(list: &[i32]) -> &i32 {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}`}
        />
        <p>তারপর char-এর জন্য — প্রায় হুবহু same code:</p>
        <CodeBlock
          lang="rust"
          code={`fn largest_char(list: &[char]) -> &char {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}`}
        />
        <p>
          Code duplication! Generic দিয়ে এক function-এ সমাধান। Type
          parameter angle bracket-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}`}
        />
        <p>
          এই code এখনই compile হবে না। কারণ <InlineCode>{">"}</InlineCode>{" "}
          operator যেকোনো type-এ কাজ করে না। Compiler বলবে — "T-এর সব value-র
          জন্য <InlineCode>{">"}</InlineCode> defined না"।
        </p>

        <h3 class="mt-6 text-xl font-bold">Trait bound</h3>
        <p>
          T-কে restrict করতে হবে — শুধু এমন type যেগুলোতে comparison সম্ভব।{" "}
          <InlineCode>PartialOrd</InlineCode> trait এই capability define করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}`}
        />
        <p>
          <InlineCode>T: PartialOrd</InlineCode> মানে — "T এমন type হতে হবে যা
          PartialOrd implement করে"। i32 এবং char দুটোই করে, তাই ঠিক চলে।
          Trait নিয়ে বিস্তারিত পরের পাঠে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Struct-এ generic</h2>
        <CodeBlock
          lang="rust"
          code={`struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}`}
        />
        <p>
          লক্ষ্য — দু'টো field <em>একই type T</em>। তাই এটা compile হবে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
 --> src/main.rs:7:38
  |
7 |     let wont_work = Point { x: 5, y: 4.0 };
  |                                      ^^^ expected integer, found floating-point number`}
        />
        <p>আলাদা type-ও support করতে চাইলে — আলাদা generic parameter:</p>
        <CodeBlock
          lang="rust"
          code={`struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let both_float = Point { x: 1.0, y: 4.0 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}`}
        />
        <p>
          Generic parameter খুব বেশি (যেমন ৫টা) হলে code পড়া কঠিন — তখন
          struct restructure করার কথা ভাবো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Enum-এ generic</h2>
        <p>
          <InlineCode>Option&lt;T&gt;</InlineCode> এবং{" "}
          <InlineCode>Result&lt;T, E&gt;</InlineCode> generic enum-এর প্রসিদ্ধ
          example — আমরা আগে use করেছি:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Method-এ generic</h2>
        <CodeBlock
          lang="rust"
          code={`struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}`}
        />
        <p>
          লক্ষ্য — <InlineCode>impl&lt;T&gt;</InlineCode>।{" "}
          <InlineCode>impl</InlineCode>-এর পরে <InlineCode>&lt;T&gt;</InlineCode>{" "}
          declare করতে হয়, না হলে Rust জানে না এটা generic না কোনো concrete
          type।
        </p>

        <h3 class="mt-6 text-xl font-bold">Specific type-এ method</h3>
        <p>
          কিছু method শুধু concrete instantiation-এই থাকবে — যেমন{" "}
          <InlineCode>distance_from_origin</InlineCode> শুধু{" "}
          <InlineCode>Point&lt;f32&gt;</InlineCode>-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}`}
        />
        <p>
          <InlineCode>impl&lt;T&gt;</InlineCode> না — সরাসরি{" "}
          <InlineCode>impl Point&lt;f32&gt;</InlineCode>। তাই{" "}
          <InlineCode>Point&lt;i32&gt;</InlineCode>-এ এই method থাকবে না।
        </p>

        <h3 class="mt-6 text-xl font-bold">impl ও method-এ আলাদা generic</h3>
        <CodeBlock
          lang="rust"
          code={`struct Point<X1, Y1> {
    x: X1,
    y: Y1,
}

impl<X1, Y1> Point<X1, Y1> {
    fn mixup<X2, Y2>(self, other: Point<X2, Y2>) -> Point<X1, Y2> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c' };

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
    // p3.x = 5, p3.y = c
}`}
        />
        <p>
          <InlineCode>X1, Y1</InlineCode> struct-এর সাথে যুক্ত (impl-এ
          declare); <InlineCode>X2, Y2</InlineCode> শুধু এই method-এর জন্য (fn
          mixup-এ declare)। Result-এ <InlineCode>X1</InlineCode> (self থেকে)
          এবং <InlineCode>Y2</InlineCode> (other থেকে) — mix।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Performance — কোনো cost নেই</h2>
        <p>
          C++-এ template একটা cost বা restriction-এর সাথে আসে। Rust-এ
          generic-এর runtime cost <strong>শূন্য</strong> — কারণ{" "}
          <strong>monomorphization</strong>। Compile time-এ Rust deduce করে কোন
          কোন concrete type use হচ্ছে এবং প্রতিটার জন্য আলাদা code generate
          করে। উদাহরণ:
        </p>
        <CodeBlock
          lang="rust"
          code={`let integer = Some(5);
let float = Some(5.0);`}
        />
        <p>Compiler কার্যত generate করে:</p>
        <CodeBlock
          lang="rust"
          code={`enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}

let integer = Option_i32::Some(5);
let float = Option_f64::Some(5.0);`}
        />
        <p>
          Runtime-এ কোনো type-checking বা dispatch দরকার নেই। Manual-ে আলাদা
          আলাদা type লেখার মতোই fast — কিন্তু source code-এ duplicate-হীন।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Generic — type parameter angle bracket-এ; function, struct, enum,
            method-এ।
          </li>
          <li>
            <InlineCode>T: TraitName</InlineCode> trait bound দিয়ে
            restriction।
          </li>
          <li>
            <InlineCode>impl&lt;T&gt;</InlineCode> generic; specific instantiation-এ{" "}
            <InlineCode>impl Point&lt;f32&gt;</InlineCode>।
          </li>
          <li>
            Struct-এর generic এবং method-এর generic আলাদা হতে পারে।
          </li>
          <li>
            Monomorphization — compile-time-এ concrete code generation, runtime
            cost শূন্য।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১০.১: Generic data type · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ generic — function, struct, enum, method-এ; trait bound; এবং monomorphization কেন cost-free।",
    },
  ],
};
