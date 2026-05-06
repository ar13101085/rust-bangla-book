import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch08-03-hash-maps";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৮.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Hash Map-এ key এবং value রাখা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Storing Keys with Associated Values in Hash Maps
        </p>
        <p class="mt-3">
          <InlineCode>HashMap&lt;K, V&gt;</InlineCode> key-value pair রাখে —
          hashing function ব্যবহার করে। Vector-এ index দিয়ে access, hash map-এ{" "}
          <em>key</em> দিয়ে। অন্য language-এ এটা dictionary, map, hash, বা
          object।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">তৈরি ও insert</h2>
        <p>
          <InlineCode>HashMap</InlineCode> prelude-এ নেই — explicitly import:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);`}
        />
        <p>
          Vector-এর মতো heap-এ থাকে, homogeneous — সব key এক type, সব value এক
          type।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Value access — get</h2>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name).copied().unwrap_or(0);`}
        />
        <p>
          <InlineCode>.get()</InlineCode> <InlineCode>Option&lt;&V&gt;</InlineCode>{" "}
          return করে — key না থাকলে <InlineCode>None</InlineCode>।{" "}
          <InlineCode>.copied()</InlineCode> <InlineCode>Option&lt;&i32&gt;</InlineCode>
          -কে <InlineCode>Option&lt;i32&gt;</InlineCode>-এ convert করে;{" "}
          <InlineCode>.unwrap_or(0)</InlineCode> <InlineCode>None</InlineCode>{" "}
          হলে 0 দেয়।
        </p>

        <h3 class="mt-6 text-xl font-bold">Iterate</h3>
        <CodeBlock
          lang="rust"
          code={`for (key, value) in &scores {
    println!("{key}: {value}");
}`}
        />
        <p>Order arbitrary — প্রতিবার চালালে আলাদা হতে পারে।</p>

        <h2 class="mt-10 text-2xl font-bold">Ownership</h2>
        <p>
          Copy type (i32 ইত্যাদি) — value copy। Owned type (String) — move:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// field_name and field_value are invalid at this point`}
        />
        <p>
          Insert-এর পর map-ই owner; original variable use করা যাবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Update — তিন strategy</h2>

        <h3 class="mt-6 text-xl font-bold">১. Overwrite</h3>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

println!("{scores:?}"); // {"Blue": 25}`}
        />
        <p>
          একই key-এ দ্বিতীয়বার <InlineCode>insert</InlineCode> পুরোনো value
          replace করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">২. Insert only-if-absent — entry API</h3>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);

println!("{scores:?}"); // {"Yellow": 50, "Blue": 10}`}
        />
        <p>
          <InlineCode>.entry(key).or_insert(value)</InlineCode> — key-এর জন্য
          entry-র mutable reference return করে। Key থাকলে existing value-র
          reference, না থাকলে value insert করে নতুন reference।
        </p>

        <h3 class="mt-6 text-xl font-bold">৩. পুরোনো value-এর উপর ভিত্তি করে update</h3>
        <p>Word counter — classic example:</p>
        <CodeBlock
          lang="rust"
          code={`use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{map:?}"); // {"world": 2, "hello": 1, "wonderful": 1}`}
        />
        <p>
          <InlineCode>or_insert(0)</InlineCode> মুতাবিক value-র{" "}
          <InlineCode>&mut V</InlineCode> ফেরত পাই —{" "}
          <InlineCode>*count</InlineCode> দিয়ে dereference করে increment।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Hashing function</h2>
        <p>
          Default-এ HashMap <strong>SipHash</strong> ব্যবহার করে — DoS attack
          (hash collision deliberately তৈরি করার চেষ্টা) থেকে protect করে।
          সবচেয়ে fast না, কিন্তু security trade-off worth।
        </p>
        <p>
          অন্য hasher চাইলে — <InlineCode>BuildHasher</InlineCode> trait
          implement-করা type ব্যবহার করতে হবে। crates.io-এ alternative library
          আছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>use std::collections::HashMap</InlineCode> দরকার;{" "}
            <InlineCode>HashMap::new()</InlineCode> দিয়ে create।
          </li>
          <li>
            <InlineCode>.insert(k, v)</InlineCode> add/overwrite;{" "}
            <InlineCode>.get(&k)</InlineCode> Option return।
          </li>
          <li>
            String-এর মতো owned key/value insert করলে ownership map-এ চলে যায়।
          </li>
          <li>
            <InlineCode>.entry(k).or_insert(default)</InlineCode> —
            absent-only insert + mutable reference।
          </li>
          <li>
            <InlineCode>*count += 1</InlineCode> pattern — counter ও
            update-by-old-value।
          </li>
          <li>Default hasher SipHash, swap-able।</li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৮.৩: Hash Map-এ key এবং value রাখা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ HashMap তৈরি, insert/get, ownership semantics, এবং entry API দিয়ে updates।",
    },
  ],
};
