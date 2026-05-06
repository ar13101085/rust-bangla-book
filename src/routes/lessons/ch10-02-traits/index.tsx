import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch10-02-traits";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১০.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Trait দিয়ে shared behavior define করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Defining Shared Behavior with Traits
        </p>
        <p class="mt-3">
          <strong>Trait</strong> বলে দেয় — কোনো type-এর কী method থাকা চাই।
          একাধিক type একই behavior provide করলে তাদের generic code-এ একসাথে
          handle করা যায়। অন্য language-এ এটাকে <em>interface</em> বলে — কিন্তু
          Rust-এ কিছু পার্থক্য আছে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Trait define করা</h2>
        <p>
          ধরো — একটা media aggregator library; <InlineCode>NewsArticle</InlineCode>{" "}
          ও <InlineCode>SocialPost</InlineCode> দু'টা struct, দু'টোতেই একটা
          summary দরকার। Trait দিয়ে এই common behavior:
        </p>
        <CodeBlock
          lang="rust"
          code={`pub trait Summary {
    fn summarize(&self) -> String;
}`}
        />
        <p>
          <InlineCode>trait</InlineCode> keyword + নাম + body-তে method
          signature। শেষে semicolon — body নেই, prototype-only। প্রতিটা
          implementing type নিজের body দেবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Trait implement করা</h2>
        <CodeBlock
          lang="rust"
          code={`pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct SocialPost {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub repost: bool,
}

impl Summary for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}`}
        />
        <p>Syntax — <InlineCode>impl TraitName for TypeName</InlineCode>।</p>
        <p>Use:</p>
        <CodeBlock
          lang="rust"
          code={`use aggregator::{SocialPost, Summary};

fn main() {
    let post = SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    };

    println!("1 new post: {}", post.summarize());
}`}
        />
        <p>
          Output: <InlineCode>1 new post: horse_ebooks: of course...</InlineCode>
        </p>

        <h3 class="mt-6 text-xl font-bold">Orphan rule</h3>
        <p>
          Trait implement করতে — <em>trait টা</em> বা <em>type টা</em> অন্তত
          একটা তোমার crate-এর local হতে হবে।
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            ✅ Standard library-র <InlineCode>Display</InlineCode> trait
            তোমার <InlineCode>SocialPost</InlineCode>-এ implement।
          </li>
          <li>
            ✅ তোমার <InlineCode>Summary</InlineCode> trait{" "}
            <InlineCode>Vec&lt;T&gt;</InlineCode>-এ implement।
          </li>
          <li>
            ❌ <InlineCode>Display</InlineCode> trait{" "}
            <InlineCode>Vec&lt;T&gt;</InlineCode>-এ implement (দু'টোই
            external)।
          </li>
        </ul>
        <p>
          এই rule-কে বলে <strong>coherence</strong> — অন্যের code তোমার break
          করতে পারবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Default implementation</h2>
        <p>Trait-এ default body দেওয়া যায়:</p>
        <CodeBlock
          lang="rust"
          code={`pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}`}
        />
        <p>Type override না করে default-ই use করতে পারে — empty impl block:</p>
        <CodeBlock
          lang="rust"
          code={`impl Summary for NewsArticle {}`}
        />
        <p>
          এখন <InlineCode>article.summarize()</InlineCode> কল করলে{" "}
          <InlineCode>"(Read more...)"</InlineCode>।
        </p>

        <h3 class="mt-6 text-xl font-bold">Default — অন্য method call করতে পারে</h3>
        <CodeBlock
          lang="rust"
          code={`pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

impl Summary for SocialPost {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}`}
        />
        <p>
          <InlineCode>summarize_author</InlineCode> required (no default);{" "}
          <InlineCode>summarize</InlineCode> default-এ সেটাই call করে।
          Implementing type শুধু <InlineCode>summarize_author</InlineCode>{" "}
          provide করলেই হবে।
        </p>
        <p>
          Note: override-এ default implementation call করা যায় না — override
          মানে পুরোপুরি replace।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Trait parameter — impl Trait</h2>
        <CodeBlock
          lang="rust"
          code={`pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}`}
        />
        <p>
          <InlineCode>&impl Summary</InlineCode> = "যেকোনো type যা Summary
          implement করে"। Function-এর body-তে শুধু Summary-র method call করা
          যাবে।
        </p>
        <p>এটা আসলে syntax sugar — পুরো form trait bound:</p>
        <CodeBlock
          lang="rust"
          code={`pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}`}
        />
        <p>একই কাজ। কখন কোনটা?</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>Simple, single param — <InlineCode>impl Trait</InlineCode> concise।</li>
          <li>Complex bound, multiple param — trait bound স্পষ্ট।</li>
        </ul>
        <p>একাধিক parameter-এ পার্থক্য:</p>
        <CodeBlock
          lang="rust"
          code={`// item1 আর item2 আলাদা type হতে পারে (দু'জনই Summary):
pub fn notify(item1: &impl Summary, item2: &impl Summary) {}

// item1 আর item2 একই concrete type হতে হবে:
pub fn notify<T: Summary>(item1: &T, item2: &T) {}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Multiple trait bound — +</h2>
        <CodeBlock
          lang="rust"
          code={`pub fn notify(item: &(impl Summary + Display)) {
    println!("Breaking news! {}", item.summarize());
}

// বা trait bound form:
pub fn notify<T: Summary + Display>(item: &T) {
    println!("Breaking news! {}", item.summarize());
    println!("Item: {}", item);
}`}
        />
        <p>
          <InlineCode>+</InlineCode> দিয়ে একাধিক trait combine — দুটোই থাকতে
          হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">where clause — পরিষ্কার syntax</h2>
        <p>একাধিক generic + একাধিক bound হলে inline সংস্করণ গাদাগাদি:</p>
        <CodeBlock
          lang="rust"
          code={`fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {
    unimplemented!()
}`}
        />
        <p>
          <InlineCode>where</InlineCode> দিয়ে পরিষ্কার:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    unimplemented!()
}`}
        />
        <p>
          Function name, parameter, return type পাশাপাশি — পড়তে অনেক সহজ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Return type-এ impl Trait</h2>
        <CodeBlock
          lang="rust"
          code={`fn returns_summarizable() -> impl Summary {
    SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    }
}`}
        />
        <p>
          Caller-কে concrete type জানাতে হবে না, শুধু trait জানলেই হলো। Closure
          আর iterator-এ এর use case সবচেয়ে বেশি (Chapter 13)।
        </p>
        <p>
          সীমাবদ্ধতা — শুধু একটাই concrete type return করা যাবে। নিচের code{" "}
          <em>কাজ করবে না</em>:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        NewsArticle { /* ... */ }
    } else {
        SocialPost { /* ... */ }
    }
}`}
        />
        <p>
          Compile error — কারণ <InlineCode>impl Summary</InlineCode> single
          concrete type expect করে। দু'রকম type return করতে চাইলে{" "}
          <strong>trait object</strong> (Chapter 18) দরকার।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Conditional method — bound-যুক্ত impl</h2>
        <CodeBlock
          lang="rust"
          code={`use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}`}
        />
        <p>
          <InlineCode>Pair&lt;T&gt;</InlineCode> সবসময়{" "}
          <InlineCode>new</InlineCode> পায়। কিন্তু{" "}
          <InlineCode>cmp_display</InlineCode> শুধু সেইসব T-এ থাকবে যাদের
          Display ও PartialOrd আছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Blanket implementation</h2>
        <p>
          Trait-কে শর্তসহ যেকোনো type-এ implement করা যায় — একে বলে{" "}
          <strong>blanket impl</strong>। Standard library প্রচুর use করে।
          যেমন:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl<T: Display> ToString for T {
    // ...
}`}
        />
        <p>
          এই blanket-এর জন্য — যেকোনো type যা <InlineCode>Display</InlineCode>{" "}
          implement করে, সেটায় <InlineCode>.to_string()</InlineCode> available।
          তাই <InlineCode>3.to_string()</InlineCode> কাজ করে — i32-এ Display
          আছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>trait Name {`{ ... }`}</InlineCode> দিয়ে define;{" "}
            <InlineCode>impl Trait for Type</InlineCode> দিয়ে implement।
          </li>
          <li>
            Default implementation দেওয়া যায়; trait-এর অন্য method-ও call করতে
            পারে।
          </li>
          <li>
            Orphan rule — trait বা type, একটা local হতে হবে।
          </li>
          <li>
            <InlineCode>impl Trait</InlineCode> argument/return-এ; trait bound{" "}
            <InlineCode>&lt;T: Trait&gt;</InlineCode>; <InlineCode>+</InlineCode>{" "}
            multiple bound; <InlineCode>where</InlineCode> clause clean।
          </li>
          <li>
            Conditional impl — <InlineCode>impl&lt;T: Bound&gt; Type&lt;T&gt;</InlineCode>{" "}
            দিয়ে শর্তসাপেক্ষ method।
          </li>
          <li>
            Blanket impl — generic-যুক্ত impl যেকোনো T-এ apply।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১০.২: Trait দিয়ে shared behavior · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ trait define ও implement, default implementation, trait bound, where clause, এবং blanket impl।",
    },
  ],
};
