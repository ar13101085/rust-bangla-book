import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch20-04-advanced-functions-and-closures";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২০.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Advanced Function এবং Closure
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Advanced Functions and Closures
        </p>
        <p class="mt-3">
          Function-কে argument-এ পাস করার সময় closure-এর পাশাপাশি regular
          function-ও দেওয়া যায় — সেটার type <InlineCode>fn</InlineCode> (lower
          case f), যাকে বলে <strong>function pointer</strong>। আবার function
          থেকে closure return করতে কিছু বিশেষ কৌশল লাগে। দু'টোই দেখব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Function pointer</h2>
        <p>
          <InlineCode>fn</InlineCode> type — closure trait{" "}
          <InlineCode>Fn</InlineCode>-এর সাথে গুলিয়ো না। Function-গুলো{" "}
          <InlineCode>fn</InlineCode> type-এ coerce হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
    f(arg) + f(arg)
}

fn main() {
    let answer = do_twice(add_one, 5);

    println!("The answer is: {answer}");
}`}
        />
        <p>
          Output: <InlineCode>The answer is: 12</InlineCode>। এখানে{" "}
          <InlineCode>f: fn(i32) -&gt; i32</InlineCode> — মানে এমন একটা function
          pointer যা i32 নেয় ও i32 return করে। Closure-এর মতো generic-এ trait
          bound লাগে না; <InlineCode>fn</InlineCode> নিজেই concrete type।
        </p>
        <p>
          Function pointer তিনটা closure trait-এর প্রতিটাই (<InlineCode>Fn</InlineCode>,
          <InlineCode>FnMut</InlineCode>, <InlineCode>FnOnce</InlineCode>)
          implement করে। তাই closure-আশা-করা function-এ function pointer পাস
          করা যায়। Best practice — generic বানিয়ে closure trait bound দাও,
          তাহলে user দু'টোই দিতে পারবে।
        </p>
        <p>
          যেখানে শুধু <InlineCode>fn</InlineCode> চাই (closure না) — C-র মতো
          language-এর সাথে interop। C-তে closure নেই।
        </p>

        <h3 class="mt-6 text-xl font-bold">
          Iterator method-এর সাথে
        </h3>
        <p>Closure-এ:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let list_of_numbers = vec![1, 2, 3];
    let list_of_strings: Vec<String> =
        list_of_numbers.iter().map(|i| i.to_string()).collect();
}`}
        />
        <p>সরাসরি function name দিলেও কাজ করে:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let list_of_numbers = vec![1, 2, 3];
    let list_of_strings: Vec<String> =
        list_of_numbers.iter().map(ToString::to_string).collect();
}`}
        />
        <p>
          Fully qualified syntax লাগছে কারণ একাধিক{" "}
          <InlineCode>to_string</InlineCode> থাকতে পারে। এখানে{" "}
          <InlineCode>ToString</InlineCode> trait-এর-টা — যেটা যেকোনো{" "}
          <InlineCode>Display</InlineCode>-এ blanket implementation দিয়ে
          available।
        </p>

        <h3 class="mt-6 text-xl font-bold">Enum initializer-ও function pointer</h3>
        <p>
          Tuple-variant-এর enum-এ variant name আসলে initializer function। এটাও
          closure-যেখানে চাই, ব্যবহার করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    enum Status {
        Value(u32),
        Stop,
    }

    let list_of_statuses: Vec<Status> = (0u32..20).map(Status::Value).collect();
}`}
        />
        <p>
          0 থেকে 19 প্রতিটা u32-কে <InlineCode>Status::Value</InlineCode>{" "}
          variant-এ wrap। দু'টো style-ই (closure বা initializer function) একই
          code-এ compile হয় — যেটা পরিষ্কার লাগে সেটাই ব্যবহার করো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Closure return করা</h2>
        <p>
          Closure trait দিয়ে represent — সরাসরি return করা যায় না।
          Function-এর মতো concrete type ও নেই (একটা closure নিজেই unique
          type)। সমাধান — <InlineCode>impl Trait</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn returns_closure() -> impl Fn(i32) -> i32 {
    |x| x + 1
}`}
        />
        <p>
          কিন্তু একই signature-এর একাধিক closure return করতে গেলে — সমস্যা।
          কারণ প্রতিটা closure আলাদা concrete type:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> impl Fn(i32) -> i32 {
    |x| x + 1
}

fn returns_initialized_closure(init: i32) -> impl Fn(i32) -> i32 {
    move |x| x + init
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
  --> src/main.rs:2:44
   |
 2 |     let handlers = vec![returns_closure(), returns_initialized_closure(123)];
   |                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected opaque type, found a different opaque type
   |
   = note: distinct uses of \`impl Trait\` result in different opaque types`}
        />
        <p>
          <InlineCode>impl Fn</InlineCode> প্রতিবার একটা <em>opaque type</em>{" "}
          তৈরি করে — দু'জায়গার opaque type same না।
        </p>

        <h3 class="mt-6 text-xl font-bold">Trait object-এ সমাধান</h3>
        <p>
          <InlineCode>Box&lt;dyn Fn(...) -&gt; ...&gt;</InlineCode> ব্যবহার করো —
          সব closure একই trait object type-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}

fn returns_initialized_closure(init: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |x| x + init)
}`}
        />
        <p>
          এখন vector-এ একই type-এর closure storage সম্ভব। দাম — heap allocation
          ও dynamic dispatch।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>fn</InlineCode> type — function pointer; closure trait{" "}
            <InlineCode>Fn</InlineCode>-এর সাথে গুলিও না।
          </li>
          <li>
            Function pointer তিনটা closure trait-ই implement করে — তাই
            closure-আশা-করা জায়গায় ব্যবহারযোগ্য।
          </li>
          <li>
            Enum tuple-variant-এর initializer function — function pointer
            হিসেবে যেমন <InlineCode>Status::Value</InlineCode>।
          </li>
          <li>
            Closure return — সিম্পল ক্ষেত্রে{" "}
            <InlineCode>impl Fn(...) -&gt; ...</InlineCode>।
          </li>
          <li>
            একাধিক closure এক collection-এ —{" "}
            <InlineCode>Box&lt;dyn Fn(...) -&gt; ...&gt;</InlineCode> trait
            object।
          </li>
          <li>
            FFI-জাতীয় কাজে — যেখানে অন্য language-এ closure নেই — শুধু{" "}
            <InlineCode>fn</InlineCode> type accept করো।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২০.৪: Advanced Function এবং Closure · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ function pointer (fn type), enum initializer, closure return ও trait object।",
    },
  ],
};
