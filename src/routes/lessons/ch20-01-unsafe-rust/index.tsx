import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch20-01-unsafe-rust";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২০.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Unsafe Rust</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Unsafe Rust</p>
        <p class="mt-3">
          Rust-এর ভেতরে আরেকটা language লুকিয়ে আছে — <strong>unsafe Rust</strong>
          । এটা compile time-এ memory safety guarantee দেয় না। কেন রাখা হয়েছে?
          এক, static analysis সবসময় conservative — কিছু safe code-ও reject করে।
          দুই, low-level systems programming-এ direct hardware-এর সাথে কাজ করতে
          গেলে safe Rust-এর সীমা পেরোতে হয়।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">
          <InlineCode>unsafe</InlineCode>-এর পাঁচ superpower
        </h2>
        <p>
          <InlineCode>unsafe</InlineCode> block পাঁচটা অতিরিক্ত সুবিধা দেয়, যা
          safe Rust-এ নেই:
        </p>
        <ol class="ml-6 list-decimal space-y-2">
          <li>Raw pointer dereference।</li>
          <li>Unsafe function বা method call।</li>
          <li>Mutable static variable read/write।</li>
          <li>Unsafe trait implement।</li>
          <li>
            <InlineCode>union</InlineCode>-এর field access।
          </li>
        </ol>
        <p>
          <strong>খেয়াল রাখো:</strong> <InlineCode>unsafe</InlineCode>{" "}
          borrow checker বা type checker বন্ধ করে না। শুধু এই পাঁচটা feature-এ
          access দেয়। তাই unsafe block-এর ভেতরেও অনেক safety থাকে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Raw pointer</h2>
        <p>
          Raw pointer দু'রকম — <InlineCode>*const T</InlineCode> (immutable)
          এবং <InlineCode>*mut T</InlineCode> (mutable)। Reference-এর তুলনায়:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>Borrowing rule ignore করতে পারে — same location-এ একসাথে immutable ও mutable।</li>
          <li>Valid memory point করার guarantee নেই।</li>
          <li>Null হতে পারে।</li>
          <li>Automatic cleanup নেই।</li>
        </ul>
        <p>Raw pointer তৈরি safe code-এই করা যায়:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut num = 5;

    let r1 = &raw const num;
    let r2 = &raw mut num;
}`}
        />
        <p>
          Arbitrary memory address থেকেও pointer (বিপজ্জনক):
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let address = 0x012345usize;
    let r = address as *const i32;
}`}
        />
        <p>
          কিন্তু dereference — শুধু <InlineCode>unsafe</InlineCode>-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut num = 5;

    let r1 = &raw const num;
    let r2 = &raw mut num;

    unsafe {
        println!("r1 is: {}", *r1);
        println!("r2 is: {}", *r2);
    }
}`}
        />
        <p>
          Pointer তৈরিতে কোনো ক্ষতি নেই; ক্ষতি তখন — যখন invalid জায়গায় access
          করো। Raw pointer দিয়ে সহজেই data race বানানো যায় — সাবধান।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Unsafe function</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    unsafe fn dangerous() {}

    unsafe {
        dangerous();
    }
}`}
        />
        <p>
          <InlineCode>unsafe fn</InlineCode> declaration বলে — এই function-এর
          কিছু precondition আছে যেগুলো caller-কে নিশ্চিত করতে হবে। Call করতে
          গেলে <InlineCode>unsafe</InlineCode> block লাগবে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Safe abstraction over unsafe</h3>
        <p>
          Standard library প্রায়ই unsafe code-কে safe API-তে wrap করে। যেমন{" "}
          <InlineCode>split_at_mut</InlineCode> — slice-কে দুটো mutable অংশে
          ভাগ করে। Pure safe Rust-এ এটা লেখা যায় না:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();

    assert!(mid <= len);

    (&mut values[..mid], &mut values[mid..])
}

fn main() {
    let mut vector = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut vector, 3);
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0499]: cannot borrow \`*values\` as mutable more than once at a time`}
        />
        <p>
          Borrow checker বুঝতে পারে না যে দু'টা slice non-overlapping। Solution
          — raw pointer দিয়ে unsafe-এ implement করা, কিন্তু পাবলিক API safe রাখা:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::slice;

fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut vector = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut vector, 3);
}`}
        />
        <p>
          <InlineCode>assert!</InlineCode> মাঝখানের bound check করছে, raw
          pointer দিয়ে non-overlapping দু'টা slice তৈরি — তাই function-টা সব
          input-এ safe। Public signature unsafe না।
        </p>
        <p>
          বিপরীতে — unsafe-এর misuse:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    use std::slice;

    let address = 0x01234usize;
    let r = address as *mut i32;

    let values: &[i32] = unsafe { slice::from_raw_parts_mut(r, 10000) };
}`}
        />
        <p>
          এই memory-র ownership আমাদের না — crash বা undefined behavior।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>extern</InlineCode> — অন্য language-এর function call
        </h2>
        <p>
          C-র মতো অন্য language-এর function call-এর জন্য{" "}
          <InlineCode>extern</InlineCode> block। FFI (Foreign Function
          Interface)। এই function-গুলো call unsafe — অন্য language Rust-এর rule
          মানে না।
        </p>
        <CodeBlock
          lang="rust"
          code={`unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}`}
        />
        <p>
          <InlineCode>"C"</InlineCode> = ABI; বলে দেয় function call convention
          C-র মতো।
        </p>
        <p>
          কিছু FFI function-এর memory safety concern নেই — সেগুলো{" "}
          <InlineCode>safe</InlineCode> keyword দিয়ে mark করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`unsafe extern "C" {
    safe fn abs(input: i32) -> i32;
}

fn main() {
    println!("Absolute value of -3 according to C: {}", abs(-3));
}`}
        />
        <p>
          সাবধান — <InlineCode>safe</InlineCode> mark করলে তুমি promise করছ
          এটা সত্যিই safe। দায়িত্ব তোমার।
        </p>
        <p>
          Reverse direction — Rust function অন্য language থেকে call:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[unsafe(no_mangle)]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}`}
        />
        <p>
          <InlineCode>no_mangle</InlineCode> compiler-কে name mangle করতে নিষেধ
          করে — তাই other language-এ symbol-টা স্বাভাবিক নামে available থাকে।
          নাম collision-এর ঝুঁকি, তাই unsafe।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Mutable static variable</h2>
        <p>
          Static variable — global variable; fixed memory address। Immutable
          static safe:
        </p>
        <CodeBlock
          lang="rust"
          code={`static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("value is: {HELLO_WORLD}");
}`}
        />
        <p>
          নাম <InlineCode>SCREAMING_SNAKE_CASE</InlineCode>। Static শুধু{" "}
          <InlineCode>'static</InlineCode> reference রাখতে পারে।
        </p>
        <p>
          কিন্তু <InlineCode>static mut</InlineCode> — multiple thread access
          করলে data race হতে পারে, তাই unsafe:
        </p>
        <CodeBlock
          lang="rust"
          code={`static mut COUNTER: u32 = 0;

/// SAFETY: Calling this from more than a single thread at a time is undefined
/// behavior, so you *must* guarantee you only call it from a single thread at
/// a time.
unsafe fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn main() {
    unsafe {
        // SAFETY: This is only called from a single thread in \`main\`.
        add_to_count(3);
        println!("COUNTER: {}", *(&raw const COUNTER));
    }
}`}
        />
        <p>
          Convention: <InlineCode>SAFETY:</InlineCode> comment দিয়ে invariant
          লেখা — কী condition মানলে safe।
        </p>
        <p>
          Practical advice — যেখানে সম্ভব, <InlineCode>static mut</InlineCode>{" "}
          এড়াও। Chapter 16-এর atomic type, <InlineCode>Mutex</InlineCode>,
          ইত্যাদি দিয়ে কাজ চালাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Unsafe trait implement</h2>
        <p>
          কোনো trait-এ এমন invariant থাকতে পারে যা compiler verify করতে পারে
          না — সেটা <InlineCode>unsafe trait</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}

fn main() {}`}
        />
        <p>
          Marker trait <InlineCode>Send</InlineCode> ও{" "}
          <InlineCode>Sync</InlineCode> এর উদাহরণ। Auto-derive করে না এমন type-এ
          নিজে দাবি করতে চাইলে:
        </p>
        <CodeBlock
          lang="rust"
          code={`unsafe impl Send for MyType { }
unsafe impl Sync for MyType { }`}
        />
        <p>
          তুমি promise করছ — এই type thread-এ পাঠানো বা share করা সত্যিই safe।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>union</InlineCode>-এর field
        </h2>
        <p>
          <InlineCode>union</InlineCode> struct-এর মতো, কিন্তু একসাথে শুধু একটা
          field-ই valid থাকে — সব field একই memory share করে। কোন field বর্তমানে
          set, সেটা compiler জানে না। তাই access unsafe। মূল ব্যবহার — C union-এর
          সাথে interop।
        </p>
        <CodeBlock
          lang="rust"
          code={`union MyUnion {
    field1: u32,
    field2: i32,
}

fn main() {
    let mut u = MyUnion { field1: 42 };

    unsafe {
        u.field1 = 10;
        println!("{}", u.field2); // ভুল field — undefined interpretation
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">
          Miri দিয়ে unsafe code check
        </h2>
        <p>
          <strong>Miri</strong> — Rust-এর official tool, dynamic-ভাবে undefined
          behavior detect করে। Borrow checker static; Miri runtime-এ চালিয়ে
          violation খুঁজে বের করে।
        </p>
        <CodeBlock
          lang="bash"
          code={`rustup +nightly component add miri
cargo +nightly miri run
cargo +nightly miri test`}
        />
        <p>
          Limitation — যেই code actually চলে, শুধু সেটাই check হয়। Miri কিছু না
          ধরা মানে code সঠিক — এটা guarantee না। ভালো test-এর সাথে combine করো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Best practice</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>unsafe</InlineCode> block যত ছোট রাখা যায়, ততই ভালো —
            audit সহজ।
          </li>
          <li>
            <InlineCode>SAFETY:</InlineCode> comment-এ invariant লেখো।
          </li>
          <li>সম্ভব হলে unsafe-কে safe abstraction-এ wrap করো।</li>
          <li>Miri চালাও; testing-ও।</li>
          <li>
            গভীরে যেতে — <em>The Rustonomicon</em>।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>unsafe</InlineCode> পাঁচটা feature unlock করে — raw
            pointer deref, unsafe fn, static mut, unsafe trait, union field।
          </li>
          <li>
            Borrow checker চালু থাকে — <InlineCode>unsafe</InlineCode> safety
            পুরোপুরি বন্ধ করে না।
          </li>
          <li>
            Raw pointer (<InlineCode>*const T</InlineCode>,{" "}
            <InlineCode>*mut T</InlineCode>) তৈরি safe, deref unsafe।
          </li>
          <li>
            <InlineCode>extern "C"</InlineCode> দিয়ে FFI; অন্য language থেকে
            Rust call-এর জন্য <InlineCode>no_mangle</InlineCode>।
          </li>
          <li>
            <InlineCode>static mut</InlineCode> এড়াও — atomic বা{" "}
            <InlineCode>Mutex</InlineCode> ভালো।
          </li>
          <li>
            Unsafe code-কে safe API-তে wrap করাই idiomatic; Miri দিয়ে dynamic
            check।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২০.১: Unsafe Rust · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ unsafe-এর পাঁচ superpower — raw pointer, unsafe fn, FFI, static mut, unsafe trait, union।",
    },
  ],
};
