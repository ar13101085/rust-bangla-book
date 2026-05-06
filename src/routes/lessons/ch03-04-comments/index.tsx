import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch03-04-comments";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৩.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Comment</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Comments</p>
        <p class="mt-3">
          Code পড়ার সময় কখনো কখনো extra explanation দরকার হয়। তখন আমরা{" "}
          <strong>comment</strong> লিখি — compiler এগুলো ignore করে, কিন্তু
          পরবর্তী reader-এর জন্য সাহায্যকারী।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Single-line comment</h2>
        <p>
          Rust-এর idiomatic comment style — দুটো slash{" "}
          <InlineCode>//</InlineCode> দিয়ে শুরু, line-এর শেষ পর্যন্ত comment।
        </p>
        <CodeBlock lang="rust" code={`// hello, world`} />

        <h2 class="mt-10 text-2xl font-bold">Multi-line comment</h2>
        <p>
          এক line-এর বেশি comment চাইলে প্রতিটা line-এ{" "}
          <InlineCode>//</InlineCode> দিতে হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`// So we're doing something complicated here, long enough that we need
// multiple lines of comments to do it! Whew! Hopefully, this comment will
// explain what's going on.`}
        />
        <p>
          (C/C++-এর <InlineCode>{"/* ... */"}</InlineCode> style block comment-ও
          Rust-এ আছে, তবে কম use হয়।)
        </p>

        <h2 class="mt-10 text-2xl font-bold">Line-শেষে বা line-এর উপরে?</h2>
        <p>Code-এর শেষে comment বসানো যায়:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let lucky_number = 7; // I'm feeling lucky today
}`}
        />
        <p>
          কিন্তু Rust community-তে এটা কম প্রচলিত। সাধারণত comment আলাদা
          line-এ, যেটা explain করছে তার ঠিক উপরে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    // I'm feeling lucky today
    let lucky_number = 7;
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Documentation comment</h2>
        <p>
          Rust-এ আরেক ধরনের comment আছে — <strong>documentation comment</strong>{" "}
          (<InlineCode>///</InlineCode> বা <InlineCode>{"//!"}</InlineCode>{" "}
          দিয়ে শুরু)। এগুলো special — <InlineCode>cargo doc</InlineCode> দিয়ে
          HTML documentation generate করা যায়। বিস্তারিত Chapter 14-এ
          ("Publishing a Crate to Crates.io") আসবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>//</InlineCode> — single-line comment (এই same syntax-ই
            multiple line-এ repeat করতে হয়)।
          </li>
          <li>
            Rust style — comment আলাদা line-এ, code-এর ঠিক উপরে।
          </li>
          <li>
            <InlineCode>///</InlineCode> doc comment আছে — chapter 14-এ
            বিস্তারিত।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৩.৪: Comment · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content: "Rust-এ // দিয়ে comment লেখা এবং doc comment-এর পরিচয়।",
    },
  ],
};
