import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch18-01-what-is-oo";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৮.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Object-Oriented language-এর বৈশিষ্ট্য
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Characteristics of Object-Oriented Languages
        </p>
        <p class="mt-3">
          কোন language-কে "object-oriented" বলা যায় তা নিয়ে কোনো universal সংজ্ঞা
          নেই, তবে সাধারণত OOP language-গুলোর তিনটা বৈশিষ্ট্য থাকে —{" "}
          <strong>object</strong>, <strong>encapsulation</strong>, এবং{" "}
          <strong>inheritance</strong>। এই পাঠে দেখব Rust এই তিনটা ধারণাকে
          কোথায় কীভাবে support করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Object — data এবং behavior একসাথে</h2>
        <p>
          Gang of Four-এর <em>Design Patterns</em> বইয়ে সংজ্ঞা —
          object-oriented program object দিয়ে তৈরি। একটা <strong>object</strong>{" "}
          data এবং সেই data-র উপর কাজ করা procedure (যাকে method বা operation
          বলে) — দু'টোই encapsulate করে।
        </p>
        <p>
          এই সংজ্ঞা অনুসারে — Rust object-oriented। <InlineCode>struct</InlineCode>{" "}
          আর <InlineCode>enum</InlineCode>-এ data থাকে,{" "}
          <InlineCode>impl</InlineCode> block-এ method। নাম "object" না হলেও,
          functionality একই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Encapsulation — implementation hide করা</h2>
        <p>
          Encapsulation মানে object-এর implementation detail বাইরের কোড থেকে
          access করা যাবে না — user শুধু public API-র মাধ্যমে interact করবে।
          এতে internal change করা সম্ভব হয় public interface ভাঙা ছাড়াই।
        </p>
        <p>
          নিচে <InlineCode>AveragedCollection</InlineCode> struct — list-এ
          integer যোগ-বিয়োগ করার সাথে সাথে cached average maintain করে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}`}
        />
        <p>
          Struct <InlineCode>pub</InlineCode>, কিন্তু তার field-গুলো default-এ{" "}
          <strong>private</strong>। এতে data integrity রক্ষা হয়।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`impl AveragedCollection {
    pub fn add(&mut self, value: i32) {
        self.list.push(value);
        self.update_average();
    }

    pub fn remove(&mut self) -> Option<i32> {
        let result = self.list.pop();
        match result {
            Some(value) => {
                self.update_average();
                Some(value)
            }
            None => None,
        }
    }

    pub fn average(&self) -> f64 {
        self.average
    }

    fn update_average(&mut self) {
        let total: i32 = self.list.iter().sum();
        self.average = total as f64 / self.list.len() as f64;
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            শুধু <InlineCode>add</InlineCode>, <InlineCode>remove</InlineCode>,{" "}
            <InlineCode>average</InlineCode> public method-গুলো data পরিবর্তন
            বা পাঠ করে।
          </li>
          <li>
            <InlineCode>list</InlineCode> এবং{" "}
            <InlineCode>average</InlineCode> field private — কেউ বাইরে থেকে
            ভেঙে দিতে পারবে না।
          </li>
          <li>
            চাইলে ভবিষ্যতে <InlineCode>Vec&lt;i32&gt;</InlineCode> থেকে{" "}
            <InlineCode>HashSet&lt;i32&gt;</InlineCode>-এ change করো — public
            API অপরিবর্তিত থাকবে।
          </li>
        </ul>
        <p>
          Rust-এ encapsulation enforce হয় <InlineCode>pub</InlineCode> keyword
          দিয়ে — module, type, function, এবং method level-এ visibility control।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Inheritance — Rust-এর ভিন্ন approach</h2>
        <p>
          <strong>Rust traditional inheritance support করে না</strong> — অর্থাৎ
          এক struct অন্য struct-এর field আর method automatically inherit করতে
          পারে না (macro ছাড়া)। সাধারণত মানুষ inheritance use করে দু'টো কারণে —
          <strong>code reuse</strong> এবং <strong>polymorphism</strong>। দু'টোর
          জন্যই Rust-এ আলাদা solution আছে।
        </p>

        <h3 class="mt-6 text-xl font-bold">১. Code reuse — default trait method</h3>
        <p>
          Inheritance-এর বদলে <InlineCode>trait</InlineCode>-এ default
          implementation দাও — যে type এই trait implement করবে সে method-টা
          বিনামূল্যে পাবে।
        </p>
        <CodeBlock
          lang="rust"
          code={`pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)") // default implementation
    }
}`}
        />
        <p>
          চাইলে implementor override-ও করতে পারে — child class parent method
          override করার মতোই।
        </p>

        <h3 class="mt-6 text-xl font-bold">২. Polymorphism — trait object আর generic</h3>
        <p>
          <strong>Polymorphism</strong> — runtime-এ একাধিক type substitute
          করা, যদি তারা common characteristic share করে। Rust-এ দু'রকম:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Trait object</strong> — runtime polymorphism (dynamic
            dispatch)।
          </li>
          <li>
            <strong>Generic + trait bound</strong> — compile-time polymorphism
            (bounded parametric polymorphism, monomorphization)।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">কেন Rust inheritance এড়িয়ে গেছে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Inheritance অনেক সময় প্রয়োজনের চেয়ে বেশি code share করে।
          </li>
          <li>
            Subclass-এ এমন characteristic চলে আসে যা সেই subclass-এর জন্য
            applicable না।
          </li>
          <li>
            Single inheritance restrictive; design কম flexible।
          </li>
          <li>
            Subclass-এ method call হয়ে যেতে পারে যেটা logically সেখানে অর্থ
            করে না।
          </li>
        </ul>
        <p>
          এজন্য Rust trait object আর generic ব্যবহার করে — flexible, type-safe,
          এবং intent পরিষ্কার।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Rust-এ "object" নাম না হলেও <InlineCode>struct</InlineCode>/
            <InlineCode>enum</InlineCode> +{" "}
            <InlineCode>impl</InlineCode> মিলে data + behavior package করে।
          </li>
          <li>
            <InlineCode>pub</InlineCode> keyword দিয়ে encapsulation —
            field-default private, public method-এর মাধ্যমেই access।
          </li>
          <li>
            Traditional inheritance Rust-এ নেই; default trait method-এ code
            reuse, trait object/generic-এ polymorphism।
          </li>
          <li>
            Inheritance-এর tight coupling এড়াতেই Rust ভিন্ন path বেছেছে —
            flexibility আর safety দু'টোই বাড়ায়।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৮.১: Object-Oriented language-এর বৈশিষ্ট্য · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ OOP-এর তিন বৈশিষ্ট্য — object, encapsulation, inheritance — কীভাবে support এবং কেন alternative।",
    },
  ],
};
