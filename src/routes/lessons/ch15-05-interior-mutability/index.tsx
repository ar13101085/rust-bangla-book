import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch15-05-interior-mutability";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৫.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          RefCell&lt;T&gt; এবং Interior Mutability pattern
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          RefCell&lt;T&gt; and the Interior Mutability Pattern
        </p>
        <p class="mt-3">
          <strong>Interior mutability</strong> Rust-এর একটা design pattern —
          immutable reference থাকা সত্ত্বেও সেই data mutate করতে দেয়। সাধারণ
          borrowing rule এই কাজ disallow করে; pattern-টা type-এর ভেতরে{" "}
          <InlineCode>unsafe</InlineCode> code দিয়ে rule bend করে — কিন্তু
          API-এর level-এ runtime check রেখে safety guarantee দেয়।
        </p>
        <p class="mt-3">
          <InlineCode>RefCell&lt;T&gt;</InlineCode> — এই pattern-এর সবচেয়ে
          সাধারণ representative। Box-এর মতো single ownership, কিন্তু borrowing
          rule compile time-এ না, <strong>runtime-এ</strong> enforce করে।
          Rule ভাঙলে compile error না — runtime panic।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Compile-time vs Runtime checking</h2>
        <p>
          References আর <InlineCode>Box&lt;T&gt;</InlineCode> — সব borrowing
          rule compile time-এ check; ভুল করলে compile error।{" "}
          <InlineCode>RefCell&lt;T&gt;</InlineCode> — runtime-এ check; rule
          ভাঙলে program panic করে।
        </p>
        <p>Compile-time checking-এর সুবিধা:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Bug development-এর শুরুতে ধরা পড়ে।</li>
          <li>Runtime cost নেই।</li>
        </ul>
        <p>Runtime checking-এর সুবিধা (RefCell):</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            কিছু memory-safe scenario allow হয়, যেগুলো compile-time analysis
            reject করে।
          </li>
          <li>
            যখন তুমি জানো code rule মানে কিন্তু compiler verify করতে পারছে না।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Box, Rc, RefCell — তফাৎ</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Ownership:</strong> Box single, Rc multiple, RefCell
            single।
          </li>
          <li>
            <strong>Immutable borrow check:</strong> Box compile-time, Rc
            compile-time, RefCell runtime।
          </li>
          <li>
            <strong>Mutable borrow check:</strong> Box compile-time, Rc allow
            করে না, RefCell runtime।
          </li>
        </ul>
        <p>
          Lock-এর মতো — RefCell-এ rule runtime-এ enforced। আর interior
          mutability-র মূল কথা — RefCell নিজে immutable হলেও তার ভেতরের data
          mutate করা যায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Use case — mock object</h2>
        <p>
          Test-এ একটা চমৎকার example। আমরা একটা <InlineCode>LimitTracker</InlineCode>{" "}
          লাইব্রেরি বানাচ্ছি — একটা Messenger-এ message পাঠায় যখন value
          quota-এর কাছাকাছি যায়। Trait:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        } else if percentage_of_max >= 0.9 {
            self.messenger
                .send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 0.75 {
            self.messenger
                .send("Warning: You've used up over 75% of your quota!");
        }
    }
}`}
        />
        <p>
          <InlineCode>send</InlineCode>-এর signature{" "}
          <InlineCode>&amp;self</InlineCode> — immutable। Test-এ একটা mock
          messenger দরকার যেটা সব message store করে রাখে — যাতে check করা
          যায় কোন warning গেছে। কিন্তু{" "}
          <InlineCode>&amp;self</InlineCode> দিয়ে field mutate করা যায় না।
        </p>
        <p>সমাধান — RefCell:</p>
        <CodeBlock
          lang="rust"
          code={`#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;

    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: RefCell::new(vec![]),
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            self.sent_messages.borrow_mut().push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

        limit_tracker.set_value(80);

        assert_eq!(mock_messenger.sent_messages.borrow().len(), 1);
    }
}`}
        />
        <p>
          <InlineCode>sent_messages</InlineCode> field হয়েছে{" "}
          <InlineCode>RefCell&lt;Vec&lt;String&gt;&gt;</InlineCode>।{" "}
          <InlineCode>send</InlineCode>-এর ভেতর{" "}
          <InlineCode>self.sent_messages.borrow_mut()</InlineCode> — runtime-এ
          mutable borrow নেয়, vector-এ push করে। Test-এ{" "}
          <InlineCode>borrow()</InlineCode> দিয়ে immutable borrow নিয়ে length
          check।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Runtime-এ borrow tracking</h2>
        <p>
          RefCell-এর দু'টা main method:
        </p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>borrow()</InlineCode> — immutable smart pointer{" "}
            <InlineCode>Ref&lt;T&gt;</InlineCode> দেয়।
          </li>
          <li>
            <InlineCode>borrow_mut()</InlineCode> — mutable smart pointer{" "}
            <InlineCode>RefMut&lt;T&gt;</InlineCode> দেয়।
          </li>
        </ul>
        <p>
          দু'টোই <InlineCode>Deref</InlineCode> implement করে — regular
          reference-এর মতো ব্যবহার করা যায়।
        </p>
        <p>
          RefCell internally count রাখে — কয়টা active{" "}
          <InlineCode>Ref</InlineCode> এবং{" "}
          <InlineCode>RefMut</InlineCode>। Rule একই —{" "}
          <em>multiple immutable</em> ঠিক, কিন্তু{" "}
          <em>একটাই mutable</em> এবং সেই সময় immutable থাকতে পারবে না।
          Rule break-এ panic।
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Messenger for MockMessenger {
    fn send(&self, message: &str) {
        let mut one_borrow = self.sent_messages.borrow_mut();
        let mut two_borrow = self.sent_messages.borrow_mut();

        one_borrow.push(String::from(message));
        two_borrow.push(String::from(message));
    }
}`}
        />
        <CodeBlock
          lang="text"
          filename="runtime panic"
          code={`thread 'tests::it_sends_an_over_75_percent_warning_message' panicked at src/lib.rs:60:53:
RefCell already borrowed`}
        />
        <p>
          দু'বার <InlineCode>borrow_mut()</InlineCode> — runtime-এ panic।
          Compile time-এ এই bug হলে আগেই ধরা যেত; কিন্তু interior mutability
          pattern-এ এটাই compromise — flexibility-এর বদলে runtime check।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Rc + RefCell — multiple mutable owner</h2>
        <p>
          <InlineCode>Rc&lt;T&gt;</InlineCode> immutable share করে।{" "}
          <InlineCode>RefCell&lt;T&gt;</InlineCode> single ownership-এ interior
          mutation দেয়। দু'টো combine করলে — multiple owner যারা সবাই
          mutate করতে পারবে।
        </p>
        <CodeBlock
          lang="rust"
          code={`#[derive(Debug)]
enum List {
    Cons(Rc<RefCell<i32>>, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let value = Rc::new(RefCell::new(5));

    let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));

    let b = Cons(Rc::new(RefCell::new(3)), Rc::clone(&a));
    let c = Cons(Rc::new(RefCell::new(4)), Rc::clone(&a));

    *value.borrow_mut() += 10;

    println!("a after = {a:?}");
    println!("b after = {b:?}");
    println!("c after = {c:?}");
}`}
        />
        <p>
          <InlineCode>value</InlineCode> shared। b এবং c — দু'জনেই a-কে share
          করছে, এবং a-এর মধ্যে value-এর reference। তারপর{" "}
          <InlineCode>*value.borrow_mut() += 10;</InlineCode> — value 5 থেকে
          15। Output:
        </p>
        <CodeBlock
          lang="text"
          code={`a after = Cons(RefCell { value: 15 }, Nil)
b after = Cons(RefCell { value: 3 }, Cons(RefCell { value: 15 }, Nil))
c after = Cons(RefCell { value: 4 }, Cons(RefCell { value: 15 }, Nil))`}
        />
        <p>
          a, b, c সবাই একই 15 দেখছে — কারণ একই RefCell। এই pattern অনেক জটিল
          data structure-এ দরকার পড়ে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">সতর্কতা</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>RefCell&lt;T&gt;</InlineCode> single-threaded only;
            multi-thread-এ <InlineCode>Mutex&lt;T&gt;</InlineCode> (চ্যাপ্টার
            ১৬)।
          </li>
          <li>
            Borrow tracking-এ একটু runtime cost আছে — flexibility-এর জন্য
            trade-off।
          </li>
          <li>
            যদি code correct হলেও compiler reject করে — তখন এই pattern; কিন্তু
            যত কম জায়গায় তত ভালো।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Interior mutability pattern — immutable wrapper-এর ভেতরে data
            mutate; <InlineCode>RefCell&lt;T&gt;</InlineCode> এর
            representative।
          </li>
          <li>
            <InlineCode>borrow()</InlineCode> ও{" "}
            <InlineCode>borrow_mut()</InlineCode> — runtime-এ borrow check;
            rule break-এ panic।
          </li>
          <li>
            <InlineCode>Rc&lt;RefCell&lt;T&gt;&gt;</InlineCode> — multiple
            owner + mutable; complex shared data structure-এর জন্য।
          </li>
          <li>
            Single-threaded only; multi-thread-এ <InlineCode>Mutex</InlineCode>।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৫.৫: RefCell ও Interior Mutability · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ RefCell<T> দিয়ে interior mutability, runtime borrow checking, এবং Rc<RefCell<T>> combination।",
    },
  ],
};
