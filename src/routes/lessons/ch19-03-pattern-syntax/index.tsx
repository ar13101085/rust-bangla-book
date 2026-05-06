import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch19-03-pattern-syntax";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৯.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">Pattern Syntax</h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Pattern Syntax</p>
        <p class="mt-3">
          এই পাঠে Rust-এ pattern লেখার সব valid syntax — literal match,
          variable, multiple pattern, range, destructuring, ignoring, match
          guard, এবং <InlineCode>@</InlineCode> binding।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">Literal match</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 1;

    match x {
        1 => println!("one"),
        2 => println!("two"),
        3 => println!("three"),
        _ => println!("anything"),
    }
}`}
        />
        <p>
          <InlineCode>x</InlineCode> 1 — তাই "one" print। নির্দিষ্ট value-এর
          জন্য particular action — straightforward।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Named variable — shadowing</h2>
        <p>
          Named variable irrefutable pattern — যেকোনো value match করে।
          কিন্তু <InlineCode>match</InlineCode>,{" "}
          <InlineCode>if let</InlineCode>,{" "}
          <InlineCode>while let</InlineCode>-এর pattern-এ declare হলে — outer
          scope-এর same name-এর variable-কে shadow করে।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {y}"),
        _ => println!("Default case, x = {x:?}"),
    }

    println!("at the end: x = {x:?}, y = {y}");
}`}
        />
        <p>
          Second arm-এর <InlineCode>Some(y)</InlineCode>-এর{" "}
          <InlineCode>y</InlineCode> নতুন — match-এর scope-এ। বাইরের{" "}
          <InlineCode>y = 10</InlineCode>-কে shadow করছে। x =
          Some(5) → second arm match → inner y = 5 → print "Matched, y = 5"।
        </p>
        <p>
          Match শেষ — inner y-ও শেষ। শেষ println-এ x = Some(5), y = 10
          (outer)।
        </p>
        <p>
          বাইরের <InlineCode>y</InlineCode>-এর সাথে compare করতে চাইলে —
          নিচে <em>match guard</em>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Multiple pattern — | (OR)</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 1;

    match x {
        1 | 2 => println!("one or two"),
        3 => println!("three"),
        _ => println!("anything"),
    }
}`}
        />
        <p>
          <InlineCode>1 | 2</InlineCode> — যেকোনোটা match হলেই arm execute।
          Print হবে "one or two"।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Range — ..=</h2>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 5;

    match x {
        1..=5 => println!("one through five"),
        _ => println!("something else"),
    }
}`}
        />
        <p>
          <InlineCode>1..=5</InlineCode> — inclusive range, 1 থেকে 5 পর্যন্ত।{" "}
          <InlineCode>1 | 2 | 3 | 4 | 5</InlineCode>-এর চেয়ে অনেক ছোট।
        </p>
        <p>
          Range শুধু numeric এবং <InlineCode>char</InlineCode>-এ allowed —
          কারণ compiler compile time-এ check করে range empty কিনা।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 'c';

    match x {
        'a'..='j' => println!("early ASCII letter"),
        'k'..='z' => println!("late ASCII letter"),
        _ => println!("something else"),
    }
}`}
        />
        <p>'c' first range-এ — print "early ASCII letter"।</p>

        <h2 class="mt-10 text-2xl font-bold">Destructuring — struct</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}`}
        />
        <p>
          <InlineCode>Point</InlineCode> destructure করে field-এর value-গুলো
          আলাদা variable-এ — <InlineCode>x</InlineCode> → a,{" "}
          <InlineCode>y</InlineCode> → b। Variable name field name-এর সাথে
          মেলাতে হয় না, কিন্তু সাধারণত মেলানোই হয়। Shorthand:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}`}
        />
        <p>
          Field name-ই variable name।
        </p>
        <p>Literal-এর সাথে mix করেও test করা যায়:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {x}"),
        Point { x: 0, y } => println!("On the y axis at {y}"),
        Point { x, y } => {
            println!("On neither axis: ({x}, {y})");
        }
    }
}`}
        />
        <p>
          First arm — y == 0, x bound। Second arm — x == 0, y bound। p =
          {`{ x: 0, y: 7 }`} → second arm match → "On the y axis at 7"।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Destructuring — enum</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("The Quit variant has no data to destructure.");
        }
        Message::Move { x, y } => {
            println!("Move in the x direction {x} and in the y direction {y}");
        }
        Message::Write(text) => {
            println!("Text message: {text}");
        }
        Message::ChangeColor(r, g, b) => {
            println!("Change color to red {r}, green {g}, and blue {b}");
        }
    }
}`}
        />
        <p>
          Enum variant-এর data যেভাবে define, pattern-ও সেভাবে। Quit-এ data
          নেই — শুধু literal match। Move-এ struct-style — curly braces। Write
          tuple-style — parentheses। ChangeColor — তিনটা i32। Number/order
          মিলতে হবে।
        </p>

        <h3 class="mt-6 text-xl font-bold">Nested struct/enum</h3>
        <CodeBlock
          lang="rust"
          code={`enum Color {
    Rgb(i32, i32, i32),
    Hsv(i32, i32, i32),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message::ChangeColor(Color::Hsv(0, 160, 255));

    match msg {
        Message::ChangeColor(Color::Rgb(r, g, b)) => {
            println!("Change color to red {r}, green {g}, and blue {b}");
        }
        Message::ChangeColor(Color::Hsv(h, s, v)) => {
            println!("Change color to hue {h}, saturation {s}, value {v}");
        }
        _ => (),
    }
}`}
        />
        <p>Pattern arbitrary depth-এ nest করতে পারে।</p>

        <h3 class="mt-6 text-xl font-bold">Struct + tuple একসাথে</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    struct Point {
        x: i32,
        y: i32,
    }

    let ((feet, inches), Point { x, y }) = ((3, 10), Point { x: 3, y: -10 });
}`}
        />
        <p>
          জটিল type-কে component-এ ভাঙা — সব একসাথে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Value ignore — _ এবং ..</h2>
        <h3 class="mt-4 text-lg font-bold">Entire value — _</h3>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {y}");
}

fn main() {
    foo(3, 4);
}`}
        />
        <p>
          First parameter ignore — print "This code only uses the y parameter:
          4"।
        </p>

        <h3 class="mt-4 text-lg font-bold">Nested _ — পার্ট-wise ignore</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let mut setting_value = Some(5);
    let new_setting_value = Some(10);

    match (setting_value, new_setting_value) {
        (Some(_), Some(_)) => {
            println!("Can't overwrite an existing customized value");
        }
        _ => {
            setting_value = new_setting_value;
        }
    }

    println!("setting is {setting_value:?}");
}`}
        />
        <p>
          দু'জনেই Some — value নেওয়ার দরকার নেই, শুধু variant-টা match হলেই
          হলো। Print "Can't overwrite an existing customized value", তারপর
          "setting is Some(5)"।
        </p>
        <p>একাধিক জায়গায় _:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (first, _, third, _, fifth) => {
            println!("Some numbers: {first}, {third}, {fifth}");
        }
    }
}`}
        />
        <p>Print "Some numbers: 2, 8, 32"।</p>

        <h3 class="mt-4 text-lg font-bold">_-এর শুরুর variable name</h3>
        <p>
          Variable বানিয়ে use না করলে Rust warning দেয়। Name-এর শুরুতে{" "}
          <InlineCode>_</InlineCode> দিলে warning suppress।
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let _x = 5;
    let y = 10;
}`}
        />
        <p>
          <InlineCode>_x</InlineCode>-এ warning নেই, <InlineCode>y</InlineCode>{" "}
          unused — warning।
        </p>
        <p>
          সূক্ষ্ম তফাৎ — শুধু <InlineCode>_</InlineCode> bind করে না, কিন্তু{" "}
          <InlineCode>_x</InlineCode> bind করে। নিচের code error:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s = Some(String::from("Hello!"));

    if let Some(_s) = s {
        println!("found a string");
    }

    println!("{s:?}");
}`}
        />
        <p>
          <InlineCode>s</InlineCode> move হয়ে গেছে <InlineCode>_s</InlineCode>{" "}
          variable-এ। শেষ println-এ s use — error।
        </p>
        <p>শুধু <InlineCode>_</InlineCode> দিলে কোনো bind হয় না:</p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let s = Some(String::from("Hello!"));

    if let Some(_) = s {
        println!("found a string");
    }

    println!("{s:?}");
}`}
        />
        <p>এখানে s move হয়নি — কোনো issue নেই।</p>

        <h3 class="mt-4 text-lg font-bold">.. — remaining ignore</h3>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    struct Point {
        x: i32,
        y: i32,
        z: i32,
    }

    let origin = Point { x: 0, y: 0, z: 0 };

    match origin {
        Point { x, .. } => println!("x is {x}"),
    }
}`}
        />
        <p>
          শুধু <InlineCode>x</InlineCode> দরকার, বাকি সব{" "}
          <InlineCode>..</InlineCode>।
        </p>
        <p>Tuple-এ first-last:</p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (first, .., last) => {
            println!("Some numbers: {first}, {last}");
        }
    }
}`}
        />
        <p>
          Print "Some numbers: 2, 32"। কিন্তু{" "}
          <InlineCode>..</InlineCode> ambiguous হলে error:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (.., second, ..) => {
            println!("Some numbers: {second}")
        },
    }
}`}
        />
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error: \`..\` can only be used once per tuple pattern
 --> src/main.rs:5:22
  |
5 |         (.., second, ..) => {
  |          --          ^^ can only be used once per tuple pattern
  |          |
  |          previously used here`}
        />
        <p>
          <InlineCode>second</InlineCode>-এর আগে কয়টা element ignore আর পরে
          কয়টা — Rust বলতে পারছে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Match guard — অতিরিক্ত if</h2>
        <p>
          Match arm-এর pattern-এর পরে <InlineCode>if condition</InlineCode>{" "}
          — সেটাও true হলে arm execute। শুধু{" "}
          <InlineCode>match</InlineCode>-এ available, if let / while let-এ না।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let num = Some(4);

    match num {
        Some(x) if x % 2 == 0 => println!("The number {x} is even"),
        Some(x) => println!("The number {x} is odd"),
        None => (),
    }
}`}
        />
        <p>
          <InlineCode>Some(4)</InlineCode> match → guard 4 % 2 == 0 → true →
          "The number 4 is even"। Some(5) হলে guard fail, second arm-এ যেত।
        </p>
        <p>
          আগের shadowing সমস্যা — outer y-এর সাথে compare:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(n) if n == y => println!("Matched, n = {n}"),
        _ => println!("Default case, x = {x:?}"),
    }

    println!("at the end: x = {x:?}, y = {y}");
}`}
        />
        <p>
          <InlineCode>Some(n)</InlineCode> — <InlineCode>n</InlineCode> outer
          কোনো variable-কে shadow করে না। Guard-এ{" "}
          <InlineCode>n == y</InlineCode> — সেখানে y outer। n = 5, y = 10 —
          guard fail; default arm match — "Default case, x = Some(5)"।
        </p>
        <p>
          Match guard <InlineCode>|</InlineCode>-এর সাথেও:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let x = 4;
    let y = false;

    match x {
        4 | 5 | 6 if y => println!("yes"),
        _ => println!("no"),
    }
}`}
        />
        <p>
          Guard পুরো <InlineCode>4 | 5 | 6</InlineCode>-এ apply —{" "}
          <InlineCode>(4 | 5 | 6) if y</InlineCode>। x = 4 match, কিন্তু y
          false — fail। Print "no"।
        </p>

        <h2 class="mt-10 text-2xl font-bold">@ binding — test ও bind একসাথে</h2>
        <p>
          <InlineCode>@</InlineCode> দিয়ে value-কে test করতে করতেই variable-এ
          bind করা যায়।
        </p>
        <CodeBlock
          lang="rust"
          code={`fn main() {
    enum Message {
        Hello { id: i32 },
    }

    let msg = Message::Hello { id: 5 };

    match msg {
        Message::Hello { id: id @ 3..=7 } => {
            println!("Found an id in range: {id}")
        }
        Message::Hello { id: 10..=12 } => {
            println!("Found an id in another range")
        }
        Message::Hello { id } => println!("Found some other id: {id}"),
    }
}`}
        />
        <p>
          <InlineCode>id @ 3..=7</InlineCode> — id 3 থেকে 7-এর মধ্যে কিনা
          test, মিললে value <InlineCode>id</InlineCode> variable-এ bind।
          Print "Found an id in range: 5"।
        </p>
        <p>
          Second arm-এ শুধু range — value variable-এ নেই। Third arm-এ শুধু{" "}
          <InlineCode>id</InlineCode> — যেকোনো value, কোনো test নেই।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Literal, named variable (shadowing), multiple{" "}
            <InlineCode>|</InlineCode>, range <InlineCode>..=</InlineCode> —
            basic pattern।
          </li>
          <li>
            Struct, enum, tuple destructure — যেকোনো depth-এ nest;
            shorthand-ও available।
          </li>
          <li>
            Ignore — <InlineCode>_</InlineCode> (entire/part),{" "}
            <InlineCode>_var</InlineCode> (binds, no warning),{" "}
            <InlineCode>..</InlineCode> (remaining)।
          </li>
          <li>
            Match guard <InlineCode>if</InlineCode> — outer variable compare,
            একই pattern-এ extra condition।
          </li>
          <li>
            <InlineCode>@</InlineCode> — test এবং bind একসাথে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৯.৩: Pattern Syntax · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এর pattern-এর সব syntax — literal, range, destructure, ignore, match guard, এবং @ binding।",
    },
  ],
};
