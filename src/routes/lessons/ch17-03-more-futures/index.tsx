import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-03-more-futures";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          একাধিক Future নিয়ে কাজ
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Working With Any Number of Futures
        </p>
        <p class="mt-3">
          Async-এ যেহেতু সব future cooperatively চলে — অর্থাৎ runtime control নিতে পারে শুধু{" "}
          <InlineCode>.await</InlineCode> point-এ — তখন একটা future যদি দীর্ঘ synchronous কাজ করে
          await ছাড়াই, অন্যরা না খেয়েই বসে থাকবে। এই পাঠে আমরা দেখব কখন{" "}
          <InlineCode>yield_now</InlineCode> দরকার, এবং কীভাবে <InlineCode>select</InlineCode>{" "}
          ব্যবহার করে নিজেরাই async abstraction (যেমন <InlineCode>timeout</InlineCode>) বানানো যায়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Runtime-কে control return করা</h2>
        <p>
          Rust async block-গুলোকে pause করে runtime-কে control ফিরিয়ে দেয় <strong>শুধু await
          point-এ</strong>। দু'টো await-এর মাঝে যা আছে — সেটা synchronous, runtime সেখানে interrupt
          করতে পারে না।
        </p>
        <p>
          চলো একটা synchronous slow operation simulate করি <InlineCode>thread::sleep</InlineCode>{" "}
          দিয়ে (এটা thread-কে block করে, runtime-কে নয়):
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::{thread, time::Duration};

fn main() {
    trpl::block_on(async {
        // We will call \`slow\` here later
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Starvation দেখা</h2>
        <CodeBlock
          lang="rust"
          code={`use std::{thread, time::Duration};

fn main() {
    trpl::block_on(async {
        let a = async {
            println!("'a' started.");
            slow("a", 30);
            slow("a", 10);
            slow("a", 20);
            trpl::sleep(Duration::from_millis(50)).await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            slow("b", 10);
            slow("b", 15);
            slow("b", 350);
            trpl::sleep(Duration::from_millis(50)).await;
            println!("'b' finished.");
        };

        trpl::select(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}`}
        />
        <CodeBlock
          lang="text"
          code={`'a' started.
'a' ran for 30ms
'a' ran for 10ms
'a' ran for 20ms
'b' started.
'b' ran for 75ms
'b' ran for 10ms
'b' ran for 15ms
'b' ran for 350ms
'a' finished.`}
        />
        <p>
          লক্ষ্য করো — <InlineCode>a</InlineCode>-এর সব <InlineCode>slow</InlineCode> call শেষ না
          হওয়া পর্যন্ত <InlineCode>b</InlineCode> শুরুই হয়নি। কারণ a-এর await point আসেইনি — তিনটা
          synchronous <InlineCode>slow</InlineCode>-এর মাঝে runtime-এর কিছু করার নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">await দিয়ে মাঝে break</h2>
        <p>
          প্রতিটা <InlineCode>slow</InlineCode>-এর পরে একটু <InlineCode>trpl::sleep</InlineCode>{" "}
          await করি, যেন runtime অন্য future-কে চলার সুযোগ দিতে পারে:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::{thread, time::Duration};

fn main() {
    trpl::block_on(async {
        let one_ms = Duration::from_millis(1);

        let a = async {
            println!("'a' started.");
            slow("a", 30);
            trpl::sleep(one_ms).await;
            slow("a", 10);
            trpl::sleep(one_ms).await;
            slow("a", 20);
            trpl::sleep(one_ms).await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            trpl::sleep(one_ms).await;
            slow("b", 10);
            trpl::sleep(one_ms).await;
            slow("b", 15);
            trpl::sleep(one_ms).await;
            slow("b", 350);
            trpl::sleep(one_ms).await;
            println!("'b' finished.");
        };

        trpl::select(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}`}
        />
        <CodeBlock
          lang="text"
          code={`'a' started.
'a' ran for 30ms
'b' started.
'b' ran for 75ms
'a' ran for 10ms
'b' ran for 10ms
'a' ran for 20ms
'b' ran for 15ms
'a' finished.`}
        />
        <p>
          এখন <InlineCode>a</InlineCode> আর <InlineCode>b</InlineCode> alternate করছে। কিন্তু
          1ms-এর জন্যেও sleep করানো আসলে একটু overhead — timer setup ইত্যাদি।
        </p>

        <h2 class="mt-10 text-2xl font-bold">yield_now — clean ভাবে control হস্তান্তর</h2>
        <p>
          শুধু runtime-কে control return করার জন্য <InlineCode>trpl::yield_now</InlineCode> better —
          কোনো timer overhead নেই:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::{thread, time::Duration};

fn main() {
    trpl::block_on(async {
        let a = async {
            println!("'a' started.");
            slow("a", 30);
            trpl::yield_now().await;
            slow("a", 10);
            trpl::yield_now().await;
            slow("a", 20);
            trpl::yield_now().await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            trpl::yield_now().await;
            slow("b", 10);
            trpl::yield_now().await;
            slow("b", 15);
            trpl::yield_now().await;
            slow("b", 350);
            trpl::yield_now().await;
            println!("'b' finished.");
        };

        trpl::select(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}`}
        />
        <p>
          এটা <strong>cooperative multitasking</strong>-এর মূল ধারণা — প্রতিটা future নিজেই ঠিক করে
          কখন control ছেড়ে দেবে। তবে সবসময় প্রতিটা line-এর পরে yield করার দরকার নেই — strategic
          জায়গায় break point রাখাই পারফরম্যান্সের জন্য ভালো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">নিজের timeout abstraction</h2>
        <p>
          এমন একটা <InlineCode>timeout</InlineCode> চাই যেটা ৫ second-এর slow operation-কে ২
          second-এর বেশি wait করতে দেবে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

fn main() {
    trpl::block_on(async {
        let slow = async {
            trpl::sleep(Duration::from_secs(5)).await;
            "Finally finished"
        };

        match timeout(slow, Duration::from_secs(2)).await {
            Ok(message) => println!("Succeeded with '{message}'"),
            Err(duration) => {
                println!("Failed after {} seconds", duration.as_secs())
            }
        }
    });
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Signature</h3>
        <p>API design:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Async function — যাতে await করা যায়।</li>
          <li>
            Generic — যেকোনো future গ্রহণ করতে হবে।
          </li>
          <li>
            <InlineCode>Duration</InlineCode> param — সর্বোচ্চ wait।
          </li>
          <li>
            Result return — <InlineCode>Ok</InlineCode>-এ future-এর output,{" "}
            <InlineCode>Err</InlineCode>-এ overflow duration।
          </li>
        </ul>
        <CodeBlock
          lang="rust"
          code={`async fn timeout<F: Future>(
    future_to_try: F,
    max_time: Duration,
) -> Result<F::Output, Duration> {
    // Here is where our implementation will go!
}`}
        />

        <h3 class="mt-6 text-xl font-bold">select + sleep দিয়ে implementation</h3>
        <CodeBlock
          lang="rust"
          code={`use std::time::Duration;

use trpl::Either;

async fn timeout<F: Future>(
    future_to_try: F,
    max_time: Duration,
) -> Result<F::Output, Duration> {
    match trpl::select(future_to_try, trpl::sleep(max_time)).await {
        Either::Left(output) => Ok(output),
        Either::Right(_) => Err(max_time),
    }
}`}
        />
        <CodeBlock
          lang="text"
          code={`Failed after 2 seconds`}
        />
        <p>
          কয়েকটা গুরুত্বপূর্ণ point:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>trpl::select</InlineCode> <strong>fair নয়</strong> —{" "}
            <InlineCode>join</InlineCode>-এর মতো প্রতিটাকে equally check করে না, argument-এর
            order-এই poll করে। তাই <InlineCode>future_to_try</InlineCode>-কে আগে রাখি, যাতে সেটা
            ready হলেই Left ধরা পড়ে।
          </li>
          <li>
            <InlineCode>Either::Left</InlineCode> — original future আগে শেষ → Ok।
          </li>
          <li>
            <InlineCode>Either::Right</InlineCode> — timer আগে শেষ → Err।
          </li>
        </ul>
        <p>
          লক্ষ্য করো — আমরা একটাও নতুন low-level primitive লিখিনি। শুধু{" "}
          <InlineCode>select</InlineCode> আর <InlineCode>sleep</InlineCode>-কে compose করে নতুন
          abstraction। এটাই async-এর শক্তি।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কখন কোনটা — practical advice</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            Daily code-এ সরাসরি <InlineCode>async</InlineCode> / <InlineCode>.await</InlineCode>{" "}
            ব্যবহার করো।
          </li>
          <li>
            Coordination দরকার হলে <InlineCode>select</InlineCode>, <InlineCode>join</InlineCode>,{" "}
            <InlineCode>join!</InlineCode>।
          </li>
          <li>
            Compute-bound part থাকলে strategically <InlineCode>yield_now</InlineCode> বসাও — কিন্তু
            measure করে।
          </li>
          <li>
            প্রতিটা line-এ yield-await অপ্রয়োজনীয় overhead — state machine বড় হয়।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Async block-গুলো <InlineCode>.await</InlineCode> point ছাড়া যেতে পারে না — long
            synchronous কাজ অন্যদের starve করে।
          </li>
          <li>
            <InlineCode>trpl::yield_now</InlineCode> — runtime-কে control ফিরিয়ে দেওয়ার সবচেয়ে
            সহজ ও সস্তা উপায়।
          </li>
          <li>
            <InlineCode>trpl::select</InlineCode> ordered — argument-এর order-এ poll, fair না।
          </li>
          <li>
            Future + <InlineCode>select</InlineCode> compose করে নিজে{" "}
            <InlineCode>timeout</InlineCode>-এর মতো abstraction বানানো যায়।
          </li>
          <li>
            Generic <InlineCode>F: Future</InlineCode>, <InlineCode>F::Output</InlineCode>{" "}
            associated type — যেকোনো future সহ কাজ।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.৩: একাধিক Future নিয়ে কাজ · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Cooperative multitasking, await point starvation, yield_now, এবং select দিয়ে নিজের timeout abstraction।",
    },
  ],
};
