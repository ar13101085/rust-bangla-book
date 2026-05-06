import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch17-01-futures-and-syntax";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৭.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Future এবং Async syntax
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Futures and the Async Syntax
        </p>
        <p class="mt-3">
          Async programming-এর মূল building block হলো <InlineCode>Future</InlineCode> —
          একটা value যেটা এখন ready না, কিন্তু পরে কোনো একসময় ready হবে। Rust-এ{" "}
          <InlineCode>async</InlineCode> এবং <InlineCode>await</InlineCode> দু'টো keyword দিয়ে
          আমরা future-গুলোর সাথে কাজ করি। এই পাঠে আমরা প্রথম async program লিখব এবং দেখব Rust internally
          এই syntax-কে state machine-এ কিভাবে transform করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">প্রথম async program</h2>
        <p>
          চলো একটা ছোট CLI বানাই — একটা URL নিয়ে সেটার HTML page-এর{" "}
          <InlineCode>&lt;title&gt;</InlineCode> element fetch করবে। শুরুতে নতুন project আর{" "}
          <InlineCode>trpl</InlineCode> crate add করো:
        </p>
        <CodeBlock
          lang="bash"
          code={`$ cargo new hello-async
$ cd hello-async
$ cargo add trpl`}
        />
        <p>
          <InlineCode>trpl</InlineCode> ("The Rust Programming Language"-এর shorthand) এই বইয়ের
          example-গুলো simple করার জন্য বানানো — internally এটা <InlineCode>futures</InlineCode> এবং{" "}
          <InlineCode>tokio</InlineCode> crate-এর key type/trait/function-গুলো re-export করে।{" "}
          <InlineCode>tokio</InlineCode> Rust ecosystem-এর সবচেয়ে widely used async runtime।
        </p>

        <h2 class="mt-10 text-2xl font-bold">page_title function define করা</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use trpl::Html;

async fn page_title(url: &str) -> Option<String> {
    let response = trpl::get(url).await;
    let response_text = response.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html())
}`}
        />
        <p>
          লক্ষ্য করার মতো কয়েকটা জিনিস:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>async fn</InlineCode> — function-কে async হিসেবে mark করে; এর body
            interrupt এবং resume হতে পারে।
          </li>
          <li>
            <InlineCode>.await</InlineCode> postfix — expression-এর পরে আসে। এটা পেলে runtime current
            future-কে pause করে control return নেয়, future ready হলে আবার resume।
          </li>
          <li>
            Postfix syntax-এর সুবিধা — method chain হলে অনেক পরিষ্কার পড়া যায়।
          </li>
        </ul>
        <p>
          দু'টো <InlineCode>.await</InlineCode>-কে chain করে আরও compact করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`async fn page_title(url: &str) -> Option<String> {
    let response_text = trpl::get(url).await.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html())
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">async main কাজ করে না</h2>
        <p>
          সরাসরি <InlineCode>main</InlineCode>-কে <InlineCode>async</InlineCode> বানিয়ে দেখো —
        </p>
        <CodeBlock
          lang="rust"
          code={`async fn main() {
    let args: Vec<String> = std::env::args().collect();
    let url = &args[1];
    match page_title(url).await {
        Some(title) => println!("The title for {url} was {title}"),
        None => println!("{url} had no title"),
    }
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0752]: \`main\` function is not allowed to be \`async\`
 --> src/main.rs:6:1
  |
6 | async fn main() {
  | ^^^^^^^^^^^^^^^ \`main\` function is not allowed to be \`async\``}
        />
        <p>
          কেন? Async code execute করতে একটা <InlineCode>runtime</InlineCode> দরকার যেটা future-গুলো
          poll করে, schedule করে, sleep handle করে। Rust নিজে কোনো runtime ship করে না — কোনটা
          ব্যবহার করবে সেটা তোমার choice (tokio, async-std, smol ইত্যাদি)। তাই{" "}
          <InlineCode>main</InlineCode>-এর কাজ runtime-কে initialize করা, তারপর সেই runtime-এ async
          code চালানো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Async function = Future-return করা function</h2>
        <p>
          Compiler-এর দৃষ্টিতে <InlineCode>async fn</InlineCode> আসলে এমন একটা function যেটা একটা{" "}
          <InlineCode>Future</InlineCode> return করে। অর্থাৎ এই দু'টো equivalent:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::future::Future;
use trpl::Html;

fn page_title(url: &str) -> impl Future<Output = Option<String>> {
    async move {
        let text = trpl::get(url).await.text().await;
        Html::parse(&text)
            .select_first("title")
            .map(|title| title.inner_html())
    }
}`}
        />
        <p>
          Body-টা একটা <InlineCode>async move</InlineCode> block-এ wrap হয়। Return type{" "}
          <InlineCode>impl Future&lt;Output = Option&lt;String&gt;&gt;</InlineCode> — অর্থাৎ এটা একটা
          future, যেটা শেষমেশ <InlineCode>Option&lt;String&gt;</InlineCode> দেবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">block_on দিয়ে runtime চালানো</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use trpl::Html;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    trpl::block_on(async {
        let url = &args[1];
        match page_title(url).await {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
    })
}

async fn page_title(url: &str) -> Option<String> {
    let response_text = trpl::get(url).await.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html())
}`}
        />
        <p>
          <InlineCode>trpl::block_on</InlineCode> একটা future নেয়, runtime চালু করে, future complete
          না হওয়া পর্যন্ত block করে। এটা synchronous কোডের সাথে async কোডের bridge।
        </p>
        <CodeBlock
          lang="text"
          code={`$ cargo run -- "https://www.rust-lang.org"
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.05s
     Running \`target/debug/async_await 'https://www.rust-lang.org'\`
The title for https://www.rust-lang.org was
            Rust Programming Language`}
        />

        <h2 class="mt-10 text-2xl font-bold">আড়ালে state machine</h2>
        <p>
          Compiler প্রতিটা <InlineCode>.await</InlineCode>-কে state machine-এর একটা state-এ পরিণত
          করে। Conceptually আমাদের <InlineCode>page_title</InlineCode>-এর জন্য enum কিছুটা এমন:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum PageTitleFuture<'a> {
    Initial { url: &'a str },
    GetAwaitPoint { url: &'a str },
    TextAwaitPoint { response: trpl::Response },
}`}
        />
        <p>
          প্রতিটা <InlineCode>.await</InlineCode> point একটা place যেখানে control runtime-কে ফিরিয়ে
          দেওয়া হয়। সাধারণ borrowing/ownership rule এখানেও apply। ভালো কথা — এই state machine compiler
          নিজেই generate করে দেয়, আমাদের লিখতে হয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">দু'টো URL-এর race</h2>
        <p>
          Async-এর আসল মজা concurrent execution-এ। দু'টো URL-এ একসাথে request পাঠাই — যেটা আগে
          response দেবে সেটাই declare করি winner:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use trpl::{Either, Html};

fn main() {
    let args: Vec<String> = std::env::args().collect();

    trpl::block_on(async {
        let title_fut_1 = page_title(&args[1]);
        let title_fut_2 = page_title(&args[2]);

        let (url, maybe_title) =
            match trpl::select(title_fut_1, title_fut_2).await {
                Either::Left(left) => left,
                Either::Right(right) => right,
            };

        println!("{url} returned first");
        match maybe_title {
            Some(title) => println!("Its page title was: '{title}'"),
            None => println!("It had no title."),
        }
    })
}

async fn page_title(url: &str) -> (&str, Option<String>) {
    let response_text = trpl::get(url).await.text().await;
    let title = Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html());
    (url, title)
}`}
        />
        <p>
          <InlineCode>trpl::select</InlineCode> দু'টো future নেয় — যেটা আগে complete হয় তার output
          return করে। Result-এর type <InlineCode>Either&lt;A, B&gt;</InlineCode> — পরিচিত enum
          pattern:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum Either<A, B> {
    Left(A),
    Right(B),
}`}
        />
        <p>
          <InlineCode>Either::Left</InlineCode> মানে first future আগে শেষ হয়েছে, Right হলে second।
          এখানে winner/loser-এর কোনো ধারণা নেই — দু'টোই legitimate result, আমরা শুধু জানতে চাই কোনটা
          আগে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Future</InlineCode> — এমন value যা পরে ready হবে; <InlineCode>async</InlineCode>{" "}
            block/function-ই future তৈরি করে।
          </li>
          <li>
            Future-গুলো <strong>lazy</strong> — <InlineCode>.await</InlineCode> না করলে কিছুই হয় না।
          </li>
          <li>
            Postfix <InlineCode>.await</InlineCode> — chaining-এর জন্য convenient; প্রতিটা await point
            runtime-এ control হস্তান্তর।
          </li>
          <li>
            <InlineCode>main</InlineCode> async হতে পারে না — runtime আলাদাভাবে launch করতে হয়।{" "}
            <InlineCode>trpl::block_on</InlineCode> সেই কাজটা করে।
          </li>
          <li>
            Compiler আড়ালে state machine generate করে — প্রতিটা await একটা state।
          </li>
          <li>
            <InlineCode>trpl::select</InlineCode> + <InlineCode>Either</InlineCode> — দু'টো future-এর
            মধ্যে যেটা আগে শেষ হয় তার response ব্যবহার।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৭.১: Future এবং Async syntax · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ async/await syntax, trpl::block_on দিয়ে runtime চালানো, state machine, এবং trpl::select দিয়ে দু'টো future-এর race।",
    },
  ],
};
