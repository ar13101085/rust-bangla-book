import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch12-05-working-with-environment-variables";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১২.৫
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Environment variable নিয়ে কাজ
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Working with Environment Variables
        </p>
        <p class="mt-3">
          এখন <InlineCode>minigrep</InlineCode>-এ case-insensitive search যোগ
          করব। User <InlineCode>IGNORE_CASE</InlineCode> environment variable
          set করে দিলে সব search case-insensitive হবে — terminal session-এ
          একবার set করলেই হবে।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Failing test প্রথমে</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}`}
        />
        <p>
          আগের test-এর নাম এখন <InlineCode>case_sensitive</InlineCode>। নতুন{" "}
          <InlineCode>case_insensitive</InlineCode> — query "rUsT" দিয়ে "Rust:"
          এবং "Trust me." দু'টোই match হওয়ার expectation।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Implementation</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>query.to_lowercase()</InlineCode> নতুন{" "}
            <InlineCode>String</InlineCode> বানায় — original{" "}
            <InlineCode>&str</InlineCode>-কে shadow করে।
          </li>
          <li>
            <InlineCode>line.to_lowercase().contains(&query)</InlineCode> —{" "}
            <InlineCode>contains</InlineCode> <InlineCode>&str</InlineCode>{" "}
            চায়, তাই <InlineCode>&query</InlineCode>।
          </li>
          <li>
            <InlineCode>to_lowercase()</InlineCode> basic Unicode handle করে,
            কিন্তু সব edge case 100% accurate না।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Config-এ ignore_case field</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">env::var দিয়ে variable read</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`use std::env;

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>env::var("IGNORE_CASE")</InlineCode>{" "}
            <InlineCode>Result&lt;String, VarError&gt;</InlineCode> দেয়।
          </li>
          <li>
            <InlineCode>.is_ok()</InlineCode> — variable set থাকলে true (value
            যাই হোক), না থাকলে false। আমাদের শুধু presence/absence দরকার।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">run-এ branch</h2>
        <CodeBlock
          lang="rust"
          code={`pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
        println!("{line}");
    }

    Ok(())
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Test করা</h2>
        <p>সাধারণ (case-sensitive):</p>
        <CodeBlock
          lang="bash"
          code={`$ cargo run -- to poem.txt
Are you nobody, too?
How dreary to be somebody!`}
        />
        <p>IGNORE_CASE set করে:</p>
        <CodeBlock
          lang="bash"
          code={`$ IGNORE_CASE=1 cargo run -- to poem.txt
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!`}
        />
        <p>PowerShell-এ:</p>
        <CodeBlock
          lang="powershell"
          code={`PS> $Env:IGNORE_CASE=1; cargo run -- to poem.txt
PS> Remove-Item Env:IGNORE_CASE  # unset`}
        />

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>std::env::var("NAME")</InlineCode> +{" "}
            <InlineCode>.is_ok()</InlineCode> — environment variable presence
            check।
          </li>
          <li>
            <InlineCode>to_lowercase()</InlineCode> — Unicode-aware lowercase;
            new String।
          </li>
          <li>
            CLI flag-এর বদলে env var দিয়ে behavior switch — useful pattern।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১২.৫: Environment variable নিয়ে কাজ · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "minigrep-এ env::var দিয়ে IGNORE_CASE flag এবং case-insensitive search।",
    },
  ],
};
