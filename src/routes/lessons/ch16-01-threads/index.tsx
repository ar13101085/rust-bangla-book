import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch16-01-threads";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৬.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Thread দিয়ে code একসাথে চালানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Using Threads to Run Code Simultaneously
        </p>
        <p class="mt-3">
          আধুনিক operating system-এ একটা program একটা <em>process</em>-এর ভেতরে
          চলে; OS অনেক process একসাথে handle করে। কিন্তু একটা program-এর ভেতরেও
          আলাদা আলাদা অংশ একসাথে চালানো যায় — এদের বলে{" "}
          <strong>thread</strong>। যেমন একটা web server একাধিক thread-এ একসাথে
          অনেক request serve করতে পারে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">কেন thread, কেন সাবধান</h2>
        <p>
          Thread দিয়ে কাজ ভাগ করে দিলে performance বাড়ে — কিন্তু complexity-ও
          বাড়ে। Thread-এর order নিশ্চিত নয়, এর থেকে কিছু সাধারণ সমস্যা:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Race condition</strong> — thread-গুলো inconsistent order-এ
            data access করছে।
          </li>
          <li>
            <strong>Deadlock</strong> — দু'টা thread একে অপরের জন্য অপেক্ষা
            করছে, কেউই এগোতে পারছে না।
          </li>
          <li>
            শুধু কিছু পরিস্থিতিতে দেখা দেওয়া bug — reliable-ভাবে reproduce করা
            কঠিন।
          </li>
        </ul>
        <p>
          Rust এই সমস্যাগুলো অনেকটাই compile time-এ ধরে। তবে multithreaded
          code-এ এখনো সাবধানে চিন্তা করা দরকার।
        </p>
        <p>
          Rust-এর standard library <strong>1:1</strong> thread model ব্যবহার করে
          — প্রতিটা language-level thread-এর জন্য একটা OS thread। অন্য model
          (যেমন green thread) চাইলে crate ecosystem-এ পাওয়া যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          নতুন thread — <InlineCode>thread::spawn</InlineCode>
        </h2>
        <p>
          নতুন thread তৈরি করতে <InlineCode>thread::spawn</InlineCode>-এ একটা
          closure পাস করো — যেই code আলাদা thread-এ চলবে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}`}
        />
        <p>
          সম্ভাব্য output — চালালে প্রতিবার একটু আলাদা হতে পারে:
        </p>
        <CodeBlock
          lang="text"
          code={`hi number 1 from the main thread!
hi number 1 from the spawned thread!
hi number 2 from the main thread!
hi number 2 from the spawned thread!
hi number 3 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the main thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!`}
        />
        <p>
          গুরুত্বপূর্ণ ব্যাপার — main thread শেষ হয়ে গেলে spawned thread-ও বন্ধ
          হয়ে যায়, তার কাজ শেষ হোক বা না হোক। তাই উপরের output-এ spawned thread
          1..10 পর্যন্ত print করতে চাইলেও 5-এ থেমে গেছে।
        </p>
        <p>
          <InlineCode>thread::sleep</InlineCode> current thread-কে অল্প সময়ের
          জন্য থামায় — অন্য thread-কে চালানোর সুযোগ দেয়। তবে কোন thread কখন
          চলবে — সেটা OS scheduler ঠিক করে, guarantee নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          সবগুলো thread শেষ হওয়ার অপেক্ষা — <InlineCode>join</InlineCode>
        </h2>
        <p>
          উপরের code-এ spawned thread পুরোপুরি চলবে কি না — সেটার guarantee নেই।
          Spawn-এর return-করা <InlineCode>JoinHandle&lt;T&gt;</InlineCode>{" "}
          সংরক্ষণ করে, তার <InlineCode>join</InlineCode> method কল করলে current
          thread block হয়ে অপেক্ষা করবে যতক্ষণ না spawned thread শেষ হয়:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap();
}`}
        />
        <p>
          এখন main thread তার নিজের loop শেষ হলেই থামে না — spawned thread শেষ
          হওয়া পর্যন্ত অপেক্ষা করে:
        </p>
        <CodeBlock
          lang="text"
          code={`hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 1 from the spawned thread!
hi number 3 from the main thread!
hi number 2 from the spawned thread!
hi number 4 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!`}
        />

        <h3 class="mt-6 text-xl font-bold">
          <InlineCode>join</InlineCode>-এর জায়গা matter করে
        </h3>
        <p>
          <InlineCode>handle.join()</InlineCode>-কে main-এর loop-এর{" "}
          <em>আগে</em> বসালে interleave হবে না:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    handle.join().unwrap();

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`hi number 1 from the spawned thread!
hi number 2 from the spawned thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 3 from the main thread!
hi number 4 from the main thread!`}
        />
        <p>
          Main thread আগে অপেক্ষা করছে — spawned thread পুরোপুরি শেষ হওয়ার পরে
          নিজের loop শুরু করে। ছোট্ট পার্থক্য — কিন্তু concurrency বদলে যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>move</InlineCode> closure থ্রেডে
        </h2>
        <p>
          Spawned thread-এ main thread-এর data ব্যবহার করতে হলে closure সেগুলো
          capture করবে। কিন্তু borrow করে capture করলে borrow checker ঝামেলায়
          পড়ে — কতদিন ওই reference valid থাকবে সেটা spawn জানে না।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {v:?}");
    });

    handle.join().unwrap();
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0373]: closure may outlive the current function, but it borrows \`v\`, which is owned by the current function
 --> src/main.rs:6:32
  |
6 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value \`v\`
7 |         println!("Here's a vector: {v:?}");
  |                                     - \`v\` is borrowed here
help: to force the closure to take ownership of \`v\` (and any other referenced variables), use the \`move\` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ++++`}
        />
        <p>
          ভাবলেও বোঝা যায় কেন এটা risky — main thread যদি এর মধ্যে{" "}
          <InlineCode>v</InlineCode> drop করে দেয়:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {v:?}");
    });

    drop(v); // oh no!

    handle.join().unwrap();
}`}
        />
        <p>
          সমাধান — <InlineCode>move</InlineCode> keyword। Closure-কে force করে
          ব্যবহৃত value-গুলোর ownership নিতে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {v:?}");
    });

    handle.join().unwrap();
}`}
        />
        <p>
          এখন <InlineCode>v</InlineCode>-এর ownership spawned thread-এ চলে যায়।
          Main thread আর সেটা ব্যবহার করতে পারবে না — drop-ও করতে পারবে না।
          Ownership rule এই situation-কেও safe রাখে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>thread::spawn(closure)</InlineCode> দিয়ে নতুন OS thread।
          </li>
          <li>
            Main thread শেষ হলে সব spawned thread-ও থেমে যায় — যদি না তুমি{" "}
            <InlineCode>JoinHandle</InlineCode>-এ <InlineCode>join</InlineCode>{" "}
            করো।
          </li>
          <li>
            <InlineCode>join</InlineCode> current thread-কে block করে রাখে
            target thread শেষ না হওয়া পর্যন্ত।
          </li>
          <li>
            Spawn-এ পাঠানো closure environment-এর reference নিতে পারে না —{" "}
            <InlineCode>move</InlineCode> দিয়ে ownership transfer করতে হয়।
          </li>
          <li>
            Rust-এর 1:1 thread model — language-level thread = OS thread।
          </li>
          <li>
            Race, deadlock, ordering — concurrency-র সাধারণ pitfall;{" "}
            <InlineCode>thread::sleep</InlineCode>-এ scheduling নিয়ন্ত্রণ করো না,
            শুধু সুযোগ দাও।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৬.১: Thread দিয়ে code একসাথে চালানো · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ thread::spawn, JoinHandle, join, এবং move closure দিয়ে multithreaded program।",
    },
  ],
};
