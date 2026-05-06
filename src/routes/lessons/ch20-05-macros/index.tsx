import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch20-05-macros";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২০.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Macro</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Macros</p>
        <p class="mt-3">
          <strong>Macro</strong> মানে — code লেখার জন্য code।{" "}
          <em>metaprogramming</em>। Rust-এ macro দু'ধরনের:
        </p>
        <ol class="ml-6 list-decimal space-y-2 mt-3">
          <li>
            <strong>Declarative macro</strong> —{" "}
            <InlineCode>macro_rules!</InlineCode>।
          </li>
          <li>
            <strong>Procedural macro</strong> — তিন রকম: custom{" "}
            <InlineCode>derive</InlineCode>, attribute-like, function-like।
          </li>
        </ol>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Macro বনাম function</h2>
        <p>Macro-র সুবিধা:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Variable number of argument —{" "}
            <InlineCode>println!("hello")</InlineCode> এবং{" "}
            <InlineCode>println!("hello {}", name)</InlineCode> দু'টোই কাজ করে।
          </li>
          <li>
            Compile-এর আগে expand হয় — তাই trait implement-ও করতে পারে, যেটা
            function পারে না।
          </li>
          <li>Pattern-ভিত্তিক code generate।</li>
        </ul>
        <p>সীমাবদ্ধতা:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>Definition function-এর চেয়ে জটিল।</li>
          <li>পড়া, বুঝা, maintain করা কঠিন।</li>
          <li>
            Function-এর মতো যেখান থেকে সেখান থেকে call হয় না — call করার আগে
            scope-এ আসতে হবে।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">
          Declarative macro — <InlineCode>macro_rules!</InlineCode>
        </h2>
        <p>
          এদের বলে "macros by example" — pattern match করে replacement code
          দেয়। সরলীকৃত <InlineCode>vec!</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}`}
        />
        <p>Pattern parts:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>#[macro_export]</InlineCode> — crate-এর বাইরে use-এর
            জন্য available।
          </li>
          <li>
            <InlineCode>$</InlineCode> — macro variable শুরু।
          </li>
          <li>
            <InlineCode>$x:expr</InlineCode> — যেকোনো Rust expression match করো,
            তাকে <InlineCode>$x</InlineCode> নাম দাও।
          </li>
          <li>
            <InlineCode>$( ... ),*</InlineCode> — comma-separated, zero বা more
            repetition।
          </li>
        </ul>
        <p>
          <InlineCode>vec![1, 2, 3]</InlineCode> এই code-এ expand হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`{
    let mut temp_vec = Vec::new();
    temp_vec.push(1);
    temp_vec.push(2);
    temp_vec.push(3);
    temp_vec
}`}
        />
        <p>
          Replacement-এর <InlineCode>$()*</InlineCode> প্রতিটা matched
          pattern-এর জন্য একবার generate করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Procedural macro</h2>
        <p>
          Procedural macro <em>code</em> input হিসেবে নেয়, প্রক্রিয়া করে, এবং{" "}
          <em>code</em> output দেয় — pattern matching না, Rust code-এ
          processing।
        </p>
        <CodeBlock
          lang="rust"
          code={`use proc_macro::TokenStream;

#[some_attribute]
pub fn some_name(input: TokenStream) -> TokenStream {
}`}
        />
        <p>মূল ব্যাপার:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>TokenStream</InlineCode> — token-এর sequence।
          </li>
          <li>
            নিজের আলাদা crate লাগে; <InlineCode>Cargo.toml</InlineCode>-এ{" "}
            <InlineCode>proc-macro = true</InlineCode>।
          </li>
          <li>
            সাহায্যকারী crate — <InlineCode>syn</InlineCode> (parse),{" "}
            <InlineCode>quote</InlineCode> (generate),{" "}
            <InlineCode>proc_macro</InlineCode> (compiler API)।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Custom derive macro</h2>
        <p>
          User struct/enum-এ <InlineCode>#[derive(...)]</InlineCode> দিয়ে trait
          auto-implement করানো। উদাহরণ — <InlineCode>HelloMacro</InlineCode>{" "}
          trait।
        </p>
        <p>Trait definition crate (<InlineCode>hello_macro</InlineCode>):</p>
        <CodeBlock
          lang="rust"
          code={`pub trait HelloMacro {
    fn hello_macro();
}`}
        />
        <p>
          Procedural macro crate (<InlineCode>hello_macro_derive</InlineCode>) —{" "}
          <InlineCode>Cargo.toml</InlineCode>:
        </p>
        <CodeBlock
          lang="toml"
          code={`[lib]
proc-macro = true

[dependencies]
syn = "2.0"
quote = "1.0"`}
        />
        <p>Macro definition:</p>
        <CodeBlock
          lang="rust"
          code={`use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    let ast = syn::parse(input).unwrap();
    impl_hello_macro(&ast)
}

fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let generated = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    generated.into()
}`}
        />
        <p>লক্ষ করো:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>syn::parse</InlineCode>{" "}
            <InlineCode>TokenStream</InlineCode>-কে{" "}
            <InlineCode>DeriveInput</InlineCode>-এ পার্স করে।
          </li>
          <li>
            <InlineCode>quote!</InlineCode> — template; <InlineCode>#name</InlineCode>{" "}
            substitution।
          </li>
          <li>
            <InlineCode>stringify!</InlineCode> — compile-time-এ identifier
            স্ট্রিং literal-এ।
          </li>
        </ul>
        <p>User code:</p>
        <CodeBlock
          lang="rust"
          code={`use hello_macro::HelloMacro;
use hello_macro_derive::HelloMacro;

#[derive(HelloMacro)]
struct Pancakes;

fn main() {
    Pancakes::hello_macro();
}`}
        />
        <p>
          Output: <InlineCode>Hello, Macro! My name is Pancakes!</InlineCode>
        </p>

        <h2 class="mt-10 text-2xl font-bold">Attribute-like macro</h2>
        <p>
          Custom derive-এর মতো, কিন্তু শুধু struct/enum না — যেকোনো item-এ
          attribute হিসেবে বসানো যায়। যেমন একটা web framework-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`#[route(GET, "/")]
fn index() {`}
        />
        <p>Definition signature:</p>
        <CodeBlock
          lang="rust"
          code={`#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>attr</InlineCode> — attribute-এর content (<InlineCode>GET, "/"</InlineCode>
            )।
          </li>
          <li>
            <InlineCode>item</InlineCode> — যেই item-এ attribute (এখানে{" "}
            <InlineCode>fn index() {`{}`}</InlineCode>)।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Function-like macro</h2>
        <p>
          Function call-এর মতো দেখতে, কিন্তু{" "}
          <InlineCode>macro_rules!</InlineCode>-এর চেয়ে flexible — token stream-এ
          arbitrary processing। যেমন একটা SQL macro:
        </p>
        <CodeBlock
          lang="rust"
          code={`let sql = sql!(SELECT * FROM posts WHERE id=1);`}
        />
        <p>Definition:</p>
        <CodeBlock
          lang="rust"
          code={`#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {
    // TokenStream-এ SQL parse ও validate
}`}
        />
        <p>
          এর সুবিধা — pattern matching-এ সীমাবদ্ধ না; arbitrary Rust code দিয়ে
          input process করতে পারো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Macro = code-generating code; declarative ও procedural দু'রকম।
          </li>
          <li>
            <InlineCode>macro_rules!</InlineCode> — pattern matching-ভিত্তিক;
            variadic ও repetition (<InlineCode>$()*</InlineCode>) সমর্থন করে।
          </li>
          <li>
            Procedural macro — আলাদা crate-এ;{" "}
            <InlineCode>TokenStream</InlineCode>-এ arbitrary processing।
          </li>
          <li>
            তিন ধরনের procedural — <InlineCode>derive</InlineCode> (trait
            auto-implement), attribute-like (নতুন attribute), function-like
            (call-like syntax)।
          </li>
          <li>
            <InlineCode>syn</InlineCode> দিয়ে parse;{" "}
            <InlineCode>quote</InlineCode> দিয়ে output template;{" "}
            <InlineCode>stringify!</InlineCode> identifier-কে স্ট্রিং করে।
          </li>
          <li>
            Function-এ যা সম্ভব না — yet code generate করা প্রয়োজন — সেখানে
            macro; বাকি ক্ষেত্রে সাধারণ function ভালো।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২০.৫: Macro · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ macro_rules! declarative macro এবং তিন রকম procedural macro — derive, attribute, function।",
    },
  ],
};
