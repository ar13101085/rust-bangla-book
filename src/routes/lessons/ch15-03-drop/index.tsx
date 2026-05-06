import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-03-drop";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Drop trait দিয়ে cleanup-এ code চালানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Running Code on Cleanup with the Drop Trait
        </p>
        <p class="mt-3">
          Smart pointer-এর জন্য দ্বিতীয় গুরুত্বপূর্ণ trait হলো{" "}
          <InlineCode>Drop</InlineCode> — value scope-এর বাইরে যাওয়ার ঠিক
          আগে কী ঘটবে সেটা customize করতে দেয়। যেকোনো type-এ Drop implement
          করা যায়, এবং সেই code-এ file বা network connection-এর মতো resource
          release করা যায়।
        </p>
        <p class="mt-3">
          Smart pointer-এর context-এ Drop দেখাচ্ছি কারণ smart pointer
          implement করতে গেলে প্রায় সবসময়ই Drop লাগে। যেমন —{" "}
          <InlineCode>Box&lt;T&gt;</InlineCode> drop হলে heap-এ যেই memory
          allocate করেছিল সেটা release করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Manual cleanup-এর সমস্যা</h2>
        <p>
          কোনো কোনো language-এ programmer-কে নিজে memory free করতে হয় —
          file handle, socket, lock — সব। ভুলে গেলে system overload হয়ে
          crash। Rust-এ — value scope-এর বাইরে গেলেই compiler automatic
          cleanup-code insert করে। তুমি প্রতিটা use-এর শেষে cleanup ভাবার
          ঝামেলায় পড়ো না, আবার resource leak-ও হয় না।
        </p>
        <p>
          Cleanup-এর code লিখতে হয় <InlineCode>Drop</InlineCode> trait
          implement করে। এই trait-এ একটাই method —{" "}
          <InlineCode>drop</InlineCode>, যেটা <InlineCode>&amp;mut self</InlineCode>{" "}
          নেয়। কখন Rust এই <InlineCode>drop</InlineCode> call করে সেটা
          দেখার জন্য একটা <InlineCode>println!</InlineCode>-যুক্ত example।
        </p>

        <h2 class="mt-10 text-2xl font-bold">CustomSmartPointer example</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data \`{}\`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("my stuff"),
    };
    let d = CustomSmartPointer {
        data: String::from("other stuff"),
    };
    println!("CustomSmartPointers created");
}`}
        />
        <p>
          <InlineCode>Drop</InlineCode> trait prelude-এ আছে — import
          লাগে না। <InlineCode>drop</InlineCode>-এর body-তে যা লিখবে সেটাই
          instance scope-এর বাইরে গেলে চলবে।
        </p>
        <p>
          <InlineCode>main</InlineCode>-এ দু'টো instance বানিয়েছি, তারপর
          "CustomSmartPointers created" print। main শেষ হলে instance দু'টো
          scope-এর বাইরে যাবে — Rust automatic <InlineCode>drop</InlineCode>{" "}
          call করবে। আমরা explicit কিছু call করিনি।
        </p>
        <p>Output:</p>
        <CodeBlock
          lang="text"
          code={`$ cargo run
   Compiling drop-example v0.1.0 (file:///projects/drop-example)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.60s
     Running \`target/debug/drop-example\`
CustomSmartPointers created
Dropping CustomSmartPointer with data \`other stuff\`!
Dropping CustomSmartPointer with data \`my stuff\`!`}
        />
        <p>
          লক্ষ্য করো — drop-এর order creation-এর উল্টো।{" "}
          <InlineCode>d</InlineCode> পরে বানানো, তাই আগে drop। এই pattern
          সবসময় — variable reverse order-এ drop হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Manually drop call করা — নিষেধ</h2>
        <p>
          কখনো early cleanup দরকার — যেমন lock manage করা smart pointer। তখন
          ঘড়ির আগে lock release করা চাই যাতে অন্য code lock নিতে পারে।
          কিন্তু Rust-এ <InlineCode>Drop::drop</InlineCode> manually call
          করতে দেয় না। চেষ্টা করলে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data \`{}\`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("some data"),
    };
    println!("CustomSmartPointer created");
    c.drop();
    println!("CustomSmartPointer dropped before the end of main");
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0040]: explicit use of destructor method
  --> src/main.rs:16:7
   |
16 |     c.drop();
   |       ^^^^ explicit destructor calls not allowed
   |
help: consider using \`drop\` function
   |
16 -     c.drop();
16 +     drop(c);
   |`}
        />
        <p>
          Error-এ <em>destructor</em> term — programming-এ যে function
          instance cleanup করে। Constructor-এর উল্টো; Rust-এ{" "}
          <InlineCode>drop</InlineCode> একটা destructor।
        </p>
        <p>
          Manual call এজন্য নিষেধ — Rust শেষে আবার automatic drop call করত,
          double free হত। সেটা memory corruption।
        </p>

        <h2 class="mt-10 text-2xl font-bold">std::mem::drop দিয়ে early cleanup</h2>
        <p>
          Early drop চাইলে — standard library-র{" "}
          <InlineCode>std::mem::drop</InlineCode> function। Prelude-এ আছে,
          সরাসরি <InlineCode>drop(value)</InlineCode> লিখলেই হয়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data \`{}\`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("some data"),
    };
    println!("CustomSmartPointer created");
    drop(c);
    println!("CustomSmartPointer dropped before the end of main");
}`}
        />
        <CodeBlock
          lang="text"
          code={`$ cargo run
   Compiling drop-example v0.1.0 (file:///projects/drop-example)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.73s
     Running \`target/debug/drop-example\`
CustomSmartPointer created
Dropping CustomSmartPointer with data \`some data\`!
CustomSmartPointer dropped before the end of main`}
        />
        <p>
          "Dropping..." line "created" আর "dropped before..."-এর মাঝে আসছে —
          মানে main শেষের আগেই drop হয়ে গেছে।
        </p>
        <p>
          <InlineCode>std::mem::drop</InlineCode> ownership নিয়ে নেয়, তারপর
          সেই function-এর scope শেষে value স্বাভাবিক drop। তাই double free-এর
          ভয় নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কেন এটা powerful</h2>
        <p>
          Drop trait + ownership system মিলে — তোমাকে cleanup মনে রাখতে হয় না,
          Rust নিজে করে। আবার accidentally use-হওয়া value cleanup হবে না —
          কারণ ownership rule বলে reference সবসময় valid; drop-ও তখনই হয়
          যখন value আর use হবে না। নিজের memory allocator লেখা থেকে শুরু করে
          যেকোনো resource management — Drop দিয়েই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Drop</InlineCode> trait — value scope-এর শেষে কী
            ঘটবে customize; smart pointer-এর foundation।
          </li>
          <li>
            <InlineCode>drop(&amp;mut self)</InlineCode> — automatic call হয়,
            তুমি explicit কিছু লেখো না।
          </li>
          <li>
            Variable creation-এর reverse order-এ drop হয়।
          </li>
          <li>
            <InlineCode>Drop::drop</InlineCode> manually call করা যায় না (double
            free এড়ানোর জন্য)।
          </li>
          <li>
            Early cleanup চাইলে <InlineCode>std::mem::drop(value)</InlineCode> —
            ownership নেয়, সেই scope-এর শেষে স্বাভাবিক drop।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.৩: Drop trait দিয়ে cleanup · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Drop trait, automatic cleanup, এবং std::mem::drop দিয়ে early drop।",
    },
  ],
};
