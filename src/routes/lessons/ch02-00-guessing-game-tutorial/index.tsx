import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch02-00-guessing-game-tutorial";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          একটি Guessing Game বানানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Programming a Guessing Game
        </p>
        <p class="mt-3">
          এই অধ্যায়ে আমরা একটা ছোট কিন্তু সম্পূর্ণ Rust program বানাব — একটা{" "}
          <em>guessing game</em>। Program ১ থেকে ১০০-এর মধ্যে একটা random
          number বেছে নেবে, তারপর user-কে guess করতে বলবে। guess বড় না ছোট না
          সঠিক — সেটা জানিয়ে দেবে। এই একটা example-এ <InlineCode>let</InlineCode>
          , <InlineCode>match</InlineCode>, function, external crate, error
          handling — অনেক কিছু একসাথে দেখব। পরের অধ্যায়গুলোতে এক একটা concept
          আলাদা করে গভীরে যাব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Project setup</h2>
        <p>
          আগের অধ্যায়ে শেখা <InlineCode>cargo new</InlineCode> দিয়ে নতুন
          project শুরু করো:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo new guessing_game
$ cd guessing_game`}
        />
        <p>
          Cargo যা তৈরি করেছে — <InlineCode>Cargo.toml</InlineCode> এবং{" "}
          <InlineCode>src/main.rs</InlineCode>:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[package]
name = "guessing_game"
version = "0.1.0"
edition = "2024"

[dependencies]`}
        />
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    println!("Hello, world!");
}`}
        />
        <p>
          <InlineCode>cargo run</InlineCode> চালিয়ে দেখো — "Hello, world!" print
          হচ্ছে কিনা। এই অধ্যায়ের সব code আমরা <InlineCode>src/main.rs</InlineCode>
          -এ লিখব, ধাপে ধাপে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">User-এর input নেওয়া</h2>
        <p>
          প্রথমে user-কে একটা guess type করতে দিতে হবে এবং সেটা read করতে হবে।
          নিচের code পুরোটা <InlineCode>src/main.rs</InlineCode>-এ replace করো:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::io;

fn main() {
    println!("Guess the number!");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    println!("You guessed: {guess}");
}`}
        />
        <p>
          এই কয়েকটা line-এ অনেক কিছু চলছে। ভেঙে দেখি।
        </p>

        <h3 class="mt-6 text-xl font-bold">use std::io;</h3>
        <p>
          User input নিতে এবং print করতে standard library-এর{" "}
          <InlineCode>io</InlineCode> module দরকার।{" "}
          <InlineCode>use std::io;</InlineCode> দিয়ে এটাকে scope-এ এনে আনলাম।
        </p>
        <p>
          Rust default-এ একটা ছোট set — <strong>prelude</strong> — সব program-এ
          auto-import করে। এর বাইরে কিছু লাগলে{" "}
          <InlineCode>use</InlineCode> statement দিয়ে explicitly আনতে হয়।
          <InlineCode>std::io</InlineCode> prelude-এ নেই, তাই import করতে হলো।
        </p>

        <h3 class="mt-6 text-xl font-bold">Variable দিয়ে value রাখা</h3>
        <p>User-এর input রাখার জন্য একটা variable লাগবে:</p>
        <CodeBlock
          lang="rust"
          code={`let mut guess = String::new();`}
        />
        <p>
          <InlineCode>let</InlineCode> দিয়ে variable বানাই। Rust-এ variable
          default-এ <strong>immutable</strong> — মান একবার দিলে বদলানো যায় না।
          মান বদলাতে চাইলে <InlineCode>mut</InlineCode> keyword যোগ করতে হয়।
          এখানে user input read করার সময় string-এ append হবে, তাই{" "}
          <InlineCode>mut</InlineCode> দরকার।
        </p>
        <p>
          <InlineCode>String::new()</InlineCode> একটা নতুন, খালি{" "}
          <InlineCode>String</InlineCode> instance return করে।{" "}
          <InlineCode>String</InlineCode> হলো standard library-র UTF-8 encoded,
          growable text type। <InlineCode>::</InlineCode> দিয়ে বোঝানো হচ্ছে{" "}
          <InlineCode>new</InlineCode> হলো <InlineCode>String</InlineCode>{" "}
          type-এর একটা <em>associated function</em> — type-এর সাথে যুক্ত
          function (অন্য language-এ "static method" নামে চেনা যায়)। অনেক
          type-এই <InlineCode>new</InlineCode> নামে একটা constructor-জাতীয়
          function থাকে।
        </p>

        <h3 class="mt-6 text-xl font-bold">stdin().read_line() এবং reference</h3>
        <CodeBlock
          lang="rust"
          code={`io::stdin()
    .read_line(&mut guess)
    .expect("Failed to read line");`}
        />
        <p>
          <InlineCode>io::stdin()</InlineCode> standard input-এর একটা handle
          return করে। তার উপর <InlineCode>.read_line()</InlineCode> call করলে
          user-এর type করা টেক্সট আমাদের string-এ যোগ হয়।
        </p>
        <p>
          লক্ষ্য করো — <InlineCode>&mut guess</InlineCode>। এখানে{" "}
          <InlineCode>&</InlineCode> মানে এটা একটা <strong>reference</strong> —
          আমরা <InlineCode>guess</InlineCode>-এর data copy না করেই অন্য
          জায়গাকে সেটা read/write করার অনুমতি দিচ্ছি। Reference-ও variable-এর
          মতো default-এ immutable, তাই mutate করতে চাইলে{" "}
          <InlineCode>&mut</InlineCode> লিখতে হয়। Reference Rust-এর সবচেয়ে
          গুরুত্বপূর্ণ feature-গুলোর একটা — Chapter 4-এ বিস্তারিত আছে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Result দিয়ে error handle করা</h3>
        <p>
          <InlineCode>.read_line()</InlineCode> শুধু string update করে না — এটা
          একটা <InlineCode>Result</InlineCode> value-ও return করে।{" "}
          <InlineCode>Result</InlineCode> একটা <strong>enum</strong> (chapter
          ৬-এ বিস্তারিত), যার দুটো variant: <InlineCode>Ok</InlineCode> (সফল) ও{" "}
          <InlineCode>Err</InlineCode> (failed)।
        </p>
        <p>
          <InlineCode>.expect("...")</InlineCode> call করলে — value{" "}
          <InlineCode>Err</InlineCode> হলে program crash করবে এবং আমাদের দেওয়া
          message print করবে; <InlineCode>Ok</InlineCode> হলে ভিতরের value
          return করবে। এখানে আমরা শুধু crash করাচ্ছি; recover করার পদ্ধতি
          chapter ৯-এ।
        </p>
        <p>
          <InlineCode>.expect()</InlineCode> না দিলে compile তো হবে, কিন্তু
          warning দেবে যে <InlineCode>Result</InlineCode> ignore করা হচ্ছে।
        </p>

        <h3 class="mt-6 text-xl font-bold">println! placeholder</h3>
        <CodeBlock lang="rust" code={`println!("You guessed: {guess}");`} />
        <p>
          <InlineCode>{`{guess}`}</InlineCode> হলো একটা placeholder — variable-এর
          নাম সরাসরি curly bracket-এর মধ্যে দিলেই value print হয়। Expression
          print করতে চাইলে empty{" "}
          <InlineCode>{`{}`}</InlineCode> ব্যবহার করে comma-separated list দিতে
          হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`let x = 5;
let y = 10;

println!("x = {x} and y + 2 = {}", y + 2);
// Output: x = 5 and y + 2 = 12`}
        />

        <h3 class="mt-6 text-xl font-bold">প্রথম পরীক্ষা</h3>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 6.44s
     Running \`target/debug/guessing_game\`
Guess the number!
Please input your guess.
6
You guessed: 6`}
        />
        <p>
          এ পর্যন্ত — keyboard থেকে input নিয়ে print করা হলো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Random secret number generate করা</h2>
        <p>
          এখন একটা secret number লাগবে — প্রতিবার play করলে আলাদা হবে। Rust-এর
          standard library-তে random number generation নেই। কিন্তু{" "}
          <InlineCode>rand</InlineCode> নামে একটা official crate আছে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Cargo.toml-এ dependency যোগ</h3>
        <p>
          <InlineCode>Cargo.toml</InlineCode> খুলে{" "}
          <InlineCode>[dependencies]</InlineCode> heading-এর নিচে এই line যোগ
          করো:
        </p>
        <CodeBlock
          lang="toml"
          filename="Cargo.toml"
          code={`[dependencies]
rand = "0.8.5"`}
        />
        <p>
          <InlineCode>0.8.5</InlineCode> হলো version specifier। আসলে এটা{" "}
          <InlineCode>^0.8.5</InlineCode>-এর shorthand — মানে "0.8.5 বা তার
          চেয়ে নতুন, কিন্তু 0.9.0-এর নিচে"। এটা <strong>Semantic Versioning
          (SemVer)</strong> অনুসরণ করে — 0.8.x version-গুলো API-compatible ধরা
          হয়।
        </p>
        <p>এখন <InlineCode>cargo build</InlineCode> চালাও:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo build
  Updating crates.io index
   Locking 15 packages to latest Rust 1.85.0 compatible versions
    Adding rand v0.8.5 (available: v0.9.0)
 Compiling proc-macro2 v1.0.93
 Compiling unicode-ident v1.0.17
 ... (অনেক crate compile হচ্ছে)
 Compiling rand v0.8.5
 Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
  Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 2.48s`}
        />
        <p>
          Cargo <strong>crates.io</strong> registry থেকে{" "}
          <InlineCode>rand</InlineCode> এবং তার dependencies download করেছে,
          তারপর সব compile করেছে। দ্বিতীয়বার <InlineCode>cargo build</InlineCode>{" "}
          চালালে — কোনো change নেই বলে — কিছুই recompile হবে না।
        </p>

        <h3 class="mt-6 text-xl font-bold">Cargo.lock — reproducible build</h3>
        <p>
          প্রথমবার build করার পর <InlineCode>Cargo.lock</InlineCode> file তৈরি
          হয়েছে। এটা দেখায় ঠিক কোন version-এর কোন crate use করা হয়েছে। পরের
          build-এ Cargo এই file-ই follow করে — যাতে নতুন version এসেও তোমার
          build break না হয়।
        </p>
        <p>
          Update করতে চাইলে <InlineCode>cargo update</InlineCode>:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo update
    Updating crates.io index
     Locking 1 package to latest Rust 1.85.0 compatible version
    Updating rand v0.8.5 -> v0.8.6 (available: v0.999.0)`}
        />
        <p>
          লক্ষ্য করো — <InlineCode>0.999.0</InlineCode> available থাকলেও Cargo
          নেবে না, কারণ আমাদের specifier <InlineCode>0.9.0</InlineCode>-এর নিচে
          সীমাবদ্ধ। বড় version upgrade করতে চাইলে{" "}
          <InlineCode>Cargo.toml</InlineCode>-এ specifier বদলাতে হবে।
        </p>
        <p>
          Cargo.lock source control-এ commit করতে হয় — এটা team-এর সবার build
          consistent রাখে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Random number generate করার code</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::io;

use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    println!("You guessed: {guess}");
}`}
        />
        <p>
          <InlineCode>use rand::Rng;</InlineCode> — <InlineCode>Rng</InlineCode>{" "}
          একটা <strong>trait</strong> (chapter ১০-এ আসবে)। Trait হলো method-এর
          set; method ব্যবহার করতে হলে trait scope-এ থাকতে হবে।
        </p>
        <p>
          <InlineCode>rand::thread_rng()</InlineCode> current thread-এর জন্য
          একটা random number generator return করে — operating system এটাকে seed
          করে। তার উপর <InlineCode>.gen_range(1..=100)</InlineCode> call করলে ১
          থেকে ১০০ (inclusive) এর মধ্যে একটা random number আসে।{" "}
          <InlineCode>1..=100</InlineCode> হলো range expression —{" "}
          <InlineCode>..=</InlineCode> মানে দু'প্রান্তই inclusive।
        </p>
        <p>
          কোন crate-এর কোন trait/method use করতে হবে — সেটা আগে থেকে জানার দরকার
          নেই। <InlineCode>cargo doc --open</InlineCode> চালালে browser-এ তোমার
          সব dependency-এর local documentation খুলবে।
        </p>
        <p>
          এই stage-এ secret number print করছি — শুধু testing-এর জন্য। আসল game-এ
          এটা থাকবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Guess-এর সাথে compare করা</h2>
        <p>
          এখন <InlineCode>guess</InlineCode>-কে <InlineCode>secret_number</InlineCode>
          -এর সাথে compare করতে হবে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::cmp::Ordering;
use std::io;

use rand::Rng;

fn main() {
    // ... আগের code ...

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}`}
        />
        <p>
          <InlineCode>std::cmp::Ordering</InlineCode> আরেকটা enum — variant:{" "}
          <InlineCode>Less</InlineCode>, <InlineCode>Greater</InlineCode>,{" "}
          <InlineCode>Equal</InlineCode>। এই তিনটাই দুটো value compare-এর
          সম্ভাব্য outcome।
        </p>
        <p>
          <InlineCode>.cmp()</InlineCode> method দুটো value তুলনা করে এবং একটা{" "}
          <InlineCode>Ordering</InlineCode> variant return করে।
        </p>
        <p>
          <InlineCode>match</InlineCode> expression-এ pattern অনুযায়ী কোড চালানো
          হয়। প্রতিটা <em>arm</em>-এ একটা pattern এবং সেই pattern match করলে
          চালানোর কোড। Rust top থেকে নিচে check করে — প্রথম যে arm match করে,
          সেটার code চালায়। উদাহরণ — guess 50, secret 38: cmp{" "}
          <InlineCode>Greater</InlineCode> return করে, প্রথম arm{" "}
          <InlineCode>Less</InlineCode> match হবে না, দ্বিতীয় arm{" "}
          <InlineCode>Greater</InlineCode> match — "Too big!" print হবে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Type mismatch error</h3>
        <p>এই code এখনই <InlineCode>cargo build</InlineCode> করলে error আসবে:</p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0308]: mismatched types
  --> src/main.rs:23:21
   |
23 |     match guess.cmp(&secret_number) {
   |                 --- ^^^^^^^^^^^^^^ expected \`&String\`, found \`&{integer}\`
   |                 |
   |                 arguments to this method are incorrect`}
        />
        <p>
          কারণ — <InlineCode>guess</InlineCode> হলো <InlineCode>String</InlineCode>
          , আর <InlineCode>secret_number</InlineCode> একটা integer। Rust string
          ও integer-কে compare করতে দেবে না।
        </p>
        <p>
          <InlineCode>secret_number</InlineCode>-এর type explicit বলিনি — Rust
          default-এ <InlineCode>i32</InlineCode> ধরে নিয়েছে। আমরা এটাকে{" "}
          <InlineCode>u32</InlineCode> (unsigned 32-bit integer) করতে চাই, এবং
          তার জন্য guess-কে string থেকে number-এ convert করতে হবে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Shadowing দিয়ে type convert</h3>
        <p>
          <InlineCode>read_line</InlineCode>-এর ঠিক পরে এই line যোগ করো:
        </p>
        <CodeBlock
          lang="rust"
          code={`let guess: u32 = guess.trim().parse().expect("Please type a number!");`}
        />
        <p>
          আমরা একটা নতুন variable বানাচ্ছি যার নাম-ও{" "}
          <InlineCode>guess</InlineCode>! এটাকে বলে{" "}
          <strong>shadowing</strong> — পুরোনো variable-কে নতুনটা ঢেকে দেয়।
          সাধারণত type convert করার সময় এটা use করা হয়, যাতে দুটো আলাদা নাম
          (যেমন <InlineCode>guess_str</InlineCode> ও <InlineCode>guess</InlineCode>
          ) লাগে না।
        </p>
        <p>
          <InlineCode>.trim()</InlineCode> string-এর শুরু/শেষ থেকে whitespace
          (newline, space) সরায় — user enter চাপলে যে{" "}
          <InlineCode>\\n</InlineCode> যোগ হয়, সেটা আগে clean করতে হয়।
        </p>
        <p>
          <InlineCode>.parse()</InlineCode> string-কে অন্য type-এ convert করে।{" "}
          <InlineCode>let guess: u32</InlineCode> দিয়ে আমরা type annotate
          করেছি, তাই Rust জানে কোন type-এ parse করতে হবে।
        </p>
        <p>
          <InlineCode>parse()</InlineCode> ও একটা <InlineCode>Result</InlineCode>{" "}
          return করে — input invalid হলে fail করতে পারে।{" "}
          <InlineCode>.expect()</InlineCode> দিয়ে আপাতত fail হলে crash করছি।
        </p>
        <p>
          এখন <InlineCode>cargo run</InlineCode> চালিয়ে দেখো:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ cargo run
   Compiling guessing_game v0.1.0
     Running \`target/debug/guessing_game\`
Guess the number!
The secret number is: 58
Please input your guess.
  76
You guessed: 76
Too big!`}
        />

        <h2 class="mt-10 text-2xl font-bold">Loop দিয়ে multiple guess</h2>
        <p>
          User-কে একবার-এর বেশি guess করতে দিতে <InlineCode>loop</InlineCode>{" "}
          keyword use করি — infinite loop:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`loop {
    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    let guess: u32 = guess.trim().parse().expect("Please type a number!");

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}`}
        />
        <p>
          User এখন বারবার guess করতে পারবে। কিন্তু game শেষ হবে না — সঠিক
          guess করলেও।
        </p>

        <h3 class="mt-6 text-xl font-bold">সঠিক guess-এ break</h3>
        <p>
          <InlineCode>Ordering::Equal</InlineCode> arm-এ{" "}
          <InlineCode>break</InlineCode> যোগ করি:
        </p>
        <CodeBlock
          lang="rust"
          code={`match guess.cmp(&secret_number) {
    Ordering::Less => println!("Too small!"),
    Ordering::Greater => println!("Too big!"),
    Ordering::Equal => {
        println!("You win!");
        break;
    }
}`}
        />
        <p>
          <InlineCode>break</InlineCode> loop থেকে বেরিয়ে যায়। যেহেতু{" "}
          <InlineCode>main</InlineCode>-এ এটাই শেষ statement, loop শেষ হলে
          program-ও শেষ।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Invalid input handle করা</h2>
        <p>
          এখনো একটা সমস্যা — user যদি number না দিয়ে "foo" type করে,{" "}
          <InlineCode>parse</InlineCode> fail করে এবং{" "}
          <InlineCode>expect</InlineCode> program crash করায়। আমরা চাই —
          invalid হলে শুধু আবার জিজ্ঞেস করো।
        </p>
        <p>
          <InlineCode>expect</InlineCode>-এর জায়গায় আরেকটা{" "}
          <InlineCode>match</InlineCode>:
        </p>
        <CodeBlock
          lang="rust"
          code={`let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};`}
        />
        <p>
          <InlineCode>parse</InlineCode> fail করলে{" "}
          <InlineCode>Err(_)</InlineCode> arm match হবে — underscore{" "}
          <InlineCode>_</InlineCode> মানে "যেকোনো error, value-এর কথা ভাবছি না"।{" "}
          <InlineCode>continue</InlineCode> loop-এর পরবর্তী iteration-এ চলে যায়।
        </p>
        <p>
          <InlineCode>parse</InlineCode> success হলে{" "}
          <InlineCode>Ok(num)</InlineCode> match হবে, এবং{" "}
          <InlineCode>num</InlineCode> value আমাদের নতুন{" "}
          <InlineCode>guess</InlineCode> variable-এ bind হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">চূড়ান্ত code</h2>
        <p>
          সবশেষে — secret number print করার line-টা সরিয়ে দাও (game-এর জন্য
          spoiler!)। final program:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::cmp::Ordering;
use std::io;

use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please input your guess.");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}`}
        />
        <p>
          এই কয়েক লাইনে আমরা ব্যবহার করেছি — <InlineCode>let</InlineCode>,{" "}
          <InlineCode>match</InlineCode>, function, external crate, mutable
          reference, shadowing, error handling, loop, break, continue, enum
          (Result, Ordering), trait (Rng) — Rust-এর প্রায় সব core concept-এর
          ছোঁয়া।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই অধ্যায় থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>use</InlineCode> দিয়ে module/trait scope-এ আনা।
          </li>
          <li>
            <InlineCode>let</InlineCode> immutable, <InlineCode>let mut</InlineCode>{" "}
            mutable; <strong>shadowing</strong> দিয়ে নাম reuse করা।
          </li>
          <li>
            <InlineCode>String::new()</InlineCode>,{" "}
            <InlineCode>io::stdin().read_line(&mut s)</InlineCode> দিয়ে input;
            reference (<InlineCode>&</InlineCode>, <InlineCode>&mut</InlineCode>
            ) কী।
          </li>
          <li>
            <InlineCode>Result</InlineCode> enum (Ok/Err);{" "}
            <InlineCode>.expect()</InlineCode> দিয়ে crash বা{" "}
            <InlineCode>match</InlineCode> দিয়ে handle।
          </li>
          <li>
            <InlineCode>Cargo.toml</InlineCode>-এ external crate যোগ;{" "}
            <InlineCode>Cargo.lock</InlineCode> reproducible build নিশ্চিত করে।
          </li>
          <li>
            <InlineCode>rand::thread_rng().gen_range(1..=100)</InlineCode> দিয়ে
            random number; <InlineCode>..=</InlineCode> inclusive range।
          </li>
          <li>
            <InlineCode>Ordering</InlineCode> enum,{" "}
            <InlineCode>.cmp()</InlineCode>, <InlineCode>match</InlineCode>{" "}
            দিয়ে comparison।
          </li>
          <li>
            <InlineCode>loop</InlineCode>, <InlineCode>break</InlineCode>,{" "}
            <InlineCode>continue</InlineCode> দিয়ে control flow;{" "}
            <InlineCode>{`{var}`}</InlineCode> placeholder দিয়ে print।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২: একটি Guessing Game বানানো · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ একটা সম্পূর্ণ guessing game project তৈরি — let, match, rand crate, Result, loop, shadowing।",
    },
  ],
};
