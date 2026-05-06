import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch16-02-message-passing";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৬.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Message Passing দিয়ে thread-এর মধ্যে data পাঠানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Using Message Passing to Transfer Data Between Threads
        </p>
        <p class="mt-3">
          নিরাপদ concurrency-র একটা জনপ্রিয় approach —{" "}
          <strong>message passing</strong>। Thread-গুলো একে অপরের memory share
          না করে, বরং <em>channel</em>-এর মাধ্যমে message পাঠায়। Go ভাষার
          slogan এখানে চমৎকার — "Do not communicate by sharing memory; instead,
          share memory by communicating।"
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Channel কী</h2>
        <p>
          Channel-এর দু'টা মাথা — উপরে <strong>transmitter</strong> (যেখান দিয়ে
          পাঠাও) আর নিচে <strong>receiver</strong> (যেখানে আসে)। যেকোনো একটা
          মাথা drop হয়ে গেলে channel <em>close</em> বলা হয়।
        </p>
        <p>
          Standard library-র <InlineCode>std::sync::mpsc</InlineCode> module এই
          সুবিধা দেয়। <InlineCode>mpsc</InlineCode> মানে{" "}
          <strong>multiple producer, single consumer</strong> — অনেক
          transmitter, কিন্তু receiver একটাই।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
}`}
        />
        <p>
          <InlineCode>mpsc::channel()</InlineCode> একটা tuple return করে —{" "}
          <InlineCode>tx</InlineCode> (transmitter) আর{" "}
          <InlineCode>rx</InlineCode> (receiver)। নাম-গুলো convention।
        </p>

        <h2 class="mt-10 text-2xl font-bold">প্রথম message পাঠানো</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {received}");
}`}
        />
        <p>
          Spawned thread-এ <InlineCode>tx</InlineCode>-এর ownership move করছি।
          ভেতরে <InlineCode>tx.send(val)</InlineCode> message পাঠায়;{" "}
          <InlineCode>send</InlineCode> একটা <InlineCode>Result</InlineCode>{" "}
          return করে — receiver drop হয়ে গেলে error। এখানে{" "}
          <InlineCode>unwrap</InlineCode>।
        </p>
        <p>
          Main thread-এ <InlineCode>rx.recv()</InlineCode> — block করে অপেক্ষা
          করে যতক্ষণ না value আসে। চলে এলে <InlineCode>Result</InlineCode>{" "}
          return করে।
        </p>
        <CodeBlock lang="text" code={`Got: hi`} />

        <h3 class="mt-6 text-xl font-bold">
          <InlineCode>recv</InlineCode> বনাম <InlineCode>try_recv</InlineCode>
        </h3>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>recv()</InlineCode> — blocking; value না আসা পর্যন্ত
            অপেক্ষা।
          </li>
          <li>
            <InlineCode>try_recv()</InlineCode> — non-blocking; সঙ্গে সঙ্গে{" "}
            <InlineCode>Ok(value)</InlineCode> বা <InlineCode>Err</InlineCode>।
            Thread-এর অন্য কাজও থাকলে এটা।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Ownership channel-এ</h2>
        <p>
          <InlineCode>send</InlineCode> তার argument-এর ownership নিয়ে নেয়। তাই
          send-এর পরে আর use করা যাবে না — ownership rule এখানেও data race থেকে
          রক্ষা করছে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
        println!("val is {val}");
    });

    let received = rx.recv().unwrap();
    println!("Got: {received}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0382]: borrow of moved value: \`val\`
  --> src/main.rs:10:27
   |
8  |         let val = String::from("hi");
   |             --- move occurs because \`val\` has type \`String\`
9  |         tx.send(val).unwrap();
   |                 --- value moved here
10 |         println!("val is {val}");
   |                           ^^^ value borrowed here after move`}
        />
        <p>
          ভেবে দেখো — receiver thread already <InlineCode>val</InlineCode>{" "}
          modify করতে পারে; sender thread একই সময়ে সেটা use করলে inconsistent।
          Rust সেই সুযোগই দেয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">একসাথে অনেকগুলো value</h2>
        <p>
          Receiver-কে iterator-এর মতো ব্যবহার করা যায় — channel close হলে
          iteration শেষ:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`Got: hi
Got: from
Got: the
Got: thread`}
        />
        <p>
          Spawned thread প্রতিটা value পাঠানোর পরে এক সেকেন্ড করে ঘুমায়, তাই
          receiver-এ একটু একটু করে আসে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Multiple producer — tx clone</h2>
        <p>
          <InlineCode>mpsc</InlineCode>-এ একাধিক producer থাকতে পারে। শুধু{" "}
          <InlineCode>tx.clone()</InlineCode> দিয়ে আরেকটা transmitter তৈরি করো:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`Got: hi
Got: more
Got: from
Got: messages
Got: for
Got: the
Got: thread
Got: you`}
        />
        <p>
          Order non-deterministic — system-এর timing-এর উপর নির্ভর করে। Sleep
          duration বদলে দিলে অন্য রকম interleaving দেখবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Channel-এর দুই মাথা — transmitter আর receiver;{" "}
            <InlineCode>mpsc::channel()</InlineCode> দু'টোই দেয়।
          </li>
          <li>
            <InlineCode>tx.send(val)</InlineCode> ownership transfer করে;{" "}
            <InlineCode>rx.recv()</InlineCode> block করে অপেক্ষা।
          </li>
          <li>
            <InlineCode>try_recv</InlineCode> non-blocking — অন্য কাজের
            পাশাপাশি poll।
          </li>
          <li>
            Receiver iterator-এর মতো — channel close না হওয়া পর্যন্ত value আসতে
            থাকে।
          </li>
          <li>
            <InlineCode>tx.clone()</InlineCode> দিয়ে multiple producer; receiver
            একটাই।
          </li>
          <li>
            Ownership rule message passing-কে compile time-এই data race থেকে
            মুক্ত রাখে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৬.২: Message Passing দিয়ে thread-এ data · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ mpsc channel, send/recv, multiple producer, এবং ownership-based safe message passing।",
    },
  ],
};
