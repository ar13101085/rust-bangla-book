import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch05-01-defining-structs";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৫.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Struct define এবং তৈরি করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Defining and Instantiating Structs
        </p>
        <p class="mt-3">
          <strong>Struct</strong> tuple-এর মতো — একাধিক value এক group-এ রাখে।
          কিন্তু tuple-এ position দিয়ে access (<InlineCode>.0</InlineCode>,{" "}
          <InlineCode>.1</InlineCode>), struct-এ প্রতিটা data-র{" "}
          <em>নাম</em> থাকে — তাই order মনে রাখতে হয় না, code-ও পড়তে সহজ।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Struct define করা</h2>
        <p>
          <InlineCode>struct</InlineCode> keyword + নাম + curly bracket-এ
          field-এর নাম ও type:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Instance তৈরি করা</h2>
        <p>
          Struct-এর নাম + curly bracket-এ <InlineCode>key: value</InlineCode>{" "}
          pair। Field-এর order definition-এর সাথে মিলতে হবে না — নাম দিয়েই
          identify হচ্ছে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };
}`}
        />
        <p>
          Field access dot notation দিয়ে — <InlineCode>user1.email</InlineCode>।
          Modify করতে হলে instance-টা mutable হতে হবে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };

    user1.email = String::from("anotheremail@example.com");
}`}
        />
        <p>
          লক্ষ্য করো — Rust-এ শুধু কিছু field-কে mutable mark করা যায় না।
          পুরো instance mutable, না হলে নয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Function থেকে instance return</h2>
        <CodeBlock
          lang="rust"
          code={`fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username: username,
        email: email,
        sign_in_count: 1,
    }
}`}
        />
        <p>Function-এর শেষ expression হিসেবে instance — implicit return।</p>

        <h2 class="mt-10 text-2xl font-bold">Field init shorthand</h2>
        <p>
          Parameter আর field-এর নাম একই হলে repeat না করে shorthand লেখা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Struct update syntax</h2>
        <p>
          এক instance থেকে কয়েকটা field পরিবর্তন করে নতুন instance —{" "}
          <InlineCode>..</InlineCode> syntax:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
}`}
        />
        <p>
          <InlineCode>..user1</InlineCode> সবশেষে — বাকি field-গুলো{" "}
          <InlineCode>user1</InlineCode> থেকে নিতে বলছে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Move হয়, copy না</h3>
        <p>
          <InlineCode>=</InlineCode>-এর মতো কাজ করে — যেখানে যেগুলো heap data
          (<InlineCode>String</InlineCode>) সেগুলো <em>move</em> হয়। উদাহরণে{" "}
          <InlineCode>user1.username</InlineCode>{" "}
          <InlineCode>user2</InlineCode>-এ move হয়েছে; এরপর{" "}
          <InlineCode>user1</InlineCode> পুরোটা use করা যাবে না।
        </p>
        <p>
          কিন্তু যদি <InlineCode>email</InlineCode> এবং{" "}
          <InlineCode>username</InlineCode> দুটোই নতুন দিতাম, শুধু{" "}
          <InlineCode>active</InlineCode> ও <InlineCode>sign_in_count</InlineCode>{" "}
          (Copy types) <InlineCode>user1</InlineCode> থেকে আসত — তাহলে{" "}
          <InlineCode>user1</InlineCode> still valid থাকত।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Tuple struct</h2>
        <p>
          নাম থাকে, কিন্তু field-এর নাম থাকে না — শুধু type। Tuple-কে নাম এবং
          distinct type দিতে চাইলে:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
}`}
        />
        <p>
          <InlineCode>black</InlineCode> এবং <InlineCode>origin</InlineCode>{" "}
          আলাদা type — content same হলেও। <InlineCode>Color</InlineCode>{" "}
          expect-করা function <InlineCode>Point</InlineCode> accept করবে না।
        </p>
        <p>Destructure আর index access:</p>
        <CodeBlock
          lang="rust"
          code={`let Point(x, y, z) = origin;
let first = origin.0;`}
        />

        <h2 class="mt-10 text-2xl font-bold">Unit-like struct</h2>
        <p>
          একদমই কোনো field নেই — শুধু trait implement করার জন্য type চাই, এমন
          ক্ষেত্রে:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}`}
        />
        <p>
          Curly bracket বা parenthesis কিছুই লাগে না — শুধু নাম। Trait
          (Chapter 10)-এ এর use case পরিষ্কার হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কেন String, &str না?</h2>
        <p>
          <InlineCode>User</InlineCode>-এ আমরা <InlineCode>String</InlineCode>{" "}
          ব্যবহার করেছি, <InlineCode>&str</InlineCode> না। কারণ — instance
          নিজেই data-র owner হোক, যাতে struct বেঁচে থাকা পর্যন্ত data-ও থাকে।
        </p>
        <p>
          Reference রাখতে চাইলে <strong>lifetime</strong> specify করতে হয়।
          এমনিতে error:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct User {
    active: bool,
    username: &str,
    email: &str,
    sign_in_count: u64,
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0106]: missing lifetime specifier
 --> src/main.rs:3:15
  |
3 |     username: &str,
  |               ^ expected named lifetime parameter`}
        />
        <p>
          আপাতত <InlineCode>String</InlineCode> use করো; lifetime Chapter
          10-এ বিস্তারিত আসবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>struct</InlineCode> — named field, position-independent
            access।
          </li>
          <li>
            Field access dot notation; modify-এর জন্য instance{" "}
            <InlineCode>mut</InlineCode> হতে হবে — partial mutability নেই।
          </li>
          <li>
            Field init shorthand (variable নাম == field নাম); struct update
            syntax (<InlineCode>..other</InlineCode>) — কিন্তু move হয়।
          </li>
          <li>
            Tuple struct — নাম দেওয়া tuple, distinct type। Unit-like struct —
            শূন্য field, trait-এর জন্য।
          </li>
          <li>
            Struct-এ reference রাখতে গেলে lifetime দরকার; আপাতত owned type (
            <InlineCode>String</InlineCode>) ব্যবহার করো।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৫.১: Struct define এবং তৈরি করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ struct define, instantiate, mutability, field shorthand, struct update syntax, tuple struct, এবং unit-like struct।",
    },
  ],
};
