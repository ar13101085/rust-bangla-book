import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch20-02-advanced-traits";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২০.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Advanced Trait</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Advanced Traits</p>
        <p class="mt-3">
          Chapter 10-এ trait-এর basic দেখেছ। এখন কিছু advanced ফিচার — associated
          type, default generic parameter, operator overloading, fully qualified
          syntax, supertrait, এবং newtype pattern।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Associated type</h2>
        <p>
          <strong>Associated type</strong> trait-এর সাথে একটা type placeholder
          যুক্ত করে — trait-এর method signature-এ সেটা ব্যবহার করা যায়।
          Implementor বলে দেয় কোন concrete type এই placeholder-এর জায়গায়।
        </p>
        <p>
          সবচেয়ে চেনা উদাহরণ — <InlineCode>Iterator</InlineCode> trait:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}`}
        />
        <CodeBlock
          lang="rust"
          code={`struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}`}
        />

        <h3 class="mt-6 text-xl font-bold">
          Generic-এর সাথে পার্থক্য
        </h3>
        <p>
          Generic দিয়ে লিখলে — <InlineCode>Iterator&lt;T&gt;</InlineCode>{" "}
          হত, এবং প্রতিটা impl-এ T annotate করতে হত। তাছাড়া একই type-এ একাধিক
          implementation possible (<InlineCode>Iterator&lt;String&gt;</InlineCode>{" "}
          ও <InlineCode>Iterator&lt;u32&gt;</InlineCode>) — কোনটা ব্যবহার হচ্ছে
          তা বোঝাতে annotation দরকার।
        </p>
        <p>
          Associated type-এ — একটা type-এ trait শুধু একবারই implement।{" "}
          <InlineCode>Item</InlineCode>-এর জন্য একটাই choice; type infer স্বাভাবিক।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          Default generic parameter — operator overloading
        </h2>
        <p>
          Generic declaration-এ default concrete type দেওয়া যায়:{" "}
          <InlineCode>&lt;PlaceholderType=ConcreteType&gt;</InlineCode>। বড়
          ব্যবহার — operator overloading।
        </p>
        <p>
          <InlineCode>std::ops::Add</InlineCode> trait implement করে{" "}
          <InlineCode>+</InlineCode> overload:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::ops::Add;

#[derive(Debug, Copy, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(
        Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
        Point { x: 3, y: 3 }
    );
}`}
        />
        <p>
          <InlineCode>Add</InlineCode> trait-এর definition:
        </p>
        <CodeBlock
          lang="rust"
          code={`trait Add<Rhs=Self> {
    type Output;

    fn add(self, rhs: Rhs) -> Self::Output;
}`}
        />
        <p>
          <InlineCode>Rhs</InlineCode> default <InlineCode>Self</InlineCode>।
          তাই <InlineCode>impl Add for Point</InlineCode> মানে{" "}
          <InlineCode>Point + Point</InlineCode>।
        </p>
        <p>
          ভিন্ন type-এ যোগ — <InlineCode>Rhs</InlineCode> override:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}`}
        />
        <p>Default type parameter-এর দু'টা মূল ব্যবহার:</p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>Existing code না ভেঙে type extend করা।</li>
          <li>
            যেই customization বেশিরভাগ user-এর দরকার নেই — সেটাকে optional রাখা।
          </li>
        </ol>

        <h2 class="mt-10 text-2xl font-bold">
          একই নামে একাধিক method — disambiguation
        </h2>
        <p>
          Rust-এ একই type-এ একাধিক trait-এ একই নামের method থাকতে পারে —
          এমনকি direct impl-এও:
        </p>
        <CodeBlock
          lang="rust"
          code={`trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {}`}
        />
        <p>
          <InlineCode>person.fly()</InlineCode> default-এ direct impl-এর
          method কল করবে। Trait-এর method কল করতে trait নাম স্পষ্ট করো:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let person = Human;
    Pilot::fly(&person);
    Wizard::fly(&person);
    person.fly();
}`}
        />
        <CodeBlock
          lang="text"
          code={`This is your captain speaking.
Up!
*waving arms furiously*`}
        />

        <h3 class="mt-6 text-xl font-bold">Fully qualified syntax</h3>
        <p>
          Method-এ <InlineCode>&self</InlineCode> থাকলে উপরের syntax কাজ করে।
          কিন্তু associated function (যাতে self নেই) — Rust কোনটা বুঝবে
          জানে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Dog::baby_name());
}`}
        />
        <CodeBlock lang="text" code={`A baby dog is called a Spot`} />
        <p>
          Animal-এর <InlineCode>baby_name</InlineCode> চাইলে fully qualified
          syntax:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}`}
        />
        <CodeBlock lang="text" code={`A baby dog is called a puppy`} />
        <p>General form:</p>
        <CodeBlock
          lang="rust"
          code={`<Type as Trait>::function(receiver_if_method, next_arg, ...);`}
        />

        <h2 class="mt-10 text-2xl font-bold">Supertrait</h2>
        <p>
          কখনো নিজের trait-এ অন্য trait-এর functionality দরকার — তাহলে
          implementor-কে দু'টোই implement করতে হবে। সেই depended-on trait-কে
          বলে <strong>supertrait</strong>।
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

fn main() {}`}
        />
        <p>
          <InlineCode>OutlinePrint: fmt::Display</InlineCode> — যে কোনো type-এ
          OutlinePrint implement করতে হলে আগে Display চাই। তাই inside method-এ{" "}
          <InlineCode>self.to_string()</InlineCode> available।
        </p>
        <CodeBlock
          lang="rust"
          code={`trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

struct Point {
    x: i32,
    y: i32,
}

impl OutlinePrint for Point {}

use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 1, y: 3 };
    p.outline_print();
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">
          External trait + external type — newtype pattern
        </h2>
        <p>
          Orphan rule মনে আছে? trait বা type — অন্তত একটা local হতে হবে।
          তাহলে <InlineCode>Vec&lt;String&gt;</InlineCode>-এ{" "}
          <InlineCode>Display</InlineCode> implement করা যাবে না — দু'টোই
          external।
        </p>
        <p>
          সমাধান — <strong>newtype pattern</strong>। Tuple struct-এ wrap করে
          আমাদের local type বানিয়ে নাও:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {w}");
}`}
        />
        <p>
          Runtime overhead নেই — wrapper compile time-এই বিলীন। তবে downside —{" "}
          <InlineCode>Wrapper</InlineCode>-এ <InlineCode>Vec&lt;T&gt;</InlineCode>
          -এর method available না। চাইলে দরকার-মতো manually delegate, বা{" "}
          <InlineCode>Deref</InlineCode> implement করো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Associated type — trait-এর সাথে একটা type placeholder; per-impl
            একবারই বলা যায়।
          </li>
          <li>
            Default generic parameter দিয়ে operator overloading; default থাকলে
            user-কে annotate করতে হয় না।
          </li>
          <li>
            একই নামের method disambiguate — <InlineCode>Trait::method(&val)</InlineCode>;
            self-নেই function-এ <InlineCode>&lt;Type as Trait&gt;::function()</InlineCode>।
          </li>
          <li>
            Supertrait — নিজের trait-এর implementor-কে অন্য trait-ও implement
            করতে বাধ্য।
          </li>
          <li>
            Newtype pattern — orphan rule এড়িয়ে external trait external type-এ
            implement; runtime খরচ শূন্য।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২০.২: Advanced Trait · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ associated type, default generic, operator overload, fully qualified syntax, supertrait, এবং newtype pattern।",
    },
  ],
};
