import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch05-03-method-syntax";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৫.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Method Syntax</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Method Syntax</p>
        <p class="mt-3">
          <strong>Method</strong> function-এর মতোই — কিন্তু একটা struct, enum,
          বা trait object-এর সাথে যুক্ত। প্রথম parameter সবসময়{" "}
          <InlineCode>self</InlineCode> — যেই instance-এ method call করা
          হচ্ছে, সেটা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">impl block-এ method define</h2>
        <p>
          আগের <InlineCode>area</InlineCode> function-কে <InlineCode>Rectangle</InlineCode>
          -এর method-এ পরিণত করি:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}`}
        />
        <p>
          <InlineCode>impl Rectangle</InlineCode> block-এর ভিতরে যা থাকবে, সব{" "}
          <InlineCode>Rectangle</InlineCode> type-এর সাথে যুক্ত। Call করা হয়
          dot syntax-এ — <InlineCode>rect1.area()</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">&self বনাম self বনাম &mut self</h2>
        <p>
          <InlineCode>&self</InlineCode> আসলে{" "}
          <InlineCode>self: &Self</InlineCode>-এর shorthand।{" "}
          <InlineCode>Self</InlineCode> impl block-এর type-এর alias।
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>&self</InlineCode> — immutable borrow। শুধু read করা।
          </li>
          <li>
            <InlineCode>&mut self</InlineCode> — mutable borrow। instance
            modify করা।
          </li>
          <li>
            <InlineCode>self</InlineCode> (ownership) — rare। যখন method
            instance-কে অন্য কিছুতে transform করে, এবং পুরোনোটা আর use করতে
            চায় না।
          </li>
        </ul>
        <p>
          আমরা শুধু read করছি, তাই <InlineCode>&self</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Field-এর নামে method</h2>
        <p>
          Method-এর নাম field-এর নামের সাথে মিলতে পারে। Rust parenthesis দিয়ে
          আলাদা করে — <InlineCode>rect1.width()</InlineCode> method,{" "}
          <InlineCode>rect1.width</InlineCode> field।
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}`}
        />
        <p>
          শুধু field return-করা method-কে <strong>getter</strong> বলে। Rust
          auto-generate করে না, কিন্তু private field-কে controlled read access
          দিতে এই pattern useful।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Auto reference / dereference</h2>
        <p>
          C/C++-এ object-এর pointer থেকে method call করতে{" "}
          <InlineCode>{"->"}</InlineCode> দরকার হয়। Rust-এ নেই — automatic
          reference/dereference। Method-এর signature দেখে Rust auto{" "}
          <InlineCode>&</InlineCode>, <InlineCode>&mut</InlineCode>, বা{" "}
          <InlineCode>*</InlineCode> insert করে।
        </p>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug,Copy,Clone)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
   fn distance(&self, other: &Point) -> f64 {
       let x_squared = f64::powi(other.x - self.x, 2);
       let y_squared = f64::powi(other.y - self.y, 2);

       f64::sqrt(x_squared + y_squared)
   }
}

let p1 = Point { x: 0.0, y: 0.0 };
let p2 = Point { x: 5.0, y: 6.5 };
p1.distance(&p2);
(&p1).distance(&p2);`}
        />
        <p>
          দুটো call equivalent — Rust জানে method <InlineCode>&self</InlineCode>{" "}
          নিচ্ছে, তাই <InlineCode>p1.distance(&p2)</InlineCode>-এর{" "}
          <InlineCode>p1</InlineCode>-কে auto <InlineCode>&p1</InlineCode>{" "}
          করে নেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">একাধিক parameter</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect3 = Rectangle { width: 60, height: 45 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`Can rect1 hold rect2? true
Can rect1 hold rect3? false`}
        />
        <p>
          <InlineCode>self</InlineCode>-এর পরে যত খুশি parameter — function-এর
          মতোই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Associated function</h2>
        <p>
          <InlineCode>impl</InlineCode> block-এ যেসব function থাকে তাদের সবাই
          সেই type-এর <strong>associated function</strong>।{" "}
          <InlineCode>self</InlineCode> না নিলে এটা method না — instance ছাড়াও
          call করা যায়। Constructor pattern হিসেবে এটা common:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Rectangle {
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}

fn main() {
    let sq = Rectangle::square(3);
}`}
        />
        <p>
          <InlineCode>Self</InlineCode> impl-এর type-এর alias —{" "}
          <InlineCode>Rectangle</InlineCode>-এর জায়গায়{" "}
          <InlineCode>Self</InlineCode> লেখা যায়। Call করা হয়{" "}
          <InlineCode>Rectangle::square(3)</InlineCode> — double colon।{" "}
          <InlineCode>String::from</InlineCode>,{" "}
          <InlineCode>String::new</InlineCode> এই pattern-এই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">একাধিক impl block</h2>
        <p>
          এক struct-এর একাধিক <InlineCode>impl</InlineCode> block দেওয়া যায় —
          নিচের code valid:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}`}
        />
        <p>
          সাধারণত আলাদা করার দরকার নেই — কিন্তু generic type ও trait-এর
          context-এ (Chapter 10) এর অর্থ দাঁড়াবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>impl Type {`{...}`}</InlineCode> block-এ method define;
            প্রথম parameter <InlineCode>&self</InlineCode>,{" "}
            <InlineCode>&mut self</InlineCode>, বা <InlineCode>self</InlineCode>।
          </li>
          <li>
            Method call dot syntax (<InlineCode>obj.method()</InlineCode>);
            Rust auto reference/dereference করে — <InlineCode>{"->"}</InlineCode>{" "}
            লাগে না।
          </li>
          <li>
            Method আর field-এর নাম একই হতে পারে — parenthesis দিয়ে আলাদা;
            getter pattern।
          </li>
          <li>
            <InlineCode>self</InlineCode>-বিহীন function = associated function
            (constructor pattern); call <InlineCode>Type::name()</InlineCode>।
          </li>
          <li>
            <InlineCode>Self</InlineCode> = impl-এর type-এর alias। একাধিক
            impl block valid।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৫.৩: Method Syntax · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ struct-এর method, &self/&mut self/self-এর পার্থক্য, getter, এবং associated function (constructor)।",
    },
  ],
};
