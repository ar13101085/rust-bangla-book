import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch13-02-iterators";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৩.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Iterator দিয়ে item-গুলো process করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Processing a Series of Items with Iterators
        </p>
        <p class="mt-3">
          Iterator pattern — sequence-এর প্রতিটা item-এ এক এক করে কিছু করা।
          Rust-এ iterator <strong>lazy</strong> — যতক্ষণ পর্যন্ত consume না
          করছ, কিছু হবে না।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Iterator তৈরি ও use</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();
}`}
        />
        <p>
          এই code-এ কিছুই হচ্ছে না — iterator তৈরি, কিন্তু consume হয়নি।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();

    for val in v1_iter {
        println!("Got: {val}");
    }
}`}
        />
        <p>
          <InlineCode>for</InlineCode> loop iterator-কে consume করছে — প্রতিটা
          iteration-এ একটা item।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Iterator trait এবং next method</h2>
        <CodeBlock
          lang="rust"
          code={`pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // অন্য method-গুলোর default implementation আছে
}`}
        />
        <p>
          <InlineCode>Item</InlineCode> = এই iterator কী return করবে।{" "}
          <InlineCode>next</InlineCode> = একটামাত্র required method — পরের
          item-কে <InlineCode>Some</InlineCode>-এ wrap করে দেয়; শেষ হলে{" "}
          <InlineCode>None</InlineCode>।
        </p>
        <CodeBlock
          lang="rust"
          code={`#[test]
fn iterator_demonstration() {
    let v1 = vec![1, 2, 3];

    let mut v1_iter = v1.iter();

    assert_eq!(v1_iter.next(), Some(&1));
    assert_eq!(v1_iter.next(), Some(&2));
    assert_eq!(v1_iter.next(), Some(&3));
    assert_eq!(v1_iter.next(), None);
}`}
        />
        <p>
          লক্ষ্য — <InlineCode>v1_iter</InlineCode>{" "}
          <InlineCode>mut</InlineCode>। <InlineCode>next</InlineCode> internal
          state বদলায় (কোথায় আছ track করে)। For loop ভেতরে এটা automatic।
        </p>
        <p>
          <InlineCode>iter()</InlineCode> immutable reference-এর iterator
          (<InlineCode>&i32</InlineCode>)। আরও আছে:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>iter()</InlineCode> — immutable reference।
          </li>
          <li>
            <InlineCode>into_iter()</InlineCode> — ownership নেয়, owned value
            return।
          </li>
          <li>
            <InlineCode>iter_mut()</InlineCode> — mutable reference।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Consuming adapter</h2>
        <p>
          যেসব method <InlineCode>next</InlineCode> call করে iterator শেষ পর্যন্ত
          ব্যবহার করে — যেমন <InlineCode>sum</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[test]
fn iterator_sum() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();

    let total: i32 = v1_iter.sum();

    assert_eq!(total, 6);
}`}
        />
        <p>
          <InlineCode>sum</InlineCode> iterator ownership নেয় — তাই পরে{" "}
          <InlineCode>v1_iter</InlineCode> ব্যবহার করা যাবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Iterator adapter — অন্য iterator return করে</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v1: Vec<i32> = vec![1, 2, 3];

    v1.iter().map(|x| x + 1);
}`}
        />
        <p>
          এই code warning দেবে — iterator lazy, এখনই কিছু হচ্ছে না।{" "}
          <InlineCode>.collect()</InlineCode> দিয়ে consume:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let v1: Vec<i32> = vec![1, 2, 3];

    let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

    assert_eq!(v2, vec![2, 3, 4]);
}`}
        />
        <p>
          adapter chain readable — যেমন{" "}
          <InlineCode>.iter().map(...).filter(...).collect()</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Closure দিয়ে environment capture</h2>
        <CodeBlock
          lang="rust"
          code={`#[derive(PartialEq, Debug)]
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes.into_iter().filter(|s| s.size == shoe_size).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filters_by_size() {
        let shoes = vec![
            Shoe { size: 10, style: String::from("sneaker") },
            Shoe { size: 13, style: String::from("sandal") },
            Shoe { size: 10, style: String::from("boot") },
        ];

        let in_my_size = shoes_in_size(shoes, 10);

        assert_eq!(
            in_my_size,
            vec![
                Shoe { size: 10, style: String::from("sneaker") },
                Shoe { size: 10, style: String::from("boot") },
            ]
        );
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>into_iter()</InlineCode> — vec-এর ownership নিয়ে owned
            value-র iterator।
          </li>
          <li>
            <InlineCode>.filter(closure)</InlineCode> — closure true হলে item
            রাখে।
          </li>
          <li>
            Closure <InlineCode>shoe_size</InlineCode> capture করছে — outer
            scope থেকে।
          </li>
          <li>
            <InlineCode>.collect()</InlineCode> — final Vec।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Iterator <strong>lazy</strong> — consume না করলে কিছুই হয় না।
          </li>
          <li>
            <InlineCode>Iterator</InlineCode> trait এক method —{" "}
            <InlineCode>next() -&gt; Option&lt;Item&gt;</InlineCode>।
          </li>
          <li>
            <InlineCode>iter</InlineCode> /{" "}
            <InlineCode>into_iter</InlineCode> / <InlineCode>iter_mut</InlineCode>{" "}
            — borrow level আলাদা।
          </li>
          <li>
            Consuming adapter (<InlineCode>sum</InlineCode>,{" "}
            <InlineCode>collect</InlineCode>) iterator শেষ করে; iterator
            adapter (<InlineCode>map</InlineCode>,{" "}
            <InlineCode>filter</InlineCode>) নতুন iterator return করে।
          </li>
          <li>
            <InlineCode>filter</InlineCode>, <InlineCode>map</InlineCode>{" "}
            ইত্যাদি closure নেয় — যা environment capture করতে পারে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৩.২: Iterator দিয়ে item process · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ iterator trait, lazy evaluation, iter/into_iter/iter_mut, এবং map/filter/collect adapter chain।",
    },
  ],
};
