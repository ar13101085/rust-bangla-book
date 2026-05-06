import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch16-04-extensible-concurrency-sync-and-send";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১৬.৪
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Send এবং Sync দিয়ে concurrency বাড়ানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Extensible Concurrency with the Send and Sync Traits
        </p>
        <p class="mt-3">
          মজার ব্যাপার — এই chapter-এ যত concurrency feature দেখলে, তার
          প্রায় সবগুলো language-এর না, <em>standard library</em>-র অংশ। তুমি
          নিজেও নতুন concurrency primitive লিখতে পারো, বা crate ecosystem থেকে
          নিতে পারো। কিন্তু দু'টো জিনিস language-এর — marker trait{" "}
          <InlineCode>Send</InlineCode> আর <InlineCode>Sync</InlineCode>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">
          <InlineCode>Send</InlineCode> — ownership thread-এ পাঠানো
        </h2>
        <p>
          কোনো type <InlineCode>Send</InlineCode> implement করলে — সেটার
          ownership এক thread থেকে আরেক thread-এ transfer করা safe। প্রায় সব
          Rust type <InlineCode>Send</InlineCode>।
        </p>
        <p>উল্লেখযোগ্য ব্যতিক্রম:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Rc&lt;T&gt;</InlineCode> —{" "}
            <strong>Send না</strong>। দু'টা thread একই{" "}
            <InlineCode>Rc</InlineCode> clone করে ref count update করতে গেলে race
            হত।
          </li>
          <li>
            Raw pointer (<InlineCode>*const T</InlineCode>,{" "}
            <InlineCode>*mut T</InlineCode>) — <strong>Send না</strong>। Chapter
            20-এ unsafe Rust-এ আবার আসবে।
          </li>
        </ul>
        <p>
          আগের পাঠে দেখেছ — <InlineCode>Rc&lt;Mutex&lt;i32&gt;&gt;</InlineCode>{" "}
          spawn-এ পাঠালে error:
        </p>
        <CodeBlock
          lang="text"
          filename="compile error"
          code={`the trait \`Send\` is not implemented for \`Rc<Mutex<i32>>\``}
        />
        <p>
          সমাধান — <InlineCode>Arc&lt;T&gt;</InlineCode>, যেটা{" "}
          <InlineCode>Send</InlineCode> implement করে।
        </p>
        <p>
          <strong>Auto-implementation:</strong> যেকোনো type যা পুরোপুরি{" "}
          <InlineCode>Send</InlineCode> type দিয়ে গঠিত — সেটাও automatic{" "}
          <InlineCode>Send</InlineCode>। প্রায় সব primitive type{" "}
          <InlineCode>Send</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          <InlineCode>Sync</InlineCode> — একাধিক thread থেকে reference
        </h2>
        <p>
          কোনো type <InlineCode>Sync</InlineCode> implement করলে — তার
          immutable reference (<InlineCode>&T</InlineCode>) একাধিক thread থেকে
          access করা safe।
        </p>
        <p>
          Formal definition — <InlineCode>T</InlineCode> তখনই{" "}
          <InlineCode>Sync</InlineCode>, যখন <InlineCode>&T</InlineCode>{" "}
          <InlineCode>Send</InlineCode>। অর্থাৎ reference-কে নিরাপদে অন্য
          thread-এ পাঠানো যায়।
        </p>
        <p>উদাহরণ:</p>
        <ul class="ml-6 list-disc space-y-2">
          <li>সব primitive — <InlineCode>Sync</InlineCode>।</li>
          <li>
            <InlineCode>Rc&lt;T&gt;</InlineCode> — <strong>Sync না</strong>{" "}
            (একই reason)।
          </li>
          <li>
            <InlineCode>RefCell&lt;T&gt;</InlineCode> এবং{" "}
            <InlineCode>Cell</InlineCode> family — <strong>Sync না</strong>।
            Runtime borrow check thread-safe না।
          </li>
          <li>
            <InlineCode>Mutex&lt;T&gt;</InlineCode> —{" "}
            <strong>Sync</strong>। তাই multi-threaded shared access-এ এটাই
            ব্যবহার করি।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">
          নিজে implement করা — <InlineCode>unsafe</InlineCode>
        </h2>
        <p>
          <InlineCode>Send</InlineCode> ও <InlineCode>Sync</InlineCode> দু'টোই{" "}
          <strong>marker trait</strong> — কোনো method নেই। শুধু compile-time
          invariant track করে।
        </p>
        <p>
          যেহেতু <InlineCode>Send</InlineCode>/<InlineCode>Sync</InlineCode>{" "}
          components থেকে গড়া type automatic এই trait পায় — manually implement
          করার দরকার সাধারণত হয় না।
        </p>
        <p>
          কিন্তু যদি raw pointer-জাতীয় non-Send/non-Sync জিনিস ব্যবহার করো,
          এবং নিজে নিশ্চিত হও যে invariant ঠিক আছে — তাহলে{" "}
          <InlineCode>unsafe impl</InlineCode> দিয়ে hand-implement করতে হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`unsafe impl Send for MyType {}
unsafe impl Sync for MyType {}`}
        />
        <p>
          <InlineCode>unsafe</InlineCode> মানে — তুমি promise করছ যে type-টা
          সত্যিই thread-এর মধ্যে move/share করা safe। Compiler আর verify করতে
          পারবে না — সেই দায়িত্ব তোমার।
        </p>
        <p>
          গভীরে যেতে চাইলে <em>The Rustonomicon</em> দেখো — Rust-এর unsafe
          ও concurrent invariant-এর reference।
        </p>

        <h2 class="mt-10 text-2xl font-bold">
          কেন এটা "extensible"
        </h2>
        <p>
          Rust-এর concurrency story-র চমৎকার দিক — language শুধু{" "}
          <InlineCode>Send</InlineCode>/<InlineCode>Sync</InlineCode>{" "}
          ও কয়েকটা primitive দিয়েছে। বাকি সব — channel, mutex, atomic, async
          runtime, work-stealing scheduler — library/crate-এ বানানো। এই
          minimal বুনিয়াদের উপর community নতুন concurrency abstraction তৈরি
          করতে পারে, এবং type system নিজে থেকেই data race প্রতিরোধ করে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>Send</InlineCode> — ownership thread-এ পাঠানো safe;
            প্রায় সব type-এ auto।
          </li>
          <li>
            <InlineCode>Sync</InlineCode> — <InlineCode>&T</InlineCode> অন্য
            thread-এ পাঠানো safe; অর্থাৎ shared immutable access।
          </li>
          <li>
            <InlineCode>Rc</InlineCode>, <InlineCode>RefCell</InlineCode>,{" "}
            <InlineCode>Cell</InlineCode> — Send/Sync না; raw pointer-ও না।
          </li>
          <li>
            <InlineCode>Arc</InlineCode>, <InlineCode>Mutex</InlineCode>,
            primitive type — Send এবং Sync।
          </li>
          <li>
            Marker trait — method নেই, শুধু compile-time invariant; component
            সব Send/Sync হলে auto-implementation।
          </li>
          <li>
            Manual implementation <InlineCode>unsafe impl</InlineCode> দিয়ে —
            তুমি promise করছ invariant ঠিক রাখবে।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১৬.৪: Send এবং Sync দিয়ে concurrency · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust-এ Send এবং Sync marker trait, auto-implementation, এবং unsafe manual implementation।",
    },
  ],
};
