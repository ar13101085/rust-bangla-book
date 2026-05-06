import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch13-03-improving-our-io-project";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৩.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          আমাদের I/O Project উন্নত করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Improving Our I/O Project
        </p>
        <p class="mt-3">
          Chapter 12-এর <InlineCode>minigrep</InlineCode>-কে iterator দিয়ে
          refactor করব — কম clone, কম mutable state, পরিষ্কার code।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Config::build-এ clone সরানো</h2>
        <p>আগের signature:</p>
        <CodeBlock
          lang="rust"
          code={`fn build(args: &[String]) -> Result<Config, &'static str> {
    if args.len() < 3 {
        return Err("not enough arguments");
    }

    let query = args[1].clone();
    let file_path = args[2].clone();

    let ignore_case = env::var("IGNORE_CASE").is_ok();

    Ok(Config { query, file_path, ignore_case })
}`}
        />
        <p>
          Slice থেকে owned <InlineCode>String</InlineCode> পেতে{" "}
          <InlineCode>.clone()</InlineCode> করতে হচ্ছিল। Iterator নিলে এটা
          এড়ানো যায় — iterator owned value direct দেয়।
        </p>

        <h3 class="mt-6 text-xl font-bold">main-এ iterator pass</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let config = Config::build(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}`}
        />
        <p>
          আগে <InlineCode>env::args().collect()</InlineCode> দিয়ে Vec
          বানিয়ে slice pass করতাম। এখন iterator সরাসরি।
        </p>

        <h3 class="mt-6 text-xl font-bold">Config::build নতুন form</h3>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config { query, file_path, ignore_case })
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>impl Iterator&lt;Item = String&gt;</InlineCode> — যেকোনো
            String iterator accept।
          </li>
          <li>
            <InlineCode>mut args</InlineCode> — <InlineCode>next()</InlineCode>{" "}
            mutate করে।
          </li>
          <li>
            প্রথম <InlineCode>args.next()</InlineCode> — program name skip।
          </li>
          <li>
            <InlineCode>match</InlineCode> দিয়ে missing argument-এ proper error
            message।
          </li>
          <li>
            Iterator <em>owned</em> value দিচ্ছে — <InlineCode>clone</InlineCode>{" "}
            লাগছে না!
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">search — iterator adapter দিয়ে</h2>
        <p>আগের loop-based version:</p>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}`}
        />
        <p>Adapter chain দিয়ে — এক expression-এ:</p>
        <CodeBlock
          lang="rust"
          code={`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}`}
        />
        <p>সুবিধা:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li>একটামাত্র expression — পড়তে সহজ।</li>
          <li>Mutable <InlineCode>results</InlineCode> Vec লাগছে না।</li>
          <li>
            Code level এখন "filter where line contains query" — implementation
            detail-এ মাথা ঘামাতে হচ্ছে না।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Loop নাকি iterator?</h2>
        <p>
          বেশিরভাগ Rust developer iterator-style প্রেফার করে — code intent-কে
          সরাসরি প্রকাশ করে, boilerplate বাদ। কিন্তু দুটোই functionally
          equivalent।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>impl Iterator&lt;Item = T&gt;</InlineCode> parameter
            type — যেকোনো iterator accept।
          </li>
          <li>
            Iterator-এর <InlineCode>next()</InlineCode> owned value দেয় — clone
            লাগে না।
          </li>
          <li>
            <InlineCode>filter</InlineCode> + <InlineCode>collect</InlineCode>{" "}
            দিয়ে loop-replace।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৩.৩: I/O Project উন্নত করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "minigrep refactor — Iterator parameter দিয়ে clone সরানো এবং filter/collect দিয়ে search সরল করা।",
    },
  ],
};
