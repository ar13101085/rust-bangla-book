import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch04-01-what-is-ownership";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৪.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Ownership কী?</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">What Is Ownership?</p>
        <p class="mt-3">
          <strong>Ownership</strong> Rust-এর সবচেয়ে নিজস্ব এবং সবচেয়ে
          গুরুত্বপূর্ণ feature। এটা এমন একটা rule-set, যেটা নির্ধারণ করে
          program-এর memory কখন allocate হবে আর কখন free হবে — এবং compiler
          এই rule-গুলো compile time-এ enforce করে। Rule break হলে program
          compile-ই হবে না। Runtime overhead নেই — সব কাজ compile time-এ।
        </p>
        <p class="mt-3">
          অন্য language-এর সাথে compare করলে — JavaScript, Python, Go-তে
          garbage collector memory free করে; C, C++-এ programmer-কেই hand-এ
          allocate এবং free করতে হয়। Rust-এর approach একটা <em>তৃতীয়
          পথ</em>: ownership system, যেটা GC ছাড়াই memory safety দেয়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Stack এবং Heap</h2>
        <p>
          Ownership বুঝতে হলে আগে stack ও heap বুঝতে হবে — Rust এই দুই memory
          area-কে আলাদাভাবে manage করে।
        </p>
        <h3 class="mt-4 text-lg font-bold">Stack — দ্রুত, নিয়মিত</h3>
        <p>
          Stack data add করে এবং remove করে <strong>LIFO</strong>{" "}
          (Last-In-First-Out) order-এ — থালার stack-এর মতো, উপর থেকে নাও,
          উপরে রাখো। Add করাকে বলে <em>push</em>, remove করাকে <em>pop</em>।
        </p>
        <p>
          Stack-এ data রাখতে হলে compile time-এ size জানা থাকতে হবে। Push করা
          fast — allocator কোথায় রাখবে সেটা খুঁজতে হয় না, top-এই বসায়।
        </p>
        <h3 class="mt-4 text-lg font-bold">Heap — flexible, slow</h3>
        <p>
          যেসব data-এর size compile-time-এ অজানা, বা যেগুলো পরে বাড়তে/কমতে
          পারে — সেগুলো heap-এ থাকে। Heap-এ allocate করতে allocator যথেষ্ট
          জায়গা খুঁজে, mark করে, এবং একটা <strong>pointer</strong> (address)
          return করে। সেই pointer (যার size fixed) stack-এ store করা যায়।
        </p>
        <p>
          Heap-এ allocate করা stack-এ push-এর চেয়ে slow। Access-ও slow,
          কারণ pointer follow করে heap-এ যেতে হয়। Modern processor cache-এ
          কাছাকাছি data থাকলে fast — তাই memory-তে ছিটানো access slow।
        </p>
        <p>
          <em>Restaurant analogy:</em> তুমি ৪ জন নিয়ে restaurant-এ ঢুকলে — host
          সবার বসার মতো একটা table খুঁজে দেখায়। কেউ দেরি করে এলে host-কে
          জিজ্ঞেস করে কোথায় বসেছ। allocator-ও এভাবে কাজ করে।
        </p>
        <p>
          Function call হলে — argument-গুলো (যেগুলোর মধ্যে heap-data-এর
          pointer-ও থাকতে পারে) এবং local variable-গুলো stack-এ push হয়।
          Function শেষ হলে সেগুলো pop হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Ownership-এর তিনটি rule</h2>
        <p>
          এই তিনটি rule মাথায় রেখে নিচের example-গুলো দেখো:
        </p>
        <ol class="ml-6 list-decimal space-y-1">
          <li>
            Rust-এ প্রতিটি value-এর একটি <strong>owner</strong> থাকে।
          </li>
          <li>একই সময়ে কেবল একজন owner-ই থাকতে পারে।</li>
          <li>
            Owner scope-এর বাইরে চলে গেলে value <em>drop</em> হয় (মানে memory
            free হয়)।
          </li>
        </ol>

        <h2 class="mt-10 text-2xl font-bold">Variable scope</h2>
        <p>
          <strong>Scope</strong> হলো যেই block-এর মধ্যে variable valid:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    {                      // s is not valid here, since it's not yet declared
        let s = "hello";   // s is valid from this point forward

        // do stuff with s
    }                      // this scope is now over, and s is no longer valid
}`}
        />
        <p>
          দুটো গুরুত্বপূর্ণ মুহূর্ত — <InlineCode>s</InlineCode> declare হলে
          valid হয়; scope-এর শেষে invalid হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">String type</h2>
        <p>
          Ownership-এর rule দেখাতে integer-এর মতো simple type যথেষ্ট না।{" "}
          <InlineCode>String</InlineCode> use করব — heap-এ থাকা একটা complex
          type।
        </p>
        <p>
          আগেও আমরা string literal দেখেছি: <InlineCode>"hello"</InlineCode>।
          কিন্তু literal hardcoded — runtime-এ change করা যায় না, এবং
          compile-time-এ size জানা। User-input বা runtime-এ generate হওয়া
          text-এর জন্য এটা যথেষ্ট না।
        </p>
        <p>
          এর বিকল্প — <InlineCode>String</InlineCode> type। Heap-এ data রাখে,
          size unknown বা changeable হতে পারে:
        </p>
        <CodeBlock lang="rust" code={`let s = String::from("hello");`} />
        <p>
          <InlineCode>::</InlineCode> দিয়ে namespace করা — এই{" "}
          <InlineCode>from</InlineCode> function-টা <InlineCode>String</InlineCode>
          {" "}type-এর।
        </p>
        <p>String mutate করা যায়:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");

    s.push_str(", world!"); // push_str() appends a literal to a String

    println!("{s}"); // this will print \`hello, world!\`
}`}
        />
        <p>
          কিন্তু literal mutate করা যায় না। তফাৎটা memory-management-এ —
          সেটাই এই অধ্যায়ের মূল বিষয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Memory এবং allocation</h2>
        <p>
          String literal-এর content compile-time-এ জানা — তাই সরাসরি
          executable-এ hardcoded হয়। দ্রুত, efficient। কিন্তু runtime-এ size
          বদলায় বা unknown — এমন data এভাবে রাখা যাবে না।
        </p>
        <p>
          <InlineCode>String</InlineCode>-এর জন্য — runtime-এ heap-এ memory
          allocate করতে হয়। দুটো জিনিস জরুরি:
        </p>
        <ol class="ml-6 list-decimal space-y-1">
          <li>Runtime-এ allocator-এর কাছ থেকে memory request করা।</li>
          <li>কাজ শেষ হলে সেটা allocator-কে ফেরত দেওয়া।</li>
        </ol>
        <p>
          প্রথমটা সব language-ই করে — <InlineCode>String::from</InlineCode>{" "}
          ভেতরে allocate করছে।
        </p>
        <p>দ্বিতীয়টায় language-গুলো ভিন্ন:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>GC-যুক্ত language</strong> (Java, Go, JS): GC unused memory
            track করে, automatic free করে।
          </li>
          <li>
            <strong>GC ছাড়া language</strong> (C, C++): programmer-কে নিজে
            free করতে হয়। ভুললে memory leak; খুব আগে free করলে invalid
            pointer; দু'বার free করলে undefined behavior।
          </li>
        </ul>
        <p>
          <strong>Rust-এর পথ:</strong> যে variable value-টার মালিক, সে scope-এর
          বাইরে গেলে memory automatic ফেরত যায়। উদাহরণ:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    {
        let s = String::from("hello"); // s is valid from this point forward

        // do stuff with s
    }                                  // this scope is now over, and s is no
                                       // longer valid
}`}
        />
        <p>
          Scope-এর শেষে Rust automatic একটা special function call করে —{" "}
          <InlineCode>drop</InlineCode>।{" "}
          <InlineCode>String</InlineCode>-এর author এই{" "}
          <InlineCode>drop</InlineCode>-এ memory release-এর কোড লিখেছেন।
          Closing curly bracket-এ এটা automatic চলে।
        </p>
        <p>
          C++-এ এটাকে <strong>RAII</strong> (Resource Acquisition Is
          Initialization) বলে। Rust-এর approach সেটারই variant — কিন্তু
          compiler-এর enforcement-এর সাথে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Variable এবং data interact — Move</h2>

        <h3 class="mt-4 text-lg font-bold">Integer — copy</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;
    let y = x;
}`}
        />
        <p>
          এখানে <InlineCode>x</InlineCode>-এর value ৫,{" "}
          <InlineCode>y</InlineCode>-এর-ও ৫। দুটো আলাদা variable, দু'জনই
          stack-এ। Integer-এর size known এবং fixed, তাই copy quick।
        </p>

        <h3 class="mt-4 text-lg font-bold">String — কী হয়?</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
}`}
        />
        <p>
          দেখতে integer-এর মতোই — কিন্তু আসলে অন্য কিছু হয়। বুঝতে গেলে আগে দেখি{" "}
          <InlineCode>String</InlineCode> ভিতরে কী।
        </p>
        <p>
          একটা <InlineCode>String</InlineCode> তিনটি জিনিসের সমষ্টি (stack-এ
          রাখা):
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            একটা <strong>pointer</strong> — heap-এ যেখানে আসল content আছে।
          </li>
          <li>
            <strong>length</strong> — content কত byte ব্যবহার করছে।
          </li>
          <li>
            <strong>capacity</strong> — heap-এ allocate-করা মোট জায়গা।
          </li>
        </ul>
        <p>আর হিপ-এ থাকে আসল characters: h, e, l, l, o।</p>
        <p>
          <InlineCode>let s2 = s1;</InlineCode> করলে — stack-এর তিনটি জিনিস
          (pointer, length, capacity) copy হয়। কিন্তু heap-এর data{" "}
          <em>copy হয় না</em>। অর্থাৎ, এখন <InlineCode>s1</InlineCode> এবং{" "}
          <InlineCode>s2</InlineCode> দু'জনেই একই heap memory-তে point করছে।
        </p>
        <p>
          এটা যদি pure shallow copy হতো — সমস্যা: scope শেষ হলে দু'জনই একই
          memory free করতে চাইবে। এটাকে বলে <strong>double free</strong>{" "}
          error — memory corruption, security risk।
        </p>
        <p>
          Rust-এর সমাধান: <InlineCode>let s2 = s1;</InlineCode>-এর পর{" "}
          <InlineCode>s1</InlineCode>-কে invalidate করে দেয় — এখন{" "}
          <InlineCode>s1</InlineCode> ব্যবহার করা যাবে না। শুধু{" "}
          <InlineCode>s2</InlineCode>-ই scope শেষে drop হবে।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("hello");
    let s2 = s1;

    println!("{s1}, world!");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0382]: borrow of moved value: \`s1\`
 --> src/main.rs:5:16
  |
2 |     let s1 = String::from("hello");
  |         -- move occurs because \`s1\` has type \`String\`, which does not implement the \`Copy\` trait
3 |     let s2 = s1;
  |              -- value moved here
4 |
5 |     println!("{s1}, world!");
  |                ^^ value borrowed here after move`}
        />
        <p>
          Compiler বলছে — <InlineCode>s1</InlineCode> "moved" হয়ে গেছে।
          Shallow copy-এর সাথে invalidate-এর combination — Rust-এ এটাকে{" "}
          <strong>move</strong> বলে। বলা হয়,{" "}
          <em>"s1 was moved into s2"</em>।
        </p>
        <p>
          Rust কখনো automatic deep copy করে না — এই design-এ কোনো হিডেন cost
          নেই। Automatic যা হয়, সব cheap।
        </p>

        <h3 class="mt-6 text-lg font-bold">নতুন value assign — পুরোনোটা drop</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello");
    s = String::from("ahoy");

    println!("{s}, world!");
}`}
        />
        <p>
          নতুন <InlineCode>String</InlineCode>{" "}
          <InlineCode>s</InlineCode>-এ assign হলে পুরোনো{" "}
          <InlineCode>"hello"</InlineCode>-এর দিকে আর কেউ point করছে না — Rust
          সেই মুহূর্তেই drop করে দেয়, scope-এর শেষ পর্যন্ত অপেক্ষা করে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Clone — explicit deep copy</h2>
        <p>
          Heap-data-ও copy করতে চাইলে — <InlineCode>.clone()</InlineCode> method
          use করো:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();

    println!("s1 = {s1}, s2 = {s2}");
}`}
        />
        <p>
          এখানে heap-এ আসল data-ও copy হয়েছে — দুটো আলাদা allocation।{" "}
          <InlineCode>s1</InlineCode> এখনো valid। কিন্তু{" "}
          <InlineCode>clone()</InlineCode> দেখলেই বুঝবে — কিছু expensive কাজ
          হচ্ছে। এটা একটা visual indicator।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Stack-only data — Copy trait</h2>
        <p>
          Integer-এর সাথে ফিরে আসি:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;
    let y = x;

    println!("x = {x}, y = {y}");
}`}
        />
        <p>
          এখানে <InlineCode>clone()</InlineCode> ছাড়াই{" "}
          <InlineCode>x</InlineCode> valid রয়ে গেল। কারণ — integer পুরোপুরি
          stack-এ থাকে, এর deep/shallow copy বলে আলাদা কিছু নেই, copy trivial।
        </p>
        <p>
          Rust-এ এই behavior-এর জন্য একটা <strong>Copy trait</strong> আছে।
          Type যদি Copy implement করে, assignment-এ move না হয়ে copy হবে। মূল
          variable valid থাকে।
        </p>
        <p>
          কোন type Copy implement করে?
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>সব integer type — <InlineCode>u32</InlineCode>, ইত্যাদি।</li>
          <li>
            <InlineCode>bool</InlineCode> — <InlineCode>true</InlineCode>,{" "}
            <InlineCode>false</InlineCode>।
          </li>
          <li>সব floating-point type — <InlineCode>f64</InlineCode>, ইত্যাদি।</li>
          <li><InlineCode>char</InlineCode>।</li>
          <li>
            Tuple — যদি ভিতরের সব type Copy হয়। যেমন{" "}
            <InlineCode>(i32, i32)</InlineCode> Copy, কিন্তু{" "}
            <InlineCode>(i32, String)</InlineCode> না।
          </li>
        </ul>
        <p>
          Rule of thumb: যেসব type allocation-এর প্রয়োজন হয় না বা কোনো resource
          না, তারাই Copy।
        </p>
        <p>
          (Note: Type-এ <InlineCode>Drop</InlineCode> implement থাকলে Copy
          implement করা যাবে না।)
        </p>

        <h2 class="mt-10 text-2xl font-bold">Function call-এ ownership</h2>
        <p>
          Variable-কে function-এ pass করা — assignment-এর মতোই। Move হবে অথবা
          copy হবে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let s = String::from("hello");  // s comes into scope

    takes_ownership(s);             // s's value moves into the function...
                                    // ... and so is no longer valid here

    let x = 5;                      // x comes into scope

    makes_copy(x);                  // Because i32 implements the Copy trait,
                                    // x does NOT move into the function,
                                    // so it's okay to use x afterward.

} // Here, x goes out of scope, then s. However, because s's value was moved,
  // nothing special happens.

fn takes_ownership(some_string: String) { // some_string comes into scope
    println!("{some_string}");
} // Here, some_string goes out of scope and \`drop\` is called. The backing
  // memory is freed.

fn makes_copy(some_integer: i32) { // some_integer comes into scope
    println!("{some_integer}");
} // Here, some_integer goes out of scope. Nothing special happens.`}
        />
        <p>
          <InlineCode>takes_ownership(s)</InlineCode> call-এর পর{" "}
          <InlineCode>s</InlineCode> ব্যবহার করতে চাইলে compile-error।{" "}
          <InlineCode>x</InlineCode> Copy, তাই{" "}
          <InlineCode>makes_copy(x)</InlineCode>-এর পরও use করা যাবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Return value — ownership transfer</h2>
        <p>Function থেকে return করলেও ownership transfer হয়:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let s1 = gives_ownership();        // gives_ownership moves its return
                                       // value into s1

    let s2 = String::from("hello");    // s2 comes into scope

    let s3 = takes_and_gives_back(s2); // s2 is moved into
                                       // takes_and_gives_back, which also
                                       // moves its return value into s3
} // Here, s3 goes out of scope and is dropped. s2 was moved, so nothing
  // happens. s1 goes out of scope and is dropped.

fn gives_ownership() -> String {
    let some_string = String::from("yours");
    some_string
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string
}`}
        />

        <h3 class="mt-6 text-lg font-bold">এর সমস্যা</h3>
        <p>
          লক্ষ্য করো — কোনো function-কে value use করিয়ে আবার ব্যবহার করতে
          চাইলে সবসময় ownership ফেরত pass করতে হচ্ছে। Tedious! Tuple দিয়ে
          length-ও একসাথে return করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s1 = String::from("hello");

    let (s2, len) = calculate_length(s1);

    println!("The length of '{s2}' is {len}.");
}

fn calculate_length(s: String) -> (String, usize) {
    let length = s.len(); // len() returns the length of a String

    (s, length)
}`}
        />
        <p>
          কিন্তু এটা একটা common pattern-এর জন্য অনেক ceremony। এর সমাধান —{" "}
          <strong>reference</strong>। পরের পাঠে দেখব।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Stack — fixed-size, LIFO, fast। Heap — flexible-size, pointer
            থাকে, slower।
          </li>
          <li>
            Ownership-এর তিন rule — প্রতিটা value-র একজন owner; একজনই owner;
            owner scope-এ না থাকলে value drop।
          </li>
          <li>
            <InlineCode>String</InlineCode> heap-এ থাকে; pointer + length +
            capacity stack-এ।
          </li>
          <li>
            <InlineCode>let s2 = s1;</InlineCode> — String <strong>move</strong>{" "}
            করে; s1 invalid। Integer <strong>copy</strong> হয় (Copy trait)।
          </li>
          <li>
            <InlineCode>.clone()</InlineCode> দিয়ে explicit deep copy
            (expensive)।
          </li>
          <li>
            Function call ও return-ও ownership move/copy করে — পরের পাঠে
            reference দিয়ে এর সমাধান।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৪.১: Ownership কী? · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর ownership system — stack/heap, move semantics, Copy trait, এবং function call-এ ownership transfer।",
    },
  ],
};
