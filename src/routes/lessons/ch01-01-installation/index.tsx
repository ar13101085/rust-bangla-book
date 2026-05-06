import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch01-01-installation";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ১.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Rust install করা
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">Installation</p>
        <p class="mt-3">
          এই পাঠে আমরা <InlineCode>rustup</InlineCode> দিয়ে Rust toolchain
          install করব। Linux, macOS, এবং Windows — তিনটি platform-এর জন্যই step
          আলাদা করে দেখানো হলো।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">rustup কী?</h2>
        <p>
          <strong>rustup</strong> হলো Rust-এর official toolchain manager — এটা{" "}
          <InlineCode>rustc</InlineCode> (compiler),{" "}
          <InlineCode>cargo</InlineCode> (build tool ও package manager), এবং
          অন্যান্য component install ও update করার দায়িত্বে থাকে। Rust-এর নতুন
          version বেরোলে শুধু <InlineCode>rustup update</InlineCode> চালালেই
          হবে — তোমাকে আবার installer download করতে হবে না।
        </p>
        <p>
          এই পাঠে যে command-গুলো দেখাবো, সেগুলোতে terminal-এর prompt-হিসেবে{" "}
          <InlineCode>$</InlineCode> বা <InlineCode>{">"}</InlineCode> ব্যবহার
          করা হবে। এই চিহ্নটা <em>type করতে হবে না</em> — এটা শুধু বোঝায় যে
          এরপরের অংশটা তোমার type করার কথা। যেসব line-এর শুরুতে prompt নেই,
          সেগুলো command-এর output।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Linux বা macOS-এ install করা</h2>
        <p>
          Terminal খুলে নিচের command চালাও — এটা rustup-এর install script
          download করে চালাবে:
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh`}
        />
        <p>
          Script-টা তোমাকে কয়েকটা option জিজ্ঞেস করবে — default (
          <InlineCode>1) Proceed with standard installation</InlineCode>) বেছে
          নিলেই হবে। শেষে এই message দেখলে বুঝবে install successful হয়েছে:
        </p>
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`Rust is installed now. Great!`}
        />
        <p>
          Rust-এর কিছু crate compile করতে <strong>linker</strong> দরকার হয়
          (linker হলো compile-হওয়া object file-গুলোকে join করে final binary
          বানানোর tool)। সাধারণত system-এ আগে থেকেই থাকে, কিন্তু না থাকলে এই
          ভাবে install করো:
        </p>
        <p>
          <strong>macOS-এ:</strong>
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ xcode-select --install`}
        />
        <p>
          <strong>Ubuntu/Debian-এ:</strong>
        </p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ sudo apt-get install build-essential`}
        />
        <p>
          অন্যান্য Linux distribution-এ GCC বা Clang install করতে হবে — তোমার
          distribution-এর documentation দেখো।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Windows-এ install করা</h2>
        <p>
          Windows-এ install করতে{" "}
          <a
            href="https://www.rust-lang.org/tools/install"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            rust-lang.org/tools/install
          </a>{" "}
          page থেকে installer download করে on-screen instruction follow করো।
          কিছু সময় Visual Studio install করতে বলবে — Rust-এর linker এবং
          native library দরকার, তাই এটা install করতেই হবে। বিস্তারিত guide আছে{" "}
          <a
            href="https://rust-lang.github.io/rustup/installation/windows-msvc.html"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            rustup-এর Windows MSVC documentation
          </a>
          -এ।
        </p>
        <p>
          Install শেষ হলে <InlineCode>cmd.exe</InlineCode> বা PowerShell —
          দু'জায়গাতেই rust-এর command কাজ করবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Install verify করা</h2>
        <p>
          নতুন একটা terminal খুলে (পুরোনোটায় <InlineCode>PATH</InlineCode>{" "}
          update না-ও হতে পারে) এই command চালাও:
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ rustc --version`} />
        <p>এই ধরনের output দেখলে বুঝবে সব ঠিক আছে:</p>
        <CodeBlock
          lang="text"
          filename="terminal output"
          code={`rustc x.y.z (abcabcabc yyyy-mm-dd)`}
        />
        <p>
          এখানে <InlineCode>x.y.z</InlineCode> হলো version number, পরের অংশটা
          সেই version-এর commit hash এবং তারিখ। তোমার দেখা output-এ এগুলো
          আলাদা হবে — সেটা স্বাভাবিক।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Command না পেলে — Troubleshoot</h2>
        <p>
          <InlineCode>rustc: command not found</InlineCode> error এলে বুঝতে
          হবে rustup ঠিকমতো <InlineCode>PATH</InlineCode> environment
          variable-এ নিজেকে যোগ করতে পারেনি। <InlineCode>PATH</InlineCode>{" "}
          check করো:
        </p>
        <p>
          <strong>Linux / macOS:</strong>
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ echo $PATH`} />
        <p>
          <strong>Windows CMD:</strong>
        </p>
        <CodeBlock lang="bat" filename="cmd" code={`> echo %PATH%`} />
        <p>
          <strong>Windows PowerShell:</strong>
        </p>
        <CodeBlock
          lang="powershell"
          filename="PowerShell"
          code={`> echo $env:Path`}
        />
        <p>
          Output-এ <InlineCode>~/.cargo/bin</InlineCode> (Linux/macOS) বা{" "}
          <InlineCode>%USERPROFILE%\\.cargo\\bin</InlineCode> (Windows) দেখা না
          গেলে terminal restart করো। তারপরও না হলে{" "}
          <a
            href="https://www.rust-lang.org/community"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-[var(--primary)]"
          >
            Rust community page
          </a>{" "}
          থেকে সাহায্য নাও।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Update এবং uninstall</h2>
        <p>Rust-এর নতুন version এলে এই command দিয়ে update করো:</p>
        <CodeBlock lang="bash" filename="terminal" code={`$ rustup update`} />
        <p>সম্পূর্ণ uninstall করতে চাইলে:</p>
        <CodeBlock
          lang="bash"
          filename="terminal"
          code={`$ rustup self uninstall`}
        />

        <h2 class="mt-10 text-2xl font-bold">Local documentation</h2>
        <p>
          Rust install করার সময় তোমার machine-এ standard library-এর সম্পূর্ণ
          documentation-ও copy হয়ে যায়। Internet ছাড়াই browser-এ দেখতে পারবে:
        </p>
        <CodeBlock lang="bash" filename="terminal" code={`$ rustup doc`} />
        <p>
          কোনো type বা function নিয়ে confusion হলে এই docs-ই সবচেয়ে authoritative
          source — Rust-এর প্রতিটা stable API এখানে আছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <strong>rustup</strong> হলো Rust toolchain manager — এটা{" "}
            <InlineCode>rustc</InlineCode> ও <InlineCode>cargo</InlineCode>{" "}
            install ও update করে।
          </li>
          <li>
            Linux/macOS-এ <InlineCode>curl ... | sh</InlineCode> command দিয়ে
            install হয়; Windows-এ rust-lang.org থেকে installer।
          </li>
          <li>
            Linker (build-essential / Xcode CLT / Visual Studio) লাগে —
            Rust-এর জন্য আলাদা component।
          </li>
          <li>
            <InlineCode>rustc --version</InlineCode> চালিয়ে install verify
            করতে হয়।
          </li>
          <li>
            <InlineCode>rustup update</InlineCode> দিয়ে update,{" "}
            <InlineCode>rustup self uninstall</InlineCode> দিয়ে uninstall,{" "}
            <InlineCode>rustup doc</InlineCode> দিয়ে offline docs।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ১.১: Rust install করা · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "rustup দিয়ে Linux, macOS, এবং Windows-এ Rust install করার সম্পূর্ণ গাইড।",
    },
  ],
};
