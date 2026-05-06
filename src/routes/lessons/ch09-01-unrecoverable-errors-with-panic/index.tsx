import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch09-01-unrecoverable-errors-with-panic";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৯.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          panic! দিয়ে unrecoverable error
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Unrecoverable Errors with panic!
        </p>
        <p class="mt-3">
          Rust-এ error দু'রকম —
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Recoverable</strong> — <InlineCode>Result&lt;T, E&gt;</InlineCode>{" "}
            (যেমন file না পাওয়া)। পরের পাঠে।
          </li>
          <li>
            <strong>Unrecoverable</strong> — <InlineCode>panic!</InlineCode> macro
            (যেমন array-এর সীমার বাইরে index)। এই পাঠ।
          </li>
        </ul>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">panic! কী করে?</h2>
        <p>
          Default-এ panic হলে program — (১) message print করে, (২) stack
          unwind করে memory cleanup করে, (৩) quit করে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Unwind বনাম abort</h3>
        <p>
          Unwind cleanup করে — কিন্তু extra code দরকার, binary বড় হয়। Cleanup
          চাও না, immediate exit চাও — release build-এ{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[profile.release]
panic = 'abort'`}
        />
        <p>Binary ছোট হয়, কিন্তু OS-কে cleanup-এর দায়িত্ব দিতে হয়।</p>

        <h2 class="mt-10 text-2xl font-bold">Explicit panic!</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    panic!("crash and burn");
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`thread 'main' panicked at src/main.rs:2:5:
crash and burn
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace`}
        />
        <p>
          File location <InlineCode>src/main.rs:2:5</InlineCode> — line 2,
          column 5।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Accidental panic — out-of-bounds</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let v = vec![1, 2, 3];

    v[99];
}`}
        />
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`thread 'main' panicked at src/main.rs:4:6:
index out of bounds: the len is 3 but the index is 99`}
        />
        <p>
          C/C++-এ এটা <strong>undefined behavior</strong> — ঐ memory-তে যা
          কিছু আছে সেটা return হত। Buffer overread vulnerability — attacker
          সেই memory-র ভিতরে অন্য data (password, key) read করতে পারে।
        </p>
        <p>
          Rust এই attack vector পুরোপুরি বন্ধ করে দিয়েছে — invalid index দিলে
          program সাথে সাথে stop, কোনো garbage memory expose হয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Backtrace দেখা</h2>
        <p>
          Panic কোথা থেকে এসেছে — পুরো call chain দেখতে{" "}
          <InlineCode>RUST_BACKTRACE=1</InlineCode> environment variable:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ RUST_BACKTRACE=1 cargo run
thread 'main' panicked at src/main.rs:4:6:
index out of bounds: the len is 3 but the index is 99
stack backtrace:
   0: rust_begin_unwind
   1: core::panicking::panic_fmt
   2: core::panicking::panic_bounds_check
   3: <usize as core::slice::index::SliceIndex<[T]>>::index
   ...
   6: panic::main
             at ./src/main.rs:4:6
   ...`}
        />
        <p>
          কীভাবে পড়বে —
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>উপর থেকে নিচের দিকে যাও।</li>
          <li>
            প্রথম যে line তোমার লেখা file-এ — সেটাই panic-এর origin (এখানে
            line 6, <InlineCode>panic::main at ./src/main.rs:4:6</InlineCode>)।
          </li>
          <li>উপরের code তোমার code যা call করেছে।</li>
          <li>নিচের code যা তোমার code-কে call করেছে।</li>
        </ul>
        <p>
          Backtrace পেতে debug symbol দরকার — <InlineCode>cargo run</InlineCode>{" "}
          (release ছাড়া) default-এই দেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Two error categories — <InlineCode>Result</InlineCode> (recoverable),{" "}
            <InlineCode>panic!</InlineCode> (unrecoverable)।
          </li>
          <li>
            Default — unwind + cleanup + quit। Release-এ{" "}
            <InlineCode>panic = 'abort'</InlineCode> set করলে immediate exit।
          </li>
          <li>
            Panic আসে — explicit <InlineCode>panic!()</InlineCode>{" "}
            call থেকে, বা invalid action (out-of-bounds, etc.) থেকে।
          </li>
          <li>
            <InlineCode>RUST_BACKTRACE=1</InlineCode> দিয়ে call chain দেখো —
            তোমার লেখা file-এর প্রথম line-ই origin।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৯.১: panic! দিয়ে unrecoverable error · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ panic! macro, unwind vs abort, accidental panic, এবং RUST_BACKTRACE দিয়ে debug।",
    },
  ],
};
