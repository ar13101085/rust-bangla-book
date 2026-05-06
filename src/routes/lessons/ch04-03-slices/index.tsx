import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch04-03-slices";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৪.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Slice Type</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">The Slice Type</p>
        <p class="mt-3">
          <strong>Slice</strong> হলো একটা collection-এর কিছু পরপর element-এর
          reference। Slice-ও এক ধরনের reference, তাই ownership নেয় না — কিন্তু
          কোন range-এ point করছে সেই information রাখে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">সমস্যা — first word খোঁজা</h2>
        <p>
          এই function লিখব — একটা string-এ space-separated word আছে, প্রথম
          word-এর শেষ index return করো। Space না থাকলে পুরো string-ই এক word,
          string-এর length return করো।
        </p>
        <p>Slice ছাড়া প্রথম try:</p>
        <CodeBlock
          lang="rust"
          code={`fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }

    s.len()
}`}
        />
        <p>
          কী হচ্ছে — <InlineCode>.as_bytes()</InlineCode>{" "}
          <InlineCode>String</InlineCode>-কে byte array-এ convert করে।{" "}
          <InlineCode>.iter()</InlineCode> iterator,{" "}
          <InlineCode>.enumerate()</InlineCode> প্রতিটার সাথে index pair করে
          tuple-এ wrap করে — যা আমরা <InlineCode>(i, &item)</InlineCode> দিয়ে
          destructure করছি। <InlineCode>b' '</InlineCode> হলো space-এর byte
          value। প্রথম space পেলে index return; না পেলে length।
        </p>

        <h3 class="mt-6 text-xl font-bold">এই approach-এ ছোট কিন্তু বড় সমস্যা</h3>
        <p>
          Function একটা <InlineCode>usize</InlineCode> return করছে — string-এর
          সাথে এর কোনো সম্পর্ক নেই। String পরিবর্তন হলে সেই index meaningless
          হয়ে যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s); // word will get the value 5

    s.clear(); // this empties the String, making it equal to ""

    // word still has the value 5 here, but s no longer has any content that we
    // could meaningfully use with the value 5, so word is now totally invalid!
}`}
        />
        <p>
          <InlineCode>word</InlineCode>-এর value 5, কিন্তু{" "}
          <InlineCode>s</InlineCode> এখন empty। 5 এখন কোনো অর্থ বহন করছে না।
          Compiler এই sync error ধরবে না।
        </p>
        <p>
          Function-টা যদি <InlineCode>second_word</InlineCode>-ও বানাই — তখন
          start ও end দুটো index track করতে হবে: <InlineCode>(usize, usize)</InlineCode>
          । এই ধরনের brittle code-এর সমাধান — <strong>slice</strong>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">String slice — সমাধান</h2>
        <p>
          String slice একটা <InlineCode>String</InlineCode>-এর কিছু পরপর
          element-এর reference:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s = String::from("hello world");

    let hello = &s[0..5];
    let world = &s[6..11];
}`}
        />
        <p>
          Syntax — <InlineCode>&s[start..end]</InlineCode>। start-থেকে শুরু,
          end-এর আগে শেষ। Slice-এর ভিতরে — pointer (start position-এ) এবং
          length (end − start)। যেমন <InlineCode>world</InlineCode> — pointer
          byte 6-তে, length 5।
        </p>

        <h3 class="mt-6 text-xl font-bold">Range syntax-এর shortcut</h3>
        <p>0 থেকে শুরু হলে start বাদ:</p>
        <CodeBlock
          lang="rust"
          code={`let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];`}
        />
        <p>শেষ পর্যন্ত হলে end বাদ:</p>
        <CodeBlock
          lang="rust"
          code={`let s = String::from("hello");

let len = s.len();

let slice = &s[3..len];
let slice = &s[3..];`}
        />
        <p>পুরো string slice — দুটোই বাদ:</p>
        <CodeBlock
          lang="rust"
          code={`let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];`}
        />
        <p>
          (Note: range index অবশ্যই UTF-8 character boundary-তে হতে হবে — মাঝে
          ভাঙলে runtime panic।)
        </p>

        <h2 class="mt-10 text-2xl font-bold">first_word slice দিয়ে</h2>
        <p>
          Slice-এর type হলো <InlineCode>&str</InlineCode> ("string slice"
          পড়ো):
        </p>
        <CodeBlock
          lang="rust"
          code={`fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}`}
        />
        <p>
          এখন return value <em>data-র সাথে যুক্ত</em> — শুধু একটা lone index না।
          Reference + length — দুটোই আছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Compiler আগের bug ধরে দিচ্ছে</h2>
        <p>
          Slice-এর সবচেয়ে সুন্দর দিক — আগে যে bug সম্ভব ছিল, এখন compile
          error:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s);

    s.clear(); // error!

    println!("the first word is: {word}");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0502]: cannot borrow \`s\` as mutable because it is also borrowed as immutable
  --> src/main.rs:18:5
   |
16 |     let word = first_word(&s);
   |                           -- immutable borrow occurs here
17 |
18 |     s.clear(); // error!
   |     ^^^^^^^^^ mutable borrow occurs here
19 |
20 |     println!("the first word is: {word}");
   |                                   ---- immutable borrow later used here`}
        />
        <p>
          <InlineCode>word</InlineCode> একটা immutable borrow ধরে রেখেছে।{" "}
          <InlineCode>.clear()</InlineCode>-কে mutable borrow লাগে। Borrowing
          rule violate — তাই compile error। Rust এই entire class-এর bug
          eliminate করেছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">String literal-ও আসলে slice</h2>
        <CodeBlock
          lang="rust"
          code={`let s = "Hello, world!";`}
        />
        <p>
          এই <InlineCode>s</InlineCode>-এর type{" "}
          <InlineCode>&str</InlineCode> — binary-র মধ্যে hardcoded যে memory
          আছে, তার একটা slice। এই কারণে literal immutable —{" "}
          <InlineCode>&str</InlineCode> immutable reference।
        </p>

        <h2 class="mt-10 text-2xl font-bold">&str parameter — flexible API</h2>
        <p>
          <InlineCode>&String</InlineCode>-এর জায়গায় <InlineCode>&str</InlineCode>{" "}
          নিলে function অনেক বেশি usable:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}

fn main() {
    let my_string = String::from("hello world");

    // \`first_word\` works on slices of \`String\`s, whether partial or whole.
    let word = first_word(&my_string[0..6]);
    let word = first_word(&my_string[..]);
    // \`first_word\` also works on references to \`String\`s, which are equivalent
    // to whole slices of \`String\`s.
    let word = first_word(&my_string);

    let my_string_literal = "hello world";

    // \`first_word\` works on slices of string literals, whether partial or
    // whole.
    let word = first_word(&my_string_literal[0..6]);
    let word = first_word(&my_string_literal[..]);

    // Because string literals *are* string slices already,
    // this works too, without the slice syntax!
    let word = first_word(my_string_literal);
}`}
        />
        <p>
          <InlineCode>&String</InlineCode> থেকে <InlineCode>&str</InlineCode>-এ
          conversion automatic হয় — <strong>deref coercion</strong> বলে এটাকে
          (Chapter 15-এ বিস্তারিত)। তাই <InlineCode>&str</InlineCode> নেওয়া
          best practice।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Array slice</h2>
        <p>
          Slice শুধু string-এ না — যেকোনো collection-এ কাজ করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);`}
        />
        <p>
          এই slice-এর type <InlineCode>&[i32]</InlineCode>। String slice-এর
          মতোই — first element-এর reference + length। Vector (Chapter 8) এবং
          অন্যান্য collection-এর জন্যও same pattern।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Slice — collection-এর consecutive range-এর reference; ownership
            নেয় না।
          </li>
          <li>
            String slice type <InlineCode>&str</InlineCode>; syntax{" "}
            <InlineCode>&s[start..end]</InlineCode>; shortcut{" "}
            <InlineCode>&s[..end]</InlineCode>, <InlineCode>&s[start..]</InlineCode>
            , <InlineCode>&s[..]</InlineCode>।
          </li>
          <li>
            String literal-এর type-ই <InlineCode>&str</InlineCode> — তাই
            literal immutable।
          </li>
          <li>
            <InlineCode>&str</InlineCode> parameter <InlineCode>&String</InlineCode>
            -এর চেয়ে flexible — দুটোই accept করে।
          </li>
          <li>
            Array slice <InlineCode>&[T]</InlineCode> — same pattern,
            যেকোনো collection-এ কাজ করে।
          </li>
          <li>
            Slice + borrow-rule-এর combination compile-time-এ সমস্ত index/string
            sync bug ধরে দেয়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৪.৩: Slice Type · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ string slice, &str, range syntax, এবং array slice — slice দিয়ে index sync bug কিভাবে eliminate হয়।",
    },
  ],
};
