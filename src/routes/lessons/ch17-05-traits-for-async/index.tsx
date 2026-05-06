import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-05-traits-for-async";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Async-এর Trait-গুলোতে আরও গভীরে
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          A Closer Look at the Traits for Async
        </p>
        <p class="mt-3">
          এতক্ষণ আমরা <InlineCode>async</InlineCode>/<InlineCode>.await</InlineCode> ব্যবহার করেছি;
          এবার দেখা যাক আড়ালে যে trait-গুলো কাজ করছে — <InlineCode>Future</InlineCode>,{" "}
          <InlineCode>Pin</InlineCode>, <InlineCode>Unpin</InlineCode>, এবং{" "}
          <InlineCode>Stream</InlineCode>। দৈনন্দিন code-এ সরাসরি ব্যবহার কম, কিন্তু error message
          বুঝতে এবং custom abstraction লিখতে এরা জানা দরকার।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Future trait</h2>
        <CodeBlock
          lang="rust"
          code={`use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Output</InlineCode> — associated type; future ready হলে এই type-এর value
            দেবে।
          </li>
          <li>
            <InlineCode>poll</InlineCode> — runtime এই method call করে জানতে চায় future ready
            হয়েছে কিনা।
          </li>
          <li>
            Self <InlineCode>Pin&lt;&amp;mut Self&gt;</InlineCode> — কেন pinning দরকার, পরে বলব।
          </li>
          <li>
            <InlineCode>Context</InlineCode> — runtime-এর সাথে communicate করার channel (যেমন waker)।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">Poll enum</h3>
        <CodeBlock
          lang="rust"
          code={`pub enum Poll<T> {
    Ready(T),
    Pending,
}`}
        />
        <p>
          <InlineCode>Pending</InlineCode> মানে "এখনো ready না, পরে আবার call করো";{" "}
          <InlineCode>Ready(T)</InlineCode> মানে "শেষ, এই value নাও"। সাধারণ rule —{" "}
          <InlineCode>Ready</InlineCode> return করার পর আবার <InlineCode>poll</InlineCode> call
          করতে নেই (যদি না documentation explicitly বলে)।
        </p>

        <h3 class="mt-6 text-xl font-bold">await আসলে কী হয়</h3>
        <p>
          Compiler <InlineCode>.await</InlineCode>-কে conceptually এমন code-এ transform করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`let mut page_title_fut = page_title(url);
loop {
    match page_title_fut.poll() {
        Ready(value) => match value {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
        Pending => {
            // continue
        }
    }
}`}
        />
        <p>
          আসল code-এ runtime এই loop-টাই চালায় — busy loop নয়, waker দিয়ে notification system —
          এবং <InlineCode>Pending</InlineCode> হলে other future-কে চলার সুযোগ দেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Pin এবং Unpin</h2>
        <p>
          Async block থেকে compile হওয়া future-গুলো কখনো কখনো নিজের ভিতরের data-কে refer করে
          (self-referential)। যেমন একটা local variable-এর reference পরের state-এ রাখা। এমন data
          memory-তে move হলে reference invalid হয়ে যাবে।
        </p>
        <p>
          <InlineCode>Pin</InlineCode> — pointer type-এর (<InlineCode>&</InlineCode>,{" "}
          <InlineCode>&mut</InlineCode>, <InlineCode>Box</InlineCode>, <InlineCode>Rc</InlineCode>)
          wrapper, যা <strong>wrapped data-কে memory-তে move হতে দেয় না</strong>।
        </p>
        <CodeBlock
          lang="rust"
          code={`Pin<Box<SomeType>>  // Pins the SomeType value, not the Box pointer`}
        />
        <p>
          লক্ষ্য — <InlineCode>Box</InlineCode> pointer-টা যেকোনো জায়গায় move হতে পারে; কিন্তু এটা
          যা point করে আছে সেটা স্থির থাকে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Unpin marker</h3>
        <p>
          <InlineCode>Unpin</InlineCode> — <InlineCode>Send</InlineCode>/<InlineCode>Sync</InlineCode>{" "}
          এর মতো একটা marker trait। বলে — "এই type pin করা সত্ত্বেও move করা safe।"
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            অধিকাংশ type automatic <InlineCode>Unpin</InlineCode> implement করে — যেমন{" "}
            <InlineCode>String</InlineCode>, <InlineCode>Vec</InlineCode>।
          </li>
          <li>
            Self-referential structure-গুলো <InlineCode>!Unpin</InlineCode> — অর্থাৎ Unpin না।
          </li>
          <li>
            <InlineCode>Unpin</InlineCode> normal case; <InlineCode>!Unpin</InlineCode> special।
          </li>
          <li>
            এর প্রয়োজন শুধু <InlineCode>Pin&lt;&amp;mut T&gt;</InlineCode> ব্যবহার করার সময়।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">কোথায় এটা practical-এ আসে</h2>
        <p>
          আগের পাঠের multiple-producer code-এ যদি future-গুলো{" "}
          <InlineCode>Vec&lt;Box&lt;dyn Future&gt;&gt;</InlineCode>-এ রাখতে চাও, error আসবে — কারণ{" "}
          <InlineCode>dyn Future</InlineCode> <InlineCode>Unpin</InlineCode> implement করে না।
        </p>
        <CodeBlock
          lang="rust"
          code={`let futures: Vec<Box<dyn Future<Output = ()>>> =
    vec![Box::new(tx1_fut), Box::new(rx_fut), Box::new(tx_fut)];

trpl::join_all(futures).await;  // Error: dyn Future doesn't implement Unpin`}
        />
        <p>
          সমাধান — <InlineCode>pin!</InlineCode> macro দিয়ে future-গুলো pin করে, type-টা{" "}
          <InlineCode>Pin&lt;&amp;mut dyn Future&gt;</InlineCode> বানাও:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::pin::{Pin, pin};

let tx1_fut = pin!(async move {
    let vals = vec![
        String::from("hi"),
        String::from("from"),
        String::from("the"),
        String::from("future"),
    ];

    for val in vals {
        tx1.send(val).unwrap();
        trpl::sleep(Duration::from_secs(1)).await;
    }
});

let rx_fut = pin!(async {
    while let Some(value) = rx.recv().await {
        println!("received '{value}'");
    }
});

let tx_fut = pin!(async move {
    let vals = vec![
        String::from("more"),
        String::from("messages"),
        String::from("for"),
        String::from("you"),
    ];

    for val in vals {
        tx.send(val).unwrap();
        trpl::sleep(Duration::from_secs(1)).await;
    }
});

let futures: Vec<Pin<&mut dyn Future<Output = ()>>> =
    vec![tx1_fut, rx_fut, tx_fut];

trpl::join_all(futures).await;`}
        />
        <p>
          এখন future-গুলো pinned, আর <InlineCode>join_all</InlineCode> খুশি।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Stream trait</h2>
        <CodeBlock
          lang="rust"
          code={`use std::pin::Pin;
use std::task::{Context, Poll};

trait Stream {
    type Item;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>
    ) -> Poll<Option<Self::Item>>;
}`}
        />
        <p>
          লক্ষ্য করো — <InlineCode>Future</InlineCode>-এর <InlineCode>poll</InlineCode>{" "}
          <InlineCode>Poll&lt;Output&gt;</InlineCode> দেয়, <InlineCode>Stream</InlineCode>-এর{" "}
          <InlineCode>poll_next</InlineCode> <InlineCode>Poll&lt;Option&lt;Item&gt;&gt;</InlineCode>{" "}
          দেয় — অর্থাৎ Future-এর <InlineCode>Poll</InlineCode> + Iterator-এর{" "}
          <InlineCode>Option</InlineCode>। <InlineCode>None</InlineCode> এলে stream শেষ।
        </p>

        <h3 class="mt-6 text-xl font-bold">StreamExt</h3>
        <CodeBlock
          lang="rust"
          code={`trait StreamExt: Stream {
    async fn next(&mut self) -> Option<Self::Item>
    where
        Self: Unpin;

    // other methods...
}`}
        />
        <p>
          <InlineCode>StreamExt</InlineCode> — <InlineCode>Stream</InlineCode>-কে extend করে{" "}
          <InlineCode>next</InlineCode> ও অন্যান্য utility method দেয় যাতে আমাদের সরাসরি{" "}
          <InlineCode>poll_next</InlineCode> call করতে না হয়। <InlineCode>Stream</InlineCode>{" "}
          implement করলে <InlineCode>StreamExt</InlineCode> automatic — separation-এর সুবিধা হলো
          community নতুন utility method add করতে পারে base trait না বদলে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Quick reference table</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Future</InlineCode> — single async value;{" "}
            <InlineCode>poll → Poll&lt;Output&gt;</InlineCode>।
          </li>
          <li>
            <InlineCode>Stream</InlineCode> — async value-এর sequence;{" "}
            <InlineCode>poll_next → Poll&lt;Option&lt;Item&gt;&gt;</InlineCode>।
          </li>
          <li>
            <InlineCode>Pin</InlineCode> — wrapper, wrapped data-কে move হতে দেয় না।
          </li>
          <li>
            <InlineCode>Unpin</InlineCode> — marker; pin করা সত্ত্বেও move safe।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Future</InlineCode> trait-এ <InlineCode>poll</InlineCode> method এবং{" "}
            <InlineCode>Poll&lt;T&gt;</InlineCode> enum (<InlineCode>Ready</InlineCode>/
            <InlineCode>Pending</InlineCode>) — <InlineCode>.await</InlineCode>-এর foundation।
          </li>
          <li>
            Async block থেকে generated future self-referential হতে পারে — তাই memory-তে move হতে
            পারে না।
          </li>
          <li>
            <InlineCode>Pin</InlineCode> data-কে memory-তে স্থির রাখে; <InlineCode>Unpin</InlineCode>{" "}
            marker trait যেটা বলে "move safe"।
          </li>
          <li>
            <InlineCode>pin!</InlineCode> macro দিয়ে future pin করে collection-এ রাখা যায়।
          </li>
          <li>
            <InlineCode>Stream</InlineCode> = <InlineCode>Future</InlineCode> +{" "}
            <InlineCode>Iterator</InlineCode>; <InlineCode>StreamExt</InlineCode>{" "}
            <InlineCode>next</InlineCode>-এর মতো utility add করে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.৫: Async-এর Trait-গুলোতে আরও গভীরে · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Future trait, Poll enum, Pin/Unpin, pin! macro, এবং Stream/StreamExt — async-এর low-level foundation।",
    },
  ],
};
