import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch19-02-refutability";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৯.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Refutability: Pattern fail করতে পারে কিনা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Refutability: Whether a Pattern Might Fail to Match
        </p>
        <p class="mt-3">
          Pattern দু'ধরনের — <strong>refutable</strong> এবং{" "}
          <strong>irrefutable</strong>। যে pattern যেকোনো value-এর সাথে
          match করে, fail করার কোনো সম্ভাবনা নেই — সেটা <em>irrefutable</em>।
          যে pattern কিছু value-এর সাথে match নাও করতে পারে — সেটা{" "}
          <em>refutable</em>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">দু'ধরনের উদাহরণ</h2>
        <p>
          <InlineCode>let x = 5;</InlineCode>-এ <InlineCode>x</InlineCode>{" "}
          একটা irrefutable pattern — যেকোনো value-ই x-এ bind করা যায়, fail
          করার সুযোগ নেই।
        </p>
        <p>
          <InlineCode>if let Some(x) = a_value</InlineCode>-এ{" "}
          <InlineCode>Some(x)</InlineCode> refutable — a_value যদি{" "}
          <InlineCode>None</InlineCode> হয়, pattern match হবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কে কোনটা accept করে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Function parameter, <InlineCode>let</InlineCode>{" "}
            statement, <InlineCode>for</InlineCode> loop</strong> — শুধু
            irrefutable। কারণ pattern fail করলে কী করবে এদের কাছে কোনো জবাব
            নেই।
          </li>
          <li>
            <strong><InlineCode>if let</InlineCode>,{" "}
            <InlineCode>while let</InlineCode>,{" "}
            <InlineCode>let...else</InlineCode></strong> — refutable এবং
            irrefutable দু'টোই accept; কিন্তু irrefutable হলে compiler warning
            দেয় (কারণ এদের purpose-ই হলো success/failure-এ ভিন্ন behavior)।
          </li>
        </ul>
        <p>
          সাধারণত এই distinction নিয়ে চিন্তা করতে হয় না — error message-এ
          term দু'টো দেখলে বুঝতে পারলেই হলো; তখন pattern বদলাও বা construct
          বদলাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">let-এ refutable — error</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let some_option_value: Option<i32> = None;
    let Some(x) = some_option_value;
}`}
        />
        <p>
          <InlineCode>some_option_value</InlineCode>{" "}
          <InlineCode>None</InlineCode> হলে pattern{" "}
          <InlineCode>Some(x)</InlineCode> match হবে না — refutable। কিন্তু{" "}
          <InlineCode>let</InlineCode> চায় irrefutable। তাই compile error:
        </p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0005]: refutable pattern in local binding
 --> src/main.rs:3:9
  |
3 |     let Some(x) = some_option_value;
  |         ^^^^^^^ pattern \`None\` not covered
  |
  = note: \`let\` bindings require an "irrefutable pattern", like a \`struct\` or an \`enum\` with only one variant
  = note: for more information, visit https://doc.rust-lang.org/book/ch19-02-refutability.html
  = note: the matched value is of type \`Option<i32>\`
help: you might want to use \`let else\` to handle the variant that isn't matched
  |
3 |     let Some(x) = some_option_value else { todo!() };
  |                                     ++++++++++++++++`}
        />
        <p>
          Compiler বলছে — <InlineCode>None</InlineCode> case cover হয়নি।
          Solution-এ hint দিচ্ছে <InlineCode>let...else</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">let...else — fix</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let some_option_value: Option<i32> = None;
    let Some(x) = some_option_value else {
        return;
    };
}`}
        />
        <p>
          Pattern match না হলে <InlineCode>else</InlineCode> block চলবে —
          এখানে early return। Match হলে <InlineCode>x</InlineCode> bound,
          পরে use করা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">let...else-এ irrefutable — warning</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5 else {
        return;
    };
}`}
        />
        <CodeBlock
          lang="text"
          filename="warning"
          code={`warning: irrefutable \`let...else\` pattern
 --> src/main.rs:2:5
  |
2 |     let x = 5 else {
  |     ^^^^^^^^^
  |
  = note: this pattern will always match, so the \`else\` clause is useless
  = help: consider removing the \`else\` clause
  = note: \`#[warn(irrefutable_let_patterns)]\` on by default`}
        />
        <p>
          Pattern সবসময় match করবে — <InlineCode>else</InlineCode> অর্থহীন।
          Warning, error না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">match-এর arm</h2>
        <p>
          <InlineCode>match</InlineCode>-এর arm — refutable pattern হতে হবে,
          শেষ arm ছাড়া (যেটা irrefutable হিসেবে remaining সব value cover
          করে)। Rust-এ এক arm-ের <InlineCode>match</InlineCode>{" "}
          irrefutable-এ allowed, কিন্তু সেটা সরাসরি{" "}
          <InlineCode>let</InlineCode>-ই হতো — তাই খুব useful না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Irrefutable — সবসময় match; refutable — কখনো fail করতে পারে।
          </li>
          <li>
            <InlineCode>let</InlineCode>, function parameter,{" "}
            <InlineCode>for</InlineCode> — irrefutable চায়।
          </li>
          <li>
            <InlineCode>if let</InlineCode>,{" "}
            <InlineCode>while let</InlineCode>,{" "}
            <InlineCode>let...else</InlineCode> — দু'টোই accept; কিন্তু
            irrefutable-এ warning।
          </li>
          <li>
            Refutable pattern <InlineCode>let</InlineCode>-এ ঢোকাতে চাইলে —{" "}
            <InlineCode>let...else</InlineCode> ব্যবহার।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৯.২: Refutability — pattern fail · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ refutable ও irrefutable pattern-এর তফাত; কোথায় কোনটা accept; let...else syntax।",
    },
  ],
};
