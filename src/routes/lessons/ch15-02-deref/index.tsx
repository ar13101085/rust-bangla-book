import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-02-deref";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Smart Pointer-কে regular reference-এর মতো behave করানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Treating Smart Pointers Like Regular References
        </p>
        <p class="mt-3">
          <InlineCode>Deref</InlineCode> trait implement করলে তোমার type-এ{" "}
          <em>dereference operator</em> <InlineCode>*</InlineCode>-এর behavior
          customize করা যায় (multiplication-এর <InlineCode>*</InlineCode>{" "}
          না)। এর ফলে smart pointer-গুলো regular reference-এর মতোই code-এ
          ব্যবহার করা যায় — যেসব function reference নেয়, সেখানেও smart pointer
          কাজ করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Reference follow করা</h2>
        <p>
          Regular reference একটা ধরনের pointer — address-এ কী আছে সেটা পেতে
          dereference operator <InlineCode>*</InlineCode> দিয়ে follow করতে
          হয়।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}`}
        />
        <p>
          <InlineCode>y</InlineCode> হলো x-এর reference। সরাসরি{" "}
          <InlineCode>assert_eq!(5, y)</InlineCode> লিখলে type mismatch —
          number এবং reference compare করা যায় না।{" "}
          <InlineCode>*y</InlineCode> দিয়ে আগে value নিতে হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Box-কে reference-এর মতো use</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}`}
        />
        <p>
          আগের code-এর সাথে শুধু একটাই তফাত — <InlineCode>y</InlineCode> এখন
          reference না, একটা <InlineCode>Box</InlineCode>। কিন্তু{" "}
          <InlineCode>*y</InlineCode> একইভাবে কাজ করে। Box heap-এ data রাখে,
          reference borrow করে — দু'জনের সাথেই <InlineCode>*</InlineCode>{" "}
          একইভাবে use হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">নিজেদের smart pointer</h2>
        <p>
          নিজেরা একটা <InlineCode>MyBox&lt;T&gt;</InlineCode> বানাব —{" "}
          <InlineCode>Box</InlineCode>-এর মতোই কিন্তু simplified।
        </p>
        <CodeBlock
          lang="rust"
          code={`struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {}`}
        />
        <p>
          Tuple struct — শুধু একটাই element। <InlineCode>new</InlineCode>{" "}
          সেই element wrap করে।
        </p>
        <p>এবার reference-এর মতো use করার চেষ্টা:</p>
        <CodeBlock
          lang="rust"
          code={`struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}`}
        />
        <p>
          Compile হবে না — <InlineCode>MyBox</InlineCode>{" "}
          <InlineCode>Deref</InlineCode> implement করে না, তাই Rust জানে না{" "}
          <InlineCode>*y</InlineCode>-এর meaning কী।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Deref trait implement</h2>
        <CodeBlock
          lang="rust"
          code={`use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}`}
        />
        <p>
          <InlineCode>type Target = T;</InlineCode> — associated type;
          trait-এর জন্য একটা generic parameter declare করার একটু ভিন্ন পদ্ধতি।
        </p>
        <p>
          <InlineCode>deref(&amp;self) -&gt; &amp;Self::Target</InlineCode> —
          inner data-র reference return করে। <InlineCode>&self.0</InlineCode>{" "}
          মানে tuple struct-এর প্রথম (এবং একমাত্র) field-এর reference।
        </p>
        <p>
          Behind the scenes — <InlineCode>*y</InlineCode> Rust translate করে
          নেয় <InlineCode>*(y.deref())</InlineCode>-এ। Rust automatic{" "}
          <InlineCode>deref()</InlineCode> call করে reference পায়, তারপর সেই
          reference-কে regular <InlineCode>*</InlineCode> দিয়ে dereference।
        </p>
        <p>
          <InlineCode>deref</InlineCode> reference return করে — value না।
          কেন? কারণ value return করলে ownership move হত — অধিকাংশ ক্ষেত্রে
          আমরা সেটা চাই না, smart pointer-এর ভেতরের data-টা যাতে রয়ে যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Deref coercion</h2>
        <p>
          <strong>Deref coercion</strong> — Rust-এর একটা সুবিধা। যে type{" "}
          <InlineCode>Deref</InlineCode> implement করে, তার reference Rust
          automatically সেই type-এর target-এর reference-এ রূপান্তর করতে পারে।
          মানে — <InlineCode>&amp;MyBox&lt;String&gt;</InlineCode> থেকে{" "}
          <InlineCode>&amp;String</InlineCode> থেকে{" "}
          <InlineCode>&amp;str</InlineCode> — automatic chain।
        </p>
        <p>
          এটা function/method call-এ সবচেয়ে দরকারে আসে। উদাহরণ — একটা{" "}
          <InlineCode>hello</InlineCode> function যেটা{" "}
          <InlineCode>&amp;str</InlineCode> নেয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {}`}
        />
        <p>
          এখন <InlineCode>MyBox&lt;String&gt;</InlineCode>-এর reference pass
          করতে চাই:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&m);
}`}
        />
        <p>
          <InlineCode>&amp;m</InlineCode>{" "}
          <InlineCode>&amp;MyBox&lt;String&gt;</InlineCode>। Rust{" "}
          <InlineCode>deref</InlineCode> call করে{" "}
          <InlineCode>&amp;String</InlineCode> বানায়; standard library-তে{" "}
          <InlineCode>String</InlineCode>-এর Deref implementation আছে যেটা{" "}
          <InlineCode>&amp;str</InlineCode> দেয়। তাই pass হয়ে যায়।
        </p>
        <p>Deref coercion না থাকলে কেমন হত:</p>
        <CodeBlock
          lang="rust"
          code={`use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&(*m)[..]);
}`}
        />
        <p>
          <InlineCode>(*m)</InlineCode> — MyBox dereference করে String;{" "}
          <InlineCode>[..]</InlineCode> — পুরো String-এর slice। Deref coercion
          এই বাড়তি ceremony বাঁচায় — code পড়তে এবং লিখতে দু'টোই সহজ।
        </p>
        <p>Coercion-এর resolution compile time-এ হয় — runtime cost নেই।</p>

        <h2 class="mt-10 text-2xl font-bold">Mutable reference-এ Deref</h2>
        <p>
          Mutable reference-এ <InlineCode>*</InlineCode> override করতে হলে{" "}
          <InlineCode>DerefMut</InlineCode> trait।
        </p>
        <p>Rust তিন case-এ deref coercion করে:</p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            <InlineCode>&amp;T</InlineCode> থেকে <InlineCode>&amp;U</InlineCode>{" "}
            যখন <InlineCode>T: Deref&lt;Target=U&gt;</InlineCode>।
          </li>
          <li>
            <InlineCode>&amp;mut T</InlineCode> থেকে{" "}
            <InlineCode>&amp;mut U</InlineCode> যখন{" "}
            <InlineCode>T: DerefMut&lt;Target=U&gt;</InlineCode>।
          </li>
          <li>
            <InlineCode>&amp;mut T</InlineCode> থেকে{" "}
            <InlineCode>&amp;U</InlineCode> যখন{" "}
            <InlineCode>T: Deref&lt;Target=U&gt;</InlineCode>।
          </li>
        </ol>
        <p>
          Mutable থেকে immutable-এ coerce safe — borrowing rule অনুযায়ী mutable
          reference unique, তাকে immutable হিসেবে treat করলে rule ভাঙে না।
          কিন্তু উল্টো — immutable থেকে mutable — possible না, কারণ সেই
          data-এ অন্য immutable reference থাকতে পারে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Deref</InlineCode> trait — type-এ{" "}
            <InlineCode>*</InlineCode>-এর behavior define করে।
          </li>
          <li>
            <InlineCode>*y</InlineCode> Rust চালায় হিসেবে{" "}
            <InlineCode>*(y.deref())</InlineCode>।
          </li>
          <li>
            <InlineCode>deref</InlineCode> reference return করে — ownership
            move হয় না।
          </li>
          <li>
            Deref coercion — function/method call-এ Rust automatic chain
            করে; <InlineCode>&amp;MyBox&lt;String&gt;</InlineCode> →{" "}
            <InlineCode>&amp;String</InlineCode> →{" "}
            <InlineCode>&amp;str</InlineCode>।
          </li>
          <li>
            Mutable reference-এ <InlineCode>DerefMut</InlineCode>; coercion
            mutable → immutable safe, উল্টো না।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.২: Smart pointer ও Deref · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Deref trait, dereference operator-এর custom behavior, এবং deref coercion।",
    },
  ],
};
