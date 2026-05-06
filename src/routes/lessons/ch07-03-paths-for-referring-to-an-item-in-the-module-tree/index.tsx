import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch07-03-paths-for-referring-to-an-item-in-the-module-tree";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ৭.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Module tree-তে item refer করার Path
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Paths for Referring to an Item in the Module Tree
        </p>
        <p class="mt-3">
          Module tree-তে কোনো item-কে refer করা — filesystem-এর path-এর মতো।
          দু'রকম form:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>Absolute path</strong> — crate root থেকে; current crate-এর
            জন্য <InlineCode>crate</InlineCode> দিয়ে শুরু, external crate-এর
            জন্য crate-এর নাম দিয়ে।
          </li>
          <li>
            <strong>Relative path</strong> — current module থেকে;{" "}
            <InlineCode>self</InlineCode>, <InlineCode>super</InlineCode>, বা
            current module-এর কোনো item-এর নাম দিয়ে।
          </li>
        </ul>
        <p>
          দু'রকমেরই segment <InlineCode>::</InlineCode> দিয়ে আলাদা।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">দু'রকম path পাশাপাশি</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();

    // Relative path
    front_of_house::hosting::add_to_waitlist();
}`}
        />
        <p>
          Absolute — <InlineCode>crate</InlineCode> দিয়ে শুরু (filesystem-এ{" "}
          <InlineCode>/</InlineCode>-এর মতো)। Relative — current scope-এ থাকা{" "}
          <InlineCode>front_of_house</InlineCode> দিয়ে শুরু।
        </p>
        <p>
          সাধারণত absolute path বেশি ব্যবহার করা হয় — caller এবং item আলাদা
          জায়গায় move হলেও path break হয় না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কিন্তু এটা compile হবে না — privacy</h2>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0603]: module \`hosting\` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^  --------------- function \`add_to_waitlist\` is not publicly re-exported
  |                            |
  |                            private module`}
        />
        <p>
          Rust-এ <strong>সব item default-এ private</strong> — function, method,
          struct, enum, module, constant সব। Parent module child-এর private
          item access করতে পারে না; কিন্তু child-রা ancestor-দের সব দেখতে পায়
          (কারণ child-রা parent-এর context-এর ভিতরে define হয়েছে)।
        </p>
        <p>
          Restaurant analogy — back office private থাকে customer-দের কাছে,
          কিন্তু office manager পুরো restaurant দেখতে পান।
        </p>

        <h2 class="mt-10 text-2xl font-bold">pub দিয়ে expose</h2>
        <p>প্রথম try — module-কে pub:</p>
        <CodeBlock
          lang="rust"
          code={`mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}`}
        />
        <p>এখনো error — function-ও private:</p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`error[E0603]: function \`add_to_waitlist\` is private`}
        />
        <p>
          <InlineCode>pub mod</InlineCode> শুধু module-এ access দেয় — ভিতরের
          item-এ না। প্রতিটা item-কে আলাদা করে public করতে হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    crate::front_of_house::hosting::add_to_waitlist();
    front_of_house::hosting::add_to_waitlist();
}`}
        />
        <p>
          লক্ষ্য করো —{" "}
          <InlineCode>front_of_house</InlineCode>{" "}
          <InlineCode>pub</InlineCode> না, তবু{" "}
          <InlineCode>eat_at_restaurant</InlineCode> থেকে access করা যাচ্ছে।
          কারণ — দু'জন একই module-এ (crate root) sibling।
        </p>

        <h2 class="mt-10 text-2xl font-bold">super:: — parent-এ যাওয়া</h2>
        <p>
          Filesystem-এর <InlineCode>..</InlineCode>-এর মতো। Parent module-এ
          কিছু আছে — তাকে refer করতে:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn deliver_order() {}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::deliver_order();
    }

    fn cook_order() {}
}`}
        />
        <p>
          <InlineCode>back_of_house::fix_incorrect_order</InlineCode> থেকে{" "}
          <InlineCode>super::</InlineCode> যায় parent (crate root)-এ —
          সেখান থেকে <InlineCode>deliver_order</InlineCode> খুঁজে পায়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Public struct — field-গুলো আলাদা</h2>
        <p>
          <InlineCode>pub struct</InlineCode>-এ struct public, কিন্তু
          field-গুলো default-এই private। প্রতিটা field আলাদা করে public/private
          করা যায়:
        </p>
        <CodeBlock
          lang="rust"
          code={`mod back_of_house {
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }
}

pub fn eat_at_restaurant() {
    let mut meal = back_of_house::Breakfast::summer("Rye");
    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);

    // meal.seasonal_fruit = String::from("blueberries"); // ERROR
}`}
        />
        <p>
          <InlineCode>toast</InlineCode> public — read/write করা যায়।{" "}
          <InlineCode>seasonal_fruit</InlineCode> private — বাইরে থেকে
          touch করা যায় না।
        </p>
        <p>
          এখানে একটা সমস্যা — <InlineCode>Breakfast</InlineCode>-এ একটা
          private field আছে, তাই বাইরে থেকে normal struct-syntax-এ instance
          create করা যাবে না। সেজন্য একটা <strong>public constructor</strong>{" "}
          (<InlineCode>summer</InlineCode>) লাগে।
        </p>
        <p>
          Restaurant analogy — customer bread বেছে নিতে পারেন (toast public),
          কিন্তু কোন fruit আসবে chef-ই ঠিক করেন (seasonal_fruit private)।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Public enum — সব variant public</h2>
        <CodeBlock
          lang="rust"
          code={`mod back_of_house {
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

pub fn eat_at_restaurant() {
    let order1 = back_of_house::Appetizer::Soup;
    let order2 = back_of_house::Appetizer::Salad;
}`}
        />
        <p>
          <InlineCode>pub enum</InlineCode> দিলেই সব variant automatic public।
          প্রতিটাকে আলাদা <InlineCode>pub</InlineCode> করতে হয় না।
        </p>

        <h3 class="mt-6 text-lg font-bold">কেন এই default-difference?</h3>
        <p>
          Variant private হলে enum কাজে আসে না — প্রায় কোনো use case নেই।
          তাই default public।
        </p>
        <p>
          Struct অনেক সময় শুধু internal data carry করে — field expose করার
          দরকার নেই। তাই default private, fine-grained control।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Path — absolute (<InlineCode>crate::...</InlineCode>) বা relative
            (current module থেকে)।
          </li>
          <li>
            <strong>সব default-এ private</strong> — child can see ancestors,
            but not vice versa।
          </li>
          <li>
            <InlineCode>pub mod</InlineCode> — module-কে expose, কিন্তু
            ভিতরের item আলাদা করে <InlineCode>pub</InlineCode> করতে হয়।
          </li>
          <li>
            <InlineCode>super::</InlineCode> — parent module-এ access।
          </li>
          <li>
            <InlineCode>pub struct</InlineCode> — struct public, field
            field-by-field। Private field থাকলে public constructor দরকার।
          </li>
          <li>
            <InlineCode>pub enum</InlineCode> — সব variant automatic public।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ৭.৩: Module tree-তে item refer করার Path · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ absolute এবং relative path, pub keyword, super::, এবং pub struct/enum-এর privacy।",
    },
  ],
};
