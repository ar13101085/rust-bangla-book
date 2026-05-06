import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch09-03-to-panic-or-not-to-panic";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৯.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          কখন panic! করব, কখন না
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          To panic! or Not to panic!
        </p>
        <p class="mt-3">
          এই পাঠে নীতি — কখন <InlineCode>panic!</InlineCode> করা সঠিক, কখন{" "}
          <InlineCode>Result</InlineCode> return করা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Default — Result</h2>
        <p>
          Function fail করতে পারে — তখন default choice হলো{" "}
          <InlineCode>Result</InlineCode> return করা। কারণ — panic-এ
          recover-এর কোনো সুযোগ নেই, তুমি <em>caller-এর হয়ে</em> decide করছ
          যে এটা unrecoverable। Result return করলে caller-ই বাছবে — recover
          করবে না নিজেই panic করবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কখন panic চলে — example, prototype, test</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Example code</strong> — concept demo করছ;{" "}
            <InlineCode>unwrap</InlineCode>/<InlineCode>expect</InlineCode>{" "}
            placeholder, real app-এ ভালো error handling বসবে।
          </li>
          <li>
            <strong>Prototype</strong> — পরে robust error handling add করার আগে
            quickly কাজ করানো।
          </li>
          <li>
            <strong>Test</strong> — কোনো method fail করলে test-ই fail হয়; panic
            হলো test-fail-এর mechanism।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">যখন তুমি compiler-এর চেয়ে বেশি জানো</h2>
        <p>
          কোনো logic দিয়ে নিশ্চিত — Result সবসময় Ok। কিন্তু compiler সেই
          guarantee verify করতে পারছে না। তখন <InlineCode>expect</InlineCode>{" "}
          ঠিক — এবং message-এ কারণ document করো।
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::net::IpAddr;

let home: IpAddr = "127.0.0.1"
    .parse()
    .expect("Hardcoded IP address should be valid");`}
        />
        <p>
          <InlineCode>"127.0.0.1"</InlineCode> hardcoded — valid IP, কিন্তু{" "}
          <InlineCode>parse</InlineCode> Result return করে। Compiler জানে না
          এই string সবসময় valid। <InlineCode>expect</InlineCode>-এর message-এ
          assumption লিখে রাখলাম — পরে user input থেকে এলে message দেখে বুঝবো
          robust handling দরকার।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Panic কখন appropriate</h2>
        <p>
          Code এমন <strong>bad state</strong>-এ পৌঁছেছে — এই rule-গুলোর এক বা
          একাধিক satisfy করলে panic-ই উপযুক্ত:
        </p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>
            <strong>Bad state unexpected</strong> — মাঝে মাঝে হবে এমন কিছু না
            (যেমন user wrong format-এ data দিল — সেটা expected)।
          </li>
          <li>
            <strong>পরের code এই state-এ relying করতে চায় না</strong> — প্রতি
            step-এ check করার চেয়ে এক জায়গায় enforce করা ভালো।
          </li>
          <li>
            <strong>Type-এ encode করার ভালো উপায় নেই</strong>।
          </li>
        </ol>

        <h3 class="mt-6 text-xl font-bold">Library design</h3>
        <p>
          User তোমার library-কে invalid value দিলে — Result দাও, user
          decide করুক। কিন্তু value invalid হলে continuing insecure বা
          harmful হবে — তখন <InlineCode>panic!</InlineCode> দিয়ে programmer-কে
          alert করো (এটা তাদের bug)।
        </p>
        <p>
          Function-এর <strong>contract</strong> (কী input valid) violate হলে
          panic — এটা caller-side bug। Document-এ contract clearly বলো।
        </p>

        <h3 class="mt-6 text-xl font-bold">Result কখন</h3>
        <p>
          Failure expected — return Result। যেমন:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Parser malformed data পেল।</li>
          <li>HTTP request rate-limit বা timeout।</li>
          <li>File না পাওয়া।</li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Type system দিয়ে validate</h2>
        <p>
          Function-এ বারবার check না করে — Rust-এর type system কাজে লাগাও।
          যেমন:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Option&lt;T&gt;</InlineCode>-এর জায়গায়{" "}
            <InlineCode>T</InlineCode> নাও — তাহলে None case handle-ই করতে
            হবে না।
          </li>
          <li>
            Negative হতে পারে না এমন কিছু — <InlineCode>i32</InlineCode>-এর
            জায়গায় <InlineCode>u32</InlineCode>।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Custom type দিয়ে validation</h2>
        <p>
          1-100-এর মধ্যে guess চাই। প্রতি function-এ check না করে — একটা type
          বানাও যাতে <em>সবসময় valid value</em>:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }

        Guess { value }
    }

    pub fn value(&self) -> i32 {
        self.value
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>value</InlineCode> field private — বাইরে থেকে set করা
            যাবে না।
          </li>
          <li>
            <InlineCode>Guess::new()</InlineCode> validation চালায়। Bypass-এর
            উপায় নেই।
          </li>
          <li>
            <InlineCode>.value()</InlineCode> getter — read access।
          </li>
        </ul>
        <p>
          এখন কোনো function <InlineCode>Guess</InlineCode> parameter নিলে আর
          range check-এর দরকার নেই — type-ই guarantee দিচ্ছে। এটাই{" "}
          <strong>"valid by construction"</strong> pattern।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Default — Result; caller-কে option দাও।
          </li>
          <li>
            Panic — example, prototype, test, contract violation, security
            risk-এ।
          </li>
          <li>
            Compiler-এর চেয়ে বেশি জানলে — <InlineCode>expect</InlineCode>{" "}
            with documenting message।
          </li>
          <li>
            Type system দিয়ে validate করো — <InlineCode>Option</InlineCode>{" "}
            বনাম <InlineCode>T</InlineCode>, <InlineCode>u32</InlineCode>{" "}
            বনাম <InlineCode>i32</InlineCode>।
          </li>
          <li>
            Validated custom type (Guess pattern) — constructor-এ check, পরে
            free use।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৯.৩: কখন panic! করব, কখন না · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ panic vs Result-এর choice, validated custom type, এবং type system দিয়ে invariant enforce।",
    },
  ],
};
