import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-02-concurrency-with-async";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Async দিয়ে concurrency apply করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Applying Concurrency with Async
        </p>
        <p class="mt-3">
          Chapter 16-এ thread দিয়ে যা যা করেছি — multiple task একসাথে চালানো, message passing —
          async দিয়েও সেগুলো করা যায়। API অনেকটা একই দেখাবে, কিন্তু আচরণে কিছু পার্থক্য আছে। এই
          পাঠে আমরা <InlineCode>spawn_task</InlineCode>, <InlineCode>join</InlineCode>, async{" "}
          <InlineCode>channel</InlineCode>, এবং multiple producer pattern দেখব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">spawn_task দিয়ে নতুন task</h2>
        <p>
          <InlineCode>thread::spawn</InlineCode>-এর async equivalent হলো{" "}
          <InlineCode>trpl::spawn_task</InlineCode>। এটা একটা future নেয়, runtime-কে দেয়
          background-এ চালানোর জন্য:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        trpl::spawn_task(async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });

        for i in 1..5 {
            println!("hi number {i} from the second task!");
            trpl::sleep(Duration::from_millis(500)).await;
        }
    });
}`}
        />
        <CodeBlock
          lang="text"
          code={`hi number 1 from the second task!
hi number 1 from the first task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!`}
        />
        <p>
          সমস্যাটা thread-এর মতোই — main task শেষ হলে spawned task মাঝপথে বন্ধ। আমরা চাই first
          task পুরোপুরি ১ থেকে ৯ পর্যন্ত print করুক।
        </p>

        <h2 class="mt-10 text-2xl font-bold">JoinHandle await করা</h2>
        <p>
          <InlineCode>spawn_task</InlineCode> একটা handle return করে — সেটা <InlineCode>.await</InlineCode>{" "}
          করলে task complete না হওয়া পর্যন্ত wait হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let handle = trpl::spawn_task(async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });

        for i in 1..5 {
            println!("hi number {i} from the second task!");
            trpl::sleep(Duration::from_millis(500)).await;
        }

        handle.await.unwrap();
    });
}`}
        />
        <p>
          এখন spawned task পুরোটাই চলে — output-এ ১ থেকে ৯ সব আসে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">join — fair concurrency</h2>
        <p>
          আসলে এখানে আলাদা task spawn করার দরকার নেই। দু'টো async block বানিয়ে{" "}
          <InlineCode>trpl::join</InlineCode> দিয়ে দু'টোকেই একসাথে progress করানো যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let fut1 = async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let fut2 = async {
            for i in 1..5 {
                println!("hi number {i} from the second task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        trpl::join(fut1, fut2).await;
    });
}`}
        />
        <CodeBlock
          lang="text"
          code={`hi number 1 from the first task!
hi number 1 from the second task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
hi number 6 from the first task!
hi number 7 from the first task!
hi number 8 from the first task!
hi number 9 from the first task!`}
        />
        <p>
          <InlineCode>trpl::join</InlineCode> <strong>fair</strong> — অর্থাৎ প্রতিটা future-কে
          equally check করে, alternate করে। তাই output predictable। Thread-এ OS scheduler ঠিক করে
          কে আগে চলবে, এখানে runtime-ই সেটা নিয়ন্ত্রণ করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Async channel — message passing</h2>
        <p>
          Chapter 16-এর mpsc channel-এর async version:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    trpl::block_on(async {
        let (tx, mut rx) = trpl::channel();

        let val = String::from("hi");
        tx.send(val).unwrap();

        let received = rx.recv().await.unwrap();
        println!("received '{received}'");
    });
}`}
        />
        <p>
          Thread version-এর সাথে কয়েকটা পার্থক্য:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>rx</InlineCode> mutable হতে হবে।
          </li>
          <li>
            <InlineCode>recv</InlineCode> একটা future return করে — <InlineCode>.await</InlineCode>{" "}
            করতে হয়।
          </li>
          <li>
            <InlineCode>send</InlineCode> block করে না — তাই await দরকার নেই।
          </li>
          <li>
            Channel unbounded — capacity-র সীমা নেই।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Multiple message + sleep</h2>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let (tx, mut rx) = trpl::channel();

        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("future"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            trpl::sleep(Duration::from_millis(500)).await;
        }

        while let Some(value) = rx.recv().await {
            println!("received '{value}'");
        }
    });
}`}
        />
        <p>
          এই code চালালে দেখবে — সব message আগে পাঠানো হয়, তারপর সব receive। কারণ একটা single async
          block-এর code linearly execute হয়, await-এর order মেনে। Concurrent পেতে গেলে দু'টো আলাদা
          async block লাগবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">আলাদা block-এ send আর recv</h2>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let (tx, mut rx) = trpl::channel();

        let tx_fut = async {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        trpl::join(tx_fut, rx_fut).await;
    });
}`}
        />
        <p>
          এখন প্রতিটা message পাঠানোর পরপরই receive হয়। কিন্তু একটা সমস্যা — program কখনো শেষ হয়
          না! কারণ <InlineCode>tx_fut</InlineCode> শেষ হলেও <InlineCode>tx</InlineCode> drop হয় না
          (outer scope-এ ধরা আছে), তাই <InlineCode>rx.recv()</InlineCode> চিরকাল wait করতে থাকে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">async move দিয়ে ownership</h2>
        <p>
          সমাধান — <InlineCode>tx</InlineCode>-এর ownership async block-এ move করো, যেন block শেষ
          হলে drop হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let (tx, mut rx) = trpl::channel();

        let tx_fut = async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        trpl::join(tx_fut, rx_fut).await;
    });
}`}
        />
        <p>
          এখন <InlineCode>tx_fut</InlineCode> শেষ হলে <InlineCode>tx</InlineCode> drop, channel
          close, <InlineCode>recv</InlineCode> <InlineCode>None</InlineCode> দেয়, loop শেষ — program
          gracefully terminate।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Multiple producer + join! macro</h2>
        <p>
          <InlineCode>trpl::join</InlineCode> ঠিক দু'টো future নেয়। তিন বা তার বেশি হলে{" "}
          <InlineCode>join!</InlineCode> macro:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let (tx, mut rx) = trpl::channel();

        let tx1 = tx.clone();
        let tx1_fut = async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        let tx_fut = async move {
            let vals = vec![
                String::from("more"),
                String::from("messages"),
                String::from("for"),
                String::from("you"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(1500)).await;
            }
        };

        trpl::join!(tx1_fut, tx_fut, rx_fut);
    });
}`}
        />
        <CodeBlock
          lang="text"
          code={`received 'hi'
received 'more'
received 'from'
received 'the'
received 'messages'
received 'future'
received 'for'
received 'you'`}
        />
        <p>
          <InlineCode>tx.clone()</InlineCode> দিয়ে আরেকটা sender, দু'টো task আলাদা interval-এ
          message পাঠায়। <InlineCode>join!</InlineCode> macro arbitrary সংখ্যক future সামলাতে পারে
          (যতক্ষণ সংখ্যা compile time-এ জানা)।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>trpl::spawn_task</InlineCode> — async task spawn; handle{" "}
            <InlineCode>.await</InlineCode> দিয়ে join।
          </li>
          <li>
            <InlineCode>trpl::join(a, b)</InlineCode> — দু'টো future-কে fair concurrency-তে চালায়;
            output predictable।
          </li>
          <li>
            Async <InlineCode>channel</InlineCode> — <InlineCode>recv</InlineCode> async,{" "}
            <InlineCode>send</InlineCode> non-blocking, receiver mutable।
          </li>
          <li>
            একটা async block-এর ভিতরে code linear; concurrency পেতে আলাদা block লাগে।
          </li>
          <li>
            <InlineCode>async move</InlineCode> দিয়ে ownership transfer — sender drop ঠিকঠাক করতে
            জরুরি।
          </li>
          <li>
            <InlineCode>tx.clone()</InlineCode> + <InlineCode>join!</InlineCode> macro — multiple
            producer pattern।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.২: Async দিয়ে concurrency apply করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust async-এ spawn_task, join, async channel, async move, এবং join! macro দিয়ে multiple producer pattern।",
    },
  ],
};
