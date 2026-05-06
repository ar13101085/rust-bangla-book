import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-06-reference-cycles";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.৬
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Reference Cycle থেকে memory leak
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Reference Cycles Can Leak Memory
        </p>
        <p class="mt-3">
          Rust-এর memory safety guarantee accidental memory leak কঠিন করে
          দেয় — কিন্তু impossible না। Rust সব memory error prevent করে না;
          memory leak Rust-এ memory-safe বলে গণ্য।{" "}
          <InlineCode>Rc&lt;T&gt;</InlineCode> এবং{" "}
          <InlineCode>RefCell&lt;T&gt;</InlineCode> একসাথে use করলে{" "}
          <strong>reference cycle</strong> বানানো সম্ভব — যেখানে item-গুলো
          একে অপরকে point করে। তখন reference count কখনো 0 হয় না, value
          drop হয় না — leak।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Cycle তৈরি করা</h2>
        <p>
          আগের cons list-এর একটা variant দেখব — দ্বিতীয় element-এ{" "}
          <InlineCode>RefCell&lt;Rc&lt;List&gt;&gt;</InlineCode>। মানে — Cons
          variant-এর <em>list-pointer</em>-টা mutate করা যাবে (i32 না)।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {}`}
        />
        <p>
          <InlineCode>tail</InlineCode> method — Cons হলে দ্বিতীয় element-এর
          reference, Nil হলে None।
        </p>
        <p>এবার cycle:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    // Uncomment the next line to see that we have a cycle;
    // it will overflow the stack.
    // println!("a next item = {:?}", a.tail());
}`}
        />
        <p>
          কী ঘটল:
        </p>
        <ol class="ml-6 list-decimal space-y-1">
          <li>
            <InlineCode>a</InlineCode> = Cons(5, → Nil)।
          </li>
          <li>
            <InlineCode>b</InlineCode> = Cons(10, → a)।
          </li>
          <li>
            তারপর a-এর tail-কে modify করে b-তে point করানো — এখন a → b → a।
          </li>
        </ol>
        <p>Output:</p>
        <CodeBlock
          lang="text"
          code={`a initial rc count = 1
a next item = Some(RefCell { value: Nil })
a rc count after b creation = 2
b initial rc count = 1
b next item = Some(RefCell { value: Cons(5, RefCell { value: Nil }) })
b rc count after changing a = 2
a rc count after changing a = 2`}
        />
        <p>
          Modification-এর পর — দু'টোরই count 2। main শেষে — Rust b drop করতে
          চাইবে (b-এর local count কমে 1, কিন্তু a-এর tail এখনো b-কে hold
          করছে); a drop করতে চাইবে (a-এর local count কমে 1, কিন্তু b a-কে
          hold)। দু'জনেরই count ১-ই থেকে যায়। কেউ drop হয় না — leak।
        </p>
        <p>
          শেষের commented line uncomment করলে — list traverse infinite,
          stack overflow।
        </p>
        <p>
          Production-এ এটা bug। সমাধান — data structure-এর design-এ ownership
          relationship আর reference relationship আলাদা রাখা।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Weak&lt;T&gt; — non-owning reference</h2>
        <p>
          <InlineCode>Rc::clone</InlineCode> strong reference বাড়ায় — মানে
          ownership। <InlineCode>Rc::downgrade</InlineCode>{" "}
          <InlineCode>Weak&lt;T&gt;</InlineCode> বানায় — non-owning, weak count
          বাড়ে; strong count না।
        </p>
        <p>
          Rc drop হবে যখন strong count 0; weak count যাই হোক না কেন।
          মানে — cycle-এ weak reference থাকলে cycle break, leak হয় না।
        </p>
        <p>
          কিন্তু weak reference থেকে actual value access করতে গেলে — value
          এখনো আছে কিনা সেটা confirm করতে হবে। তাই{" "}
          <InlineCode>Weak&lt;T&gt;</InlineCode>-এ{" "}
          <InlineCode>upgrade</InlineCode> method —{" "}
          <InlineCode>Option&lt;Rc&lt;T&gt;&gt;</InlineCode> return; value
          থাকলে <InlineCode>Some</InlineCode>, drop হয়ে গেলে{" "}
          <InlineCode>None</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Tree data structure</h2>
        <p>
          একটা <InlineCode>Node</InlineCode> — যার একটা value আর একগুচ্ছ
          children।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });
}`}
        />
        <p>
          <InlineCode>branch</InlineCode> তার children-এ leaf-কে own করছে —
          Rc clone। কিন্তু এখন leaf থেকে branch (parent) access করার উপায়
          নেই। Parent reference যোগ করতে চাইলে — সেটা Rc করলে cycle।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Parent reference Weak</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
}`}
        />
        <p>
          Design choice — parent → child <InlineCode>Rc</InlineCode>{" "}
          (ownership), child → parent <InlineCode>Weak</InlineCode>{" "}
          (non-owning)। Result:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Parent drop হলে children drop।</li>
          <li>Child drop-এ parent affect না।</li>
          <li>কোনো cycle নেই — leak নেই।</li>
        </ul>
        <p>
          প্রথম <InlineCode>println!</InlineCode>-এ leaf-এর parent এখনো{" "}
          <InlineCode>Weak::new()</InlineCode> (default empty) — upgrade
          None। পরে branch বানিয়ে{" "}
          <InlineCode>*leaf.parent.borrow_mut() = Rc::downgrade(&branch);</InlineCode>{" "}
          — leaf-এর parent এখন branch-কে weak-point করে। দ্বিতীয় println-এ
          upgrade Some(Node)।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Strong/weak count visualize</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );

    {
        let branch = Rc::new(Node {
            value: 5,
            parent: RefCell::new(Weak::new()),
            children: RefCell::new(vec![Rc::clone(&leaf)]),
        });

        *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

        println!(
            "branch strong = {}, weak = {}",
            Rc::strong_count(&branch),
            Rc::weak_count(&branch),
        );

        println!(
            "leaf strong = {}, weak = {}",
            Rc::strong_count(&leaf),
            Rc::weak_count(&leaf),
        );
    }

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );
}`}
        />
        <p>Behavior:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Initial leaf — strong 1, weak 0।
          </li>
          <li>
            branch বানানোর পর — leaf strong 2 (নিজে + branch.children), weak
            0।
          </li>
          <li>
            <InlineCode>downgrade</InlineCode>-এর পর — branch strong 1, weak 1
            (leaf.parent থেকে)।
          </li>
          <li>
            inner scope শেষ হলে — branch-এর strong 0, drop। weak 1 ছিল কিন্তু
            সেটা drop আটকায় না।
          </li>
          <li>
            শেষে — leaf strong 1, weak 0; leaf.parent.upgrade() এখন None
            (branch গেছে)।
          </li>
        </ul>
        <p>
          এই design pattern — <strong>parent owns child via Rc, child
          references parent via Weak</strong> — tree, graph, DOM-এর মতো
          structure-এর standard solution।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Reference cycle = Rc + RefCell দিয়ে item-গুলো একে অপরকে point
            করলে — count 0 হয় না, leak।
          </li>
          <li>
            Memory leak Rust-এ memory-safe; কিন্তু design bug।
          </li>
          <li>
            <InlineCode>Weak&lt;T&gt;</InlineCode> non-owning;{" "}
            <InlineCode>Rc::downgrade</InlineCode> দিয়ে; weak count বাড়ে,
            strong না।
          </li>
          <li>
            <InlineCode>upgrade</InlineCode>{" "}
            <InlineCode>Option&lt;Rc&lt;T&gt;&gt;</InlineCode> দেয় — value
            existence check।
          </li>
          <li>
            Tree pattern — parent → child Rc, child → parent Weak;
            cycle-free।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.৬: Reference Cycle ও memory leak · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Rc + RefCell দিয়ে reference cycle ও memory leak; Weak<T> দিয়ে cycle prevent।",
    },
  ],
};
