import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch09-02-recoverable-errors-with-result";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৯.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Result দিয়ে recoverable error
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Recoverable Errors with Result
        </p>
        <p class="mt-3">
          বেশিরভাগ error program-কে পুরোপুরি crash করার মতো না — file না পাওয়া,
          permission denied, network down — এদের handle করে এগিয়ে যাওয়া যায়।{" "}
          <InlineCode>Result&lt;T, E&gt;</InlineCode> এই কাজ করে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Result&lt;T, E&gt;</h2>
        <CodeBlock
          lang="rust"
          code={`enum Result<T, E> {
    Ok(T),
    Err(E),
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li><InlineCode>T</InlineCode> = success value-এর type।</li>
          <li><InlineCode>E</InlineCode> = error value-এর type।</li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">File::open — match দিয়ে handle</h2>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {error:?}"),
    };
}`}
        />
        <p>
          <InlineCode>File::open</InlineCode>{" "}
          <InlineCode>Result&lt;File, io::Error&gt;</InlineCode> return করে।
          Match-এ Ok হলে file নিচ্ছি, Err হলে panic।
        </p>

        <h2 class="mt-10 text-2xl font-bold">আলাদা error-এ আলাদা response</h2>
        <p>
          File না থাকলে create করো, অন্য error হলে panic — nested match:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {e:?}"),
            },
            _ => {
                panic!("Problem opening the file: {error:?}");
            }
        },
    };
}`}
        />
        <p>
          Verbose। Closure-based alternative — Chapter 13-এ closure বিস্তারিত,
          আপাতত preview:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Problem creating the file: {error:?}");
            })
        } else {
            panic!("Problem opening the file: {error:?}");
        }
    });
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">unwrap এবং expect — shortcut</h2>
        <p>
          <InlineCode>.unwrap()</InlineCode> — Ok হলে value, Err হলে panic
          (default message সহ):
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap();
}`}
        />
        <p>
          <InlineCode>.expect("...")</InlineCode> — same behavior, কিন্তু
          custom panic message:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt")
        .expect("hello.txt should be included in this project");
}`}
        />
        <p>
          Production code-এ <InlineCode>expect</InlineCode> preferred —
          message-এ context থাকে কেন এই error সম্ভব না।
        </p>

        <h2 class="mt-10 text-2xl function-bold">Error propagate করা</h2>
        <p>
          Error caller-এর কাছে পাঠাও — caller decide করুক কী করবে। Manual
          version:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let username_file_result = File::open("hello.txt");

    let mut username_file = match username_file_result {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">? operator — propagation-এর shortcut</h2>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}`}
        />
        <p>
          <InlineCode>?</InlineCode> behavior:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>Ok হলে — value extract করে statement-এ বসায়।</li>
          <li>Err হলে — function থেকে immediate <InlineCode>return Err(...)</InlineCode>।</li>
        </ul>
        <p>
          <InlineCode>?</InlineCode> match-এর চেয়ে কিছু বেশি করে — error type-এ{" "}
          <InlineCode>From::from</InlineCode> apply করে। তাই এক type-এর error
          অন্য type-এ automatic convert হয় (যদি{" "}
          <InlineCode>From</InlineCode> implement করা থাকে)।
        </p>

        <h3 class="mt-6 text-xl font-bold">Method chain সহ ?</h3>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();

    File::open("hello.txt")?.read_to_string(&mut username)?;

    Ok(username)
}`}
        />
        <p>আরো ছোট — <InlineCode>fs::read_to_string</InlineCode>:</p>
        <CodeBlock
          lang="rust"
          code={`use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">? কোথায় use করা যায়</h2>
        <p>
          <InlineCode>?</InlineCode> use করতে হলে enclosing function-এর return
          type compatible হতে হবে — সাধারণত:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li><InlineCode>Result&lt;T, E&gt;</InlineCode> return করে।</li>
          <li><InlineCode>Option&lt;T&gt;</InlineCode> return করে।</li>
          <li>
            <InlineCode>FromResidual</InlineCode> implement-করা type return
            করে।
          </li>
        </ul>
        <p>না হলে compile error:</p>
        <CodeBlock
          lang="rust"
          code={`use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt")?;
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0277]: the \`?\` operator can only be used in a function that returns \`Result\` or \`Option\` (or another type that implements \`FromResidual\`)`}
        />

        <h3 class="mt-6 text-xl font-bold">? Option-এ</h3>
        <CodeBlock
          lang="rust"
          code={`fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}

fn main() {
    assert_eq!(
        last_char_of_first_line("Hello, world\\nHow are you today?"),
        Some('d')
    );

    assert_eq!(last_char_of_first_line(""), None);
    assert_eq!(last_char_of_first_line("\\nhi"), None);
}`}
        />
        <p>
          Option-এ <InlineCode>?</InlineCode> — <InlineCode>None</InlineCode>{" "}
          হলে immediate return None; <InlineCode>Some</InlineCode> হলে value
          extract।
        </p>
        <p>
          Result আর Option <InlineCode>?</InlineCode> দিয়ে directly mix করা
          যায় না — <InlineCode>.ok()</InlineCode> বা{" "}
          <InlineCode>.ok_or(...)</InlineCode> দিয়ে explicit convert করতে
          হয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">main()-এ Result return</h2>
        <CodeBlock
          lang="rust"
          code={`use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let greeting_file = File::open("hello.txt")?;

    Ok(())
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Box&lt;dyn Error&gt;</InlineCode> — যেকোনো Error
            type-এর trait object।
          </li>
          <li>
            <InlineCode>Ok(())</InlineCode> — exit code 0;{" "}
            <InlineCode>Err(...)</InlineCode> — non-zero (C-convention)।
          </li>
          <li>main-এ <InlineCode>?</InlineCode> use করতে এই signature দরকার।</li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Result&lt;T, E&gt;</InlineCode> = Ok(T) বা Err(E)।
          </li>
          <li>
            Match দিয়ে handle, <InlineCode>error.kind()</InlineCode> দিয়ে
            specific case।
          </li>
          <li>
            <InlineCode>.unwrap()</InlineCode> default panic;{" "}
            <InlineCode>.expect("...")</InlineCode> custom message। Production-এ{" "}
            <InlineCode>expect</InlineCode> preferred।
          </li>
          <li>
            <InlineCode>?</InlineCode> = Ok value বা Err early-return; auto
            From conversion।
          </li>
          <li>
            <InlineCode>?</InlineCode> Result-returning function-এ; Option-এও
            কাজ করে; main-এ চাইলে <InlineCode>fn main() -&gt; Result&lt;(), Box&lt;dyn Error&gt;&gt;</InlineCode>
            ।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৯.২: Result দিয়ে recoverable error · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Result<T,E>, match handling, unwrap/expect, ? operator, এবং main()-এ error propagation।",
    },
  ],
};
