import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch18-03-oo-design-patterns";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৮.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          একটি Object-Oriented design pattern implement করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Implementing an Object-Oriented Design Pattern
        </p>
        <p class="mt-3">
          <strong>State pattern</strong> এক classic OOP design pattern — একটা
          value-র behaviour তার ভেতরের state অনুসারে পরিবর্তিত হয়। আমরা
          এখানে এক blog post-এর workflow build করব — draft → pending review →
          published — দু'ভাবে: trait object দিয়ে classical state pattern, এবং
          Rust-এর type system দিয়ে state-as-type।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Functional requirement</h2>
        <ol class="ml-6 list-decimal space-y-2">
          <li>Blog post শুরু হবে empty draft হিসেবে।</li>
          <li>Draft শেষ হলে review request করা যাবে।</li>
          <li>Approve হলে publish।</li>
          <li>শুধু published post-এর content print হবে।</li>
          <li>Invalid transition (যেমন draft সরাসরি approve) effect ফেলবে না।</li>
        </ol>

        <h2 class="mt-10 text-2xl font-bold">API আগে থেকে দেখা</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}`}
        />
        <p>
          User শুধু <InlineCode>Post</InlineCode> type-এর সাথে interact করছে —
          state internal।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Post struct আর Draft state</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
}

trait State {}

struct Draft {}

impl State for Draft {}`}
        />
        <p>
          <InlineCode>state</InlineCode> field <InlineCode>Option&lt;Box&lt;dyn State&gt;&gt;</InlineCode>{" "}
          — current state-কে boxed trait object হিসেবে রাখে।{" "}
          <InlineCode>Option</InlineCode> দরকার হবে state move-out করে replace
          করতে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Text যোগ করা</h2>
        <CodeBlock
          lang="rust"
          code={`impl Post {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}`}
        />
        <p>
          <InlineCode>add_text</InlineCode> state-এর উপর depend করে না, তাই এটা
          state pattern-এর অংশ না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Draft post-এর content empty</h2>
        <CodeBlock
          lang="rust"
          code={`impl Post {
    pub fn content(&self) -> &str {
        ""
    }
}`}
        />
        <p>প্রাথমিকভাবে — সবসময় empty। পরে state-এর সাথে wire করব।</p>

        <h2 class="mt-10 text-2xl font-bold">Review request — state transition</h2>
        <CodeBlock
          lang="rust"
          code={`impl Post {
    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
}`}
        />
        <p>মূল কয়েকটা ব্যাপার:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>self: Box&lt;Self&gt;</InlineCode> — method শুধু boxed
            instance-এ call করা যাবে; ownership consume করে।
          </li>
          <li>
            <InlineCode>Option::take()</InlineCode> — state move করে নেয়,{" "}
            place-এ <InlineCode>None</InlineCode> বসায়। এতে আগের state drop না
            হওয়া পর্যন্ত আমরা ownership ধরে রাখতে পারি।
          </li>
          <li>
            <InlineCode>Draft::request_review</InlineCode> — নতুন{" "}
            <InlineCode>PendingReview</InlineCode> return।
          </li>
          <li>
            <InlineCode>PendingReview::request_review</InlineCode> —{" "}
            <InlineCode>self</InlineCode> return; idempotent।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">approve method</h2>
        <CodeBlock
          lang="rust"
          code={`impl Post {
    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Draft::approve</InlineCode> — নিজেকে return; draft
            সরাসরি approve হয় না।
          </li>
          <li>
            <InlineCode>PendingReview::approve</InlineCode> —{" "}
            <InlineCode>Published</InlineCode>।
          </li>
          <li>
            <InlineCode>Published::*</InlineCode> — দুই-ই self return;
            idempotent।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">content method-কে state-aware করা</h2>
        <CodeBlock
          lang="rust"
          code={`impl Post {
    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }
}`}
        />
        <CodeBlock
          lang="rust"
          code={`trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;

    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
}`}
        />
        <p>
          Default <InlineCode>content</InlineCode> empty string return করে —{" "}
          <InlineCode>Draft</InlineCode> আর <InlineCode>PendingReview</InlineCode>{" "}
          এই default-ই use করে। শুধু{" "}
          <InlineCode>Published</InlineCode> override করে actual content
          ফেরত দেয়। Lifetime <InlineCode>'a</InlineCode>{" "}
          return-করা reference-কে <InlineCode>post</InlineCode> parameter-এর
          সাথে tie করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই pattern-এর সুবিধা</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            State-specific behaviour সংশ্লিষ্ট state struct-এ encapsulated।
          </li>
          <li>
            <InlineCode>Post</InlineCode> জানে না কোন state এখন active —
            transition state নিজেই handle করে।
          </li>
          <li>
            নতুন state add করতে গেলে{" "}
            <InlineCode>match</InlineCode> দিয়ে সব জায়গায় code edit-এর দরকার
            নেই — শুধু নতুন struct + trait impl।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">বিকল্প — state-as-type</h2>
        <p>
          Rust-এর type system invalid state compile-time-এ অসম্ভব করে দিতে পারে।
          প্রত্যেক state-এর জন্য আলাদা type:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}`}
        />
        <p>
          লক্ষণীয় — <InlineCode>DraftPost</InlineCode>-এ{" "}
          <InlineCode>content</InlineCode> method <strong>নেই</strong>। তাই
          draft-এর content পড়ার চেষ্টা compile error দেবে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Type transformation দিয়ে transition</h3>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost {
            content: self.content,
        }
    }
}

pub struct PendingReviewPost {
    content: String,
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post {
            content: self.content,
        }
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Method <InlineCode>self</InlineCode> consume করে নতুন type return
            করে।
          </li>
          <li>
            <InlineCode>DraftPost::request_review</InlineCode> →{" "}
            <InlineCode>PendingReviewPost</InlineCode>।
          </li>
          <li>
            <InlineCode>PendingReviewPost::approve</InlineCode> →{" "}
            <InlineCode>Post</InlineCode>।
          </li>
          <li>
            Workflow path enforced — Draft → PendingReview → Published; এর
            বাইরে যাওয়াই অসম্ভব।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">নতুন main</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");

    let post = post.request_review();

    let post = post.approve();

    assert_eq!("I ate a salad for lunch today", post.content());
}`}
        />
        <p>
          Shadowing <InlineCode>let post = ...</InlineCode> দিয়ে variable নতুন
          type-এ rebind। Draft বা pending review-তে{" "}
          <InlineCode>post.content()</InlineCode> call করলে compile error।
        </p>

        <h2 class="mt-10 text-2xl font-bold">দুই approach তুলনা</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>Trait object pattern</strong> — state hidden,{" "}
            <InlineCode>Post</InlineCode> single type, runtime check; नया state
            যোগ করা সহজ।
          </li>
          <li>
            <strong>Type encoding</strong> — invalid usage compile-time-এ
            অসম্ভব, কিন্তু state visible এবং নতুন state add করতে refactor বেশি
            লাগে।
          </li>
          <li>
            <strong>Enum?</strong> — সম্ভব, কিন্তু সব জায়গায়{" "}
            <InlineCode>match</InlineCode> ছড়িয়ে পড়ে; নতুন variant add
            করলে অনেক জায়গায় edit।
          </li>
        </ul>
        <p>
          Rust-এ type-encoding বেশি idiomatic — bug compile-time-এ ধরা পড়ে।
          কিন্তু কোনটা ভালো সেটা নির্ভর করে problem-এর প্রকৃতি ও extensibility
          requirement-এর উপর।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            State pattern — value-র behaviour internal state-এ পরিবর্তিত হয়;
            Rust-এ trait object দিয়ে সরাসরি implement।
          </li>
          <li>
            <InlineCode>self: Box&lt;Self&gt;</InlineCode> +{" "}
            <InlineCode>Option::take()</InlineCode> — state struct ownership
            move করে replace।
          </li>
          <li>
            Default trait method শুধু কিছু variant-এ override — code repetition
            কমায়।
          </li>
          <li>
            Rust-এর type system দিয়ে state-as-type — invalid path compile-time-এ
            block।
          </li>
          <li>
            Two approach-ই trade-off-এ আসে; choose by extensibility vs
            compile-time guarantee।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৮.৩: Object-Oriented design pattern · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Blog workflow দিয়ে state pattern — trait object-এ classical implementation এবং type-encoding-এ Rust-idiomatic বিকল্প।",
    },
  ],
};
