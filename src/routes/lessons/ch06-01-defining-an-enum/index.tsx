import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch06-01-defining-an-enum";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৬.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Enum define করা</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Defining an Enum</p>
        <p class="mt-3">
          Struct related field group করে। Enum বলে দেয় — একটা value কয়েকটা
          সম্ভাব্য option-এর <em>একটা</em> মাত্র। যেমন Rectangle, Circle,
          Triangle হতে পারে — কিন্তু একসাথে দু'টা না। IP address V4 হতে পারে
          বা V6 — দু'টোর কোনো একটাই। এই "একটার একটাই" property-র জন্য enum
          uniquely ভালো fit।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Basic enum syntax</h2>
        <CodeBlock
          lang="rust"
          code={`enum IpAddrKind {
    V4,
    V6,
}

fn main() {
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;

    route(IpAddrKind::V4);
    route(IpAddrKind::V6);
}

fn route(ip_kind: IpAddrKind) {}`}
        />
        <p>
          <InlineCode>V4</InlineCode> এবং <InlineCode>V6</InlineCode> হলো
          এই enum-এর <strong>variant</strong>। Variant-গুলো enum-এর নামের
          নিচে namespaced — তাই double-colon দিয়ে access:{" "}
          <InlineCode>IpAddrKind::V4</InlineCode>। এখন{" "}
          <InlineCode>route()</InlineCode> function যেকোনো{" "}
          <InlineCode>IpAddrKind</InlineCode> accept করে — সব variant একই type।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Variant-এ data রাখা</h2>
        <p>
          এতদূর শুধু "kind" রাখলাম, address-ই নেই। struct দিয়ে combine করতে
          পারতাম:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};`}
        />
        <p>কিন্তু enum-এর variant-এ সরাসরি data রাখা যায় — আরও সংক্ষিপ্ত:</p>
        <CodeBlock
          lang="rust"
          code={`enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));
let loopback = IpAddr::V6(String::from("::1"));`}
        />
        <p>
          <InlineCode>IpAddr::V4()</InlineCode> আসলে একটা constructor function
          — String নিয়ে IpAddr তৈরি করে। Rust auto-generate করে।
        </p>
        <p>
          আরেকটা সুবিধা: প্রতিটা variant-এ <em>আলাদা type ও সংখ্যক</em> data
          থাকতে পারে। যেমন V4-কে চারটা <InlineCode>u8</InlineCode> হিসেবে
          রাখা, V6-কে String হিসেবে:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));`}
        />
        <p>
          Standard library-তে আসলে এই pattern-ই আছে — variant-এর ভিতরে struct:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">বহুরকম variant — Message enum</h2>
        <CodeBlock
          lang="rust"
          code={`enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Quit</InlineCode> — কোনো data নেই।
          </li>
          <li>
            <InlineCode>Move</InlineCode> — struct-এর মতো named field।
          </li>
          <li>
            <InlineCode>Write(String)</InlineCode> — একটা String।
          </li>
          <li>
            <InlineCode>ChangeColor(i32, i32, i32)</InlineCode> — তিনটা i32।
          </li>
        </ul>
        <p>
          এই variant-গুলো আলাদা struct দিয়েও define করা যেত (
          <InlineCode>QuitMessage</InlineCode>, <InlineCode>MoveMessage</InlineCode>
          , ইত্যাদি)। কিন্তু তখন প্রতিটা আলাদা type হতো — একটা function-এ "যেকোনো
          message" নিতে পারতাম না। Enum সবগুলোকে একই type-এ রাখে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Enum-এর method</h2>
        <p>Struct-এর মতো enum-এও <InlineCode>impl</InlineCode> দিয়ে method:</p>
        <CodeBlock
          lang="rust"
          code={`impl Message {
    fn call(&self) {
        // method body would be defined here
    }
}

let m = Message::Write(String::from("hello"));
m.call();`}
        />

        <h2 class="mt-10 text-2xl font-bold">Option enum — null-এর সমাধান</h2>
        <p>
          Rust-এ <InlineCode>null</InlineCode> নেই। এটা deliberate design
          decision। Tony Hoare (যিনি ১৯৬৫ সালে null-এর ধারণা চালু করেছিলেন)
          ২০০৯-এ বলেছিলেন:
        </p>
        <blockquote class="ml-6 border-l-4 border-[var(--border)] pl-4 italic text-[var(--muted-foreground)]">
          "I call it my billion-dollar mistake... Innumerable errors,
          vulnerabilities, and system crashes have probably caused a billion
          dollars of pain and damage in the last forty years."
        </blockquote>
        <p>
          সমস্যা — null-যুক্ত language-এ যেকোনো variable null হতে পারে; কিন্তু
          কোনটা হতে পারে আর কোনটা হতে পারে না — type system দিয়ে বোঝা যায় না।
          ফলে সারাদিন <InlineCode>NullPointerException</InlineCode>।
        </p>
        <p>
          কিন্তু "value আছে বা নেই" — এই ধারণা তো দরকার। Rust-এ এটা enum দিয়ে
          encode করা — <InlineCode>Option&lt;T&gt;</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`enum Option<T> {
    None,
    Some(T),
}`}
        />
        <p>
          <InlineCode>Option</InlineCode> এতই common যে prelude-এ
          auto-import। <InlineCode>Some</InlineCode> ও{" "}
          <InlineCode>None</InlineCode> সরাসরি use করা যায় —{" "}
          <InlineCode>Option::</InlineCode> prefix দরকার নেই।
        </p>
        <p>
          <InlineCode>&lt;T&gt;</InlineCode> generic type parameter (Chapter
          10-এ বিস্তারিত) — Some-এ যেকোনো type-এর data রাখা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let some_number = Some(5);
    let some_char = Some('e');

    let absent_number: Option<i32> = None;
}`}
        />
        <p>
          <InlineCode>some_number</InlineCode>-এর type{" "}
          <InlineCode>Option&lt;i32&gt;</InlineCode>। কিন্তু{" "}
          <InlineCode>None</InlineCode>-এ value নেই, তাই Rust infer করতে
          পারে না — annotate করতে হয়।
        </p>

        <h3 class="mt-6 text-xl font-bold">Option&lt;T&gt; কেন better than null?</h3>
        <p>
          কারণ — <InlineCode>Option&lt;T&gt;</InlineCode> এবং{" "}
          <InlineCode>T</InlineCode> ভিন্ন type। তাই Rust তোমাকে{" "}
          <InlineCode>Option&lt;T&gt;</InlineCode>-কে সরাসরি{" "}
          <InlineCode>T</InlineCode>-র মতো use করতে দেবে না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x: i8 = 5;
    let y: Option<i8> = Some(5);

    let sum = x + y;
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: cannot add \`Option<i8>\` to \`i8\`
 --> src/main.rs:5:17
  |
5 |     let sum = x + y;
  |                 ^ no implementation for \`i8 + Option<i8>\``}
        />
        <p>
          মানে — যখন তোমার hand-এ একটা <InlineCode>i8</InlineCode>, Rust
          guarantee দিচ্ছে এটা valid। null check-এর দরকার নেই। শুধু{" "}
          <InlineCode>Option&lt;i8&gt;</InlineCode>-এ পেলেই handle করতে হবে —
          এবং compiler force করবে handle করতে।
        </p>
        <p>
          <InlineCode>Some</InlineCode> থেকে value বের করতে হলে{" "}
          <InlineCode>match</InlineCode> দিয়ে দু'টো case (Some এবং None) দু'টোই
          handle করতে হয়। সেটাই পরের পাঠের বিষয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>enum</InlineCode> — কয়েকটা variant, value সবসময় একটা।
          </li>
          <li>
            Variant-এ data attach করা যায় — আলাদা variant-এ আলাদা shape।
          </li>
          <li>
            Variant-এর নাম-ই constructor function;{" "}
            <InlineCode>impl</InlineCode> দিয়ে method।
          </li>
          <li>
            <InlineCode>Option&lt;T&gt;</InlineCode> = <InlineCode>Some(T)</InlineCode>{" "}
            বা <InlineCode>None</InlineCode> — null-এর type-safe বিকল্প।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৬.১: Enum define করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ enum, variant-এ data attach, Message enum, এবং null-এর বদলে Option<T>।",
    },
  ],
};
