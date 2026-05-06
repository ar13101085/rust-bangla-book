import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-04-rc";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Rc&lt;T&gt;: reference counted smart pointer
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Rc&lt;T&gt;, the Reference Counted Smart Pointer
        </p>
        <p class="mt-3">
          সাধারণত ownership স্পষ্ট — কোন variable কোন value-এর owner সেটা
          জানা থাকে। কিন্তু কিছু ক্ষেত্রে একটা value-এর একাধিক owner দরকার
          হয়। যেমন graph data structure-এ — একটা node-এ একাধিক edge
          point করতে পারে; conceptually সবাই সেই node-এর owner। Node-টা
          drop হবে তখনই, যখন কেউ আর reference করছে না।
        </p>
        <p class="mt-3">
          এই multiple ownership-কে explicit ভাবে enable করতে — Rust-এর{" "}
          <InlineCode>Rc&lt;T&gt;</InlineCode> type। Name এসেছে{" "}
          <em>reference counting</em> থেকে — value-এর reference কয়টা active
          সেটা track করে। Reference zero হলে value cleanup, কোনো reference
          invalid হয় না।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">কখন Rc&lt;T&gt; দরকার</h2>
        <p>
          ভাবো — family room-এ একটা TV। প্রথম যে ঢুকবে সে on করবে; পরে
          আরো লোক ঢুকতে পারে; সর্বশেষ যে room থেকে বের হবে সে off করবে।
          মাঝখানে কেউ off করে দিলে বাকিদের চিৎকার শুরু হবে। Rc-ও এমন।
        </p>
        <p>
          আমরা <InlineCode>Rc&lt;T&gt;</InlineCode> use করি — যখন heap-এ কিছু
          data multiple part-এ read করবে, এবং আগে থেকে compile time-এ বলা
          যায় না কোন part সবচেয়ে শেষে শেষ করবে। জানলেই সেটাকে owner বানাতাম
          — normal ownership rule।
        </p>
        <p>
          <em>Note:</em> <InlineCode>Rc&lt;T&gt;</InlineCode> only
          single-threaded। Multi-thread-এ reference counting আলাদা type —
          চ্যাপ্টার ১৬-তে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Box দিয়ে sharing — ভেঙে যায়</h2>
        <p>
          আগের পাঠ-এর cons list — দেখা যাক একই list দু'জনে share করার চেষ্টা
          Box দিয়ে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
    let b = Cons(3, Box::new(a));
    let c = Cons(4, Box::new(a));
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0382]: use of moved value: \`a\`
  --> src/main.rs:11:30
   |
 9 |     let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
    |         - move occurs because \`a\` has type \`List\`, which does not implement the \`Copy\` trait
10 |     let b = Cons(3, Box::new(a));
    |                              - value moved here
11 |     let c = Cons(4, Box::new(a));
    |                              ^ value used here after move`}
        />
        <p>
          <InlineCode>Cons</InlineCode> variant তার data own করে। b বানাতে গিয়ে
          a move হয়ে গেল b-তে। c-তে আর a available নেই। Reference দিয়েও করা
          যেত — কিন্তু lifetime parameter দিতে হত, এবং বলতে হত list-এর
          element list-এর চেয়ে বেশিদিন বাঁচে। সব scenario-তে এটা সত্যি না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Rc দিয়ে fix</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));
}`}
        />
        <p>
          <InlineCode>Rc</InlineCode> prelude-এ নেই —{" "}
          <InlineCode>use std::rc::Rc;</InlineCode> দরকার। প্রথম Rc-তে
          a বানালাম। b ও c বানানোর সময়{" "}
          <InlineCode>Rc::clone(&a)</InlineCode> — যেটা reference count
          বাড়ায়, ১ থেকে ২, তারপর ২ থেকে ৩।
        </p>
        <p>
          <InlineCode>a.clone()</InlineCode>-ও কাজ করত, কিন্তু convention হলো{" "}
          <InlineCode>Rc::clone(&a)</InlineCode>। কারণ —{" "}
          <InlineCode>Rc::clone</InlineCode> deep copy করে না, শুধু count
          বাড়ায়; বেশিরভাগ type-এর <InlineCode>clone</InlineCode> deep copy করে
          (expensive)। দু'জনের জন্য একই syntax থাকলে performance-এর জন্য
          code review করতে গিয়ে কোনটা cheap কোনটা costly বোঝা কঠিন। তাই Rust
          community deep clone vs ref-count clone visually আলাদা রাখার জন্য{" "}
          <InlineCode>Rc::clone</InlineCode> use করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Reference count দেখা</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

// --snip--

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    println!("count after creating a = {}", Rc::strong_count(&a));
    let b = Cons(3, Rc::clone(&a));
    println!("count after creating b = {}", Rc::strong_count(&a));
    {
        let c = Cons(4, Rc::clone(&a));
        println!("count after creating c = {}", Rc::strong_count(&a));
    }
    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
}`}
        />
        <p>
          <InlineCode>Rc::strong_count</InlineCode> দিয়ে count পড়া যায়।
          <InlineCode>strong_count</InlineCode> নাম এজন্য — Rc-তে আবার একটা{" "}
          <InlineCode>weak_count</InlineCode>-ও আছে (পরের পাঠ — reference
          cycle)।
        </p>
        <p>Output:</p>
        <CodeBlock
          lang="text"
          code={`count after creating a = 1
count after creating b = 2
count after creating c = 3
count after c goes out of scope = 2`}
        />
        <p>
          a-এর initial count ১। প্রতিটা <InlineCode>clone</InlineCode>{" "}
          ১ বাড়ায়; c scope-এর বাইরে গেলে ১ কমে। Decrement-এর জন্য আমরা
          কোনো function call করিনি — Rc-এর{" "}
          <InlineCode>Drop</InlineCode> implementation automatic count কমায়।
        </p>
        <p>
          Main শেষে b তারপর a scope-এর বাইরে যায় — count ০ হয়, Rc
          সম্পূর্ণ cleanup। Multiple owner থাকলেও Rc নিশ্চিত করে — যতদিন
          একজনও owner আছে value valid।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Limitation — শুধু read</h2>
        <p>
          <InlineCode>Rc&lt;T&gt;</InlineCode> immutable reference দিয়ে data
          share করতে দেয় — শুধু read। যদি multiple mutable reference allow
          করত, borrowing rule ভাঙত — data race, inconsistency। কিন্তু কখনো
          মুটেট-ও করতে চাই! সেটার সমাধান পরের পাঠে —{" "}
          <InlineCode>RefCell&lt;T&gt;</InlineCode> এবং interior
          mutability।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Rc&lt;T&gt;</InlineCode> — multiple ownership, reference
            count tracking; count ০ হলে cleanup।
          </li>
          <li>
            <InlineCode>Rc::clone(&a)</InlineCode> count বাড়ায়, deep copy
            না; performance-এ cheap।
          </li>
          <li>
            <InlineCode>Rc::strong_count(&a)</InlineCode> দিয়ে count পড়া যায়।
          </li>
          <li>
            <InlineCode>Drop</InlineCode> impl automatic count decrement
            করে — আলাদা function call লাগে না।
          </li>
          <li>
            Single-threaded only; mutable share-এর জন্য{" "}
            <InlineCode>RefCell</InlineCode> + Rc।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.৪: Rc<T> reference counted pointer · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর Rc<T> smart pointer — multiple ownership, reference counting, এবং Rc::clone-এর convention।",
    },
  ],
};
