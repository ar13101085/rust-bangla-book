import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-03-improving-error-handling-and-modularity";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Modularity এবং error handling-এর জন্য refactor
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Refactoring to Improve Modularity and Error Handling
        </p>
        <p class="mt-3">
          আগের code-এর চারটা সমস্যা — main-এ অনেক কাজ; config + logic
          মিশ্রিত; error message generic; argument validation নেই। ধাপে ধাপে fix
          করি।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Step 1 — Argument parser আলাদা</h2>
        <CodeBlock
          lang="rust"
          code={`fn parse_config(args: &[String]) -> (&str, &str) {
    let query = &args[1];
    let file_path = &args[2];
    (query, file_path)
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 2 — Config struct</h2>
        <p>Tuple-এর জায়গায় named field-এর struct:</p>
        <CodeBlock
          lang="rust"
          code={`struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn new(args: &[String]) -> Config {
        let query = args[1].clone();
        let file_path = args[2].clone();
        Config { query, file_path }
    }
}`}
        />
        <p>
          <InlineCode>.clone()</InlineCode> use করছি simplicity-র জন্য —
          performance critical না হলে ঠিক আছে। Lifetime সামলানোর চেয়ে easier।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 3 — Result return</h2>
        <p>
          panic-এর জায়গায় <InlineCode>Result</InlineCode>; convention অনুযায়ী{" "}
          <InlineCode>new</InlineCode>-এর জায়গায় <InlineCode>build</InlineCode>{" "}
          (যেহেতু fail করতে পারে):
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }
        let query = args[1].clone();
        let file_path = args[2].clone();
        Ok(Config { query, file_path })
    }
}`}
        />
        <p>main-এ unwrap_or_else দিয়ে handle:</p>
        <CodeBlock
          lang="rust"
          code={`use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // ...
}`}
        />
        <p>
          <InlineCode>process::exit(1)</InlineCode> non-zero status code দিয়ে
          program-কে immediate বন্ধ করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 4 — run function</h2>
        <CodeBlock
          lang="rust"
          code={`use std::error::Error;

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;
    println!("With text:\\n{contents}");
    Ok(())
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Box&lt;dyn Error&gt;</InlineCode> — যেকোনো error type
            return করতে পারে।
          </li>
          <li>
            <InlineCode>?</InlineCode> operator caller-এ error pass করে।
          </li>
        </ul>
        <p>main-এ:</p>
        <CodeBlock
          lang="rust"
          code={`if let Err(e) = run(config) {
    println!("Application error: {e}");
    process::exit(1);
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 5 — lib.rs / main.rs split</h2>
        <p>
          Logic-কে testable করতে <InlineCode>src/lib.rs</InlineCode>-এ সরাও।{" "}
          <InlineCode>src/main.rs</InlineCode>-এ শুধু CLI orchestration।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }
        let query = args[1].clone();
        let file_path = args[2].clone();
        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;
    println!("With text:\\n{contents}");
    Ok(())
}`}
        />
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::env;
use std::process;

use minigrep::Config;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        println!("Application error: {e}");
        process::exit(1);
    }
}`}
        />
        <p>
          লক্ষ্য — <InlineCode>pub</InlineCode> দিতে হলো (struct, field,
          function, build সবকিছু) — main-এ অন্য crate হিসেবে use করা হচ্ছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Config-কে struct-এ — separation of concerns।
          </li>
          <li>
            <InlineCode>Config::build</InlineCode> Result return; main{" "}
            <InlineCode>unwrap_or_else</InlineCode> +{" "}
            <InlineCode>process::exit</InlineCode>।
          </li>
          <li>
            Logic-কে <InlineCode>run</InlineCode> function-এ;{" "}
            <InlineCode>Box&lt;dyn Error&gt;</InlineCode>;{" "}
            <InlineCode>?</InlineCode> দিয়ে error propagation।
          </li>
          <li>
            <InlineCode>lib.rs</InlineCode>-এ logic, <InlineCode>main.rs</InlineCode>{" "}
            পাতলা — integration test possible।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.৩: Modularity এবং error handling-এর জন্য refactor · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "minigrep-কে modular করা — Config struct, Result return, run function, এবং lib.rs/main.rs split।",
    },
  ],
};
