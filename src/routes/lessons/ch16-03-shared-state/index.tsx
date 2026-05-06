import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch16-03-shared-state";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৬.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Shared-state concurrency
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Shared-State Concurrency
        </p>
        <p class="mt-3">
          Channel single ownership-এর মতো — value পাঠানোর পর তুমি আর use করতে
          পারো না। কিন্তু কখনো একাধিক thread একই memory access করতে চায় — সেটাই{" "}
          <strong>shared-state concurrency</strong>। এতে data race-এর ঝুঁকি বেশি,
          তবে Rust-এর type system আর ownership rule অনেকটাই সাহায্য করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">
          <InlineCode>Mutex&lt;T&gt;</InlineCode> — একসাথে একজন
        </h2>
        <p>
          <strong>Mutex</strong> = mutual exclusion। যেকোনো সময়ে শুধু একটাই
          thread data access করতে পারবে। প্রতিটা thread-কে দুটো নিয়ম মানতে হয়:
        </p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>Data ব্যবহারের আগে lock <em>acquire</em> করতে হবে।</li>
          <li>কাজ শেষ হলে unlock — নাহলে অন্য কেউ পাবে না।</li>
        </ol>
        <p>
          Real-world analogy — panel discussion-এ একটাই microphone। কেউ কথা বলতে
          চাইলে সিগন্যাল দেয়, mic পায়, কথা শেষে পরের জনের হাতে দেয়। কেউ ভুলে
          গেলে আর কারও কথা বলা হবে না।
        </p>

        <h3 class="mt-6 text-xl font-bold">
          Single-threaded <InlineCode>Mutex</InlineCode> API
        </h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }

    println!("m = {m:?}");
}`}
        />
        <p>
          <InlineCode>Mutex::new</InlineCode> দিয়ে value wrap;{" "}
          <InlineCode>m.lock()</InlineCode> call করলে current thread block হয়ে
          অপেক্ষা করে যতক্ষণ না lock পায়।
        </p>
        <p>
          <InlineCode>lock</InlineCode> একটা <InlineCode>LockResult</InlineCode>{" "}
          return করে — wrap করা থাকে <InlineCode>MutexGuard</InlineCode>।
          MutexGuard:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Deref</InlineCode> implement করে — তাই{" "}
            <InlineCode>*num</InlineCode> দিয়ে inner data access।
          </li>
          <li>
            <InlineCode>Drop</InlineCode> implement করে — scope ছাড়লে automatic
            unlock। ভুলে unlock করার ভয় নেই।
          </li>
        </ul>
        <p>
          Lock-হোল্ডিং thread panic করলে <InlineCode>lock()</InlineCode>{" "}
          <em>poisoned</em> হয়ে error দেয় — তাই এখানে{" "}
          <InlineCode>unwrap</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          একাধিক thread-এ <InlineCode>Mutex</InlineCode> share — সমস্যা ১
        </h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0382]: borrow of moved value: \`counter\``}
        />
        <p>
          প্রথম iteration-এই <InlineCode>counter</InlineCode> closure-এ move হয়ে
          যায়। দ্বিতীয় iteration-এ আবার move করতে গিয়ে error। দরকার —{" "}
          <em>multiple ownership</em>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>Rc&lt;T&gt;</InlineCode> দিয়ে চেষ্টা — ব্যর্থ
        </h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Rc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Rc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: \`Rc<std::sync::Mutex<i32>>\` cannot be sent between threads safely
  = help: within the closure, the trait \`Send\` is not implemented for \`Rc<std::sync::Mutex<i32>>\``}
        />
        <p>
          <InlineCode>Rc&lt;T&gt;</InlineCode> thread-safe না। এর reference count
          update concurrency primitive ছাড়া হয় — দু'টা thread একসাথে modify
          করলে count ভুল, leak, বা early drop হতে পারে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          সমাধান — <InlineCode>Arc&lt;T&gt;</InlineCode>
        </h2>
        <p>
          <InlineCode>Arc</InlineCode>-এর "a" মানে <strong>atomic</strong> —
          atomically reference-counted। API <InlineCode>Rc&lt;T&gt;</InlineCode>
          -এর মতোই, কিন্তু count-update thread-safe atomic operation দিয়ে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}`}
        />
        <CodeBlock lang="text" code={`Result: 10`} />
        <p>
          কেন তবে সরাসরি default-এ <InlineCode>Arc</InlineCode> না? কারণ atomic
          operation-এর কিছু overhead আছে — single-threaded code-এ সেই খরচ দেওয়ার
          মানে নেই। যেখানে thread safety দরকার, শুধু সেখানেই{" "}
          <InlineCode>Arc</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>RefCell/Rc</InlineCode> বনাম <InlineCode>Mutex/Arc</InlineCode>
        </h2>
        <p>
          লক্ষ করো — <InlineCode>counter</InlineCode>{" "}
          <em>immutable</em> ছিল, কিন্তু আমরা ভেতরের value modify করেছি। এটাই{" "}
          <strong>interior mutability</strong>।{" "}
          <InlineCode>RefCell&lt;T&gt;</InlineCode>{" "}
          <InlineCode>Rc&lt;T&gt;</InlineCode>-এর ভেতরে যেমন কাজ করে,{" "}
          <InlineCode>Mutex&lt;T&gt;</InlineCode>{" "}
          <InlineCode>Arc&lt;T&gt;</InlineCode>-এর ভেতরে তেমনি।
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Rc/RefCell</InlineCode> — single-threaded; reference
            cycle থেকে memory leak-এর ঝুঁকি।
          </li>
          <li>
            <InlineCode>Arc/Mutex</InlineCode> — multi-threaded;{" "}
            <strong>deadlock</strong>-এর ঝুঁকি (দু'টা thread একে অপরের
            lock-এর জন্য চিরকাল অপেক্ষা)।
          </li>
        </ul>
        <p>
          Deadlock যেমন reference cycle, তেমনি — Rust সরাসরি ধরতে পারে না; logic
          সাবধানে structure করতে হয়।
        </p>
        <p>
          Note: simple counter-এর জন্য{" "}
          <InlineCode>std::sync::atomic</InlineCode> module-এর atomic type{" "}
          (যেমন <InlineCode>AtomicUsize</InlineCode>) প্রায়শই Mutex-এর চেয়ে
          সস্তা।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Mutex&lt;T&gt;</InlineCode> shared data-কে exclusive
            access-এ guard করে; <InlineCode>lock()</InlineCode> ছাড়া access
            অসম্ভব।
          </li>
          <li>
            <InlineCode>MutexGuard</InlineCode>-এর Drop scope শেষে automatic
            unlock।
          </li>
          <li>
            একাধিক thread-এ Mutex share-এর জন্য{" "}
            <InlineCode>Arc&lt;Mutex&lt;T&gt;&gt;</InlineCode> pattern;{" "}
            <InlineCode>Rc</InlineCode> thread-safe না।
          </li>
          <li>
            Mutex/Arc <em>interior mutability</em> দেয় — immutable wrapper-এর
            ভেতরের data বদলানো যায়।
          </li>
          <li>
            Deadlock — দু'টা thread পরস্পরের lock-এর জন্য চিরকাল wait; logic
            সাবধানে design।
          </li>
          <li>
            Counter-জাতীয় কাজে atomic type প্রায়ই Mutex-এর চেয়ে সাশ্রয়ী।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৬.৩: Shared-state concurrency · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Mutex, MutexGuard, Arc, এবং multi-threaded shared-state pattern; deadlock-এর সতর্কতা।",
    },
  ],
};
