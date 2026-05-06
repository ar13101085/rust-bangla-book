import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-04-streams";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Stream: Future-এর sequence
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Streams: Futures in Sequence
        </p>
        <p class="mt-3">
          আগের পাঠে async channel-এর <InlineCode>recv</InlineCode> ব্যবহার করেছি — সময়ের সাথে সাথে
          একের পর এক item। এই pattern-টাই হলো <InlineCode>Stream</InlineCode>। Queue-তে item আসছে,
          file থেকে chunk-by-chunk read হচ্ছে, network থেকে data trickle করে আসছে — সব stream।
          Stream হলো async iterator।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Iterator vs Stream</h2>
        <p>
          Chapter 13-এ <InlineCode>Iterator</InlineCode> দেখেছি — synchronous{" "}
          <InlineCode>next</InlineCode>। Async channel-এর receiver-এ <InlineCode>recv</InlineCode>{" "}
          ছিল asynchronous। দু'টো API-এর pattern প্রায় একই — দু'টো জায়গাতেই sequence-এর next item
          চাইছি, পার্থক্য শুধু:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Time</strong> — Iterator synchronous, stream asynchronous।
          </li>
          <li>
            <strong>API</strong> — Iterator-এর <InlineCode>next</InlineCode> blocking নয়, stream-এর{" "}
            <InlineCode>next</InlineCode> future return করে।
          </li>
        </ul>
        <p>
          Rust-এ যেকোনো iterator থেকে stream বানানো যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Iterator থেকে stream</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    trpl::block_on(async {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let iter = values.iter().map(|n| n * 2);
        let mut stream = trpl::stream_from_iter(iter);

        while let Some(value) = stream.next().await {
            println!("The value was: {value}");
        }
    });
}`}
        />
        <p>
          ধাপগুলো:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            একটা array থেকে iterator, <InlineCode>.map</InlineCode> দিয়ে value double।
          </li>
          <li>
            <InlineCode>trpl::stream_from_iter</InlineCode> — iterator কে stream-এ convert।
          </li>
          <li>
            <InlineCode>while let Some(value) = stream.next().await</InlineCode> — async iteration।
          </li>
        </ul>
        <p>
          কিন্তু এই code এখনও compile করবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Compile error — trait scope-এ নেই</h2>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0599]: no method named \`next\` found for struct \`tokio_stream::iter::Iter\` in the current scope
  --> src/main.rs:10:40
   |
10 |         while let Some(value) = stream.next().await {
   |                                        ^^^^
   |
   = help: items from traits can only be used if the trait is in scope
help: the following traits which provide \`next\` are implemented but not in scope; perhaps you want to import one of them
   |
1  + use crate::trpl::StreamExt;
   |
1  + use futures_util::stream::stream::StreamExt;
   |
1  + use std::iter::Iterator;
   |
1  + use std::str::pattern::Searcher;
   |
help: there is a method \`try_next\` with a similar name
   |
10 |         while let Some(value) = stream.try_next().await {
   |                                        ~~~~~~~~`}
        />
        <p>
          Compiler বলছে — <InlineCode>next</InlineCode> method-টা যেই trait-এ আছে সেটা scope-এ নেই।
          তুমি ভাবতে পারো এটা <InlineCode>Stream</InlineCode> trait হবে — কিন্তু আসলে এটা{" "}
          <InlineCode>StreamExt</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Stream vs StreamExt</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Stream</InlineCode> — low-level interface; <InlineCode>Iterator</InlineCode>{" "}
            ও <InlineCode>Future</InlineCode>-কে effectively combine করে।
          </li>
          <li>
            <InlineCode>StreamExt</InlineCode> — Stream-এর উপর high-level API set, যেমন{" "}
            <InlineCode>next</InlineCode>। "Ext" মানে extension — Rust community-র common pattern,
            base trait-কে utility method দিয়ে extend করে।
          </li>
        </ul>
        <p>
          আপাতত <InlineCode>Stream</InlineCode> এবং <InlineCode>StreamExt</InlineCode> দু'টোর কোনোটাই
          standard library-তে নেই, কিন্তু ecosystem crate (যেমন <InlineCode>futures</InlineCode>)
          মোটামুটি একই definition use করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Fix — StreamExt import</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use trpl::StreamExt;

fn main() {
    trpl::block_on(async {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let iter = values.iter().map(|n| n * 2);
        let mut stream = trpl::stream_from_iter(iter);

        while let Some(value) = stream.next().await {
            println!("The value was: {value}");
        }
    });
}`}
        />
        <p>
          এক লাইন <InlineCode>use trpl::StreamExt;</InlineCode> add করলেই compile করে। এখন{" "}
          <InlineCode>StreamExt</InlineCode>-এর সব utility method (filter, map, take, ইত্যাদি — যা
          iterator-এ আছে তার async equivalent) ব্যবহার করা যাবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কেন stream দরকার</h2>
        <p>
          Stream future, তাই অন্য future-এর সাথে combine করা যায় — যেমন:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            অনেক network call avoid করার জন্য event-গুলো batch করা।
          </li>
          <li>
            Long-running operation-এর sequence-এ timeout বসানো।
          </li>
          <li>
            UI event-গুলো throttle করে অপ্রয়োজনীয় কাজ বাঁচানো।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Stream — সময়ের সাথে item return করা async sequence; iterator-এর async version।
          </li>
          <li>
            <InlineCode>trpl::stream_from_iter</InlineCode> — যেকোনো iterator কে stream-এ convert।
          </li>
          <li>
            <InlineCode>while let Some(v) = stream.next().await</InlineCode> — async iteration
            pattern।
          </li>
          <li>
            <InlineCode>next</InlineCode> method <InlineCode>Stream</InlineCode>-এ না,{" "}
            <InlineCode>StreamExt</InlineCode> extension trait-এ — তাই import দরকার।
          </li>
          <li>
            Stream-গুলো future-ও — অন্য future-এর সাথে select/join/timeout-এ ব্যবহার করা যায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.৪: Stream: Future-এর sequence · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Stream — async iterator; trpl::stream_from_iter, StreamExt extension trait, এবং async iteration pattern।",
    },
  ],
};
