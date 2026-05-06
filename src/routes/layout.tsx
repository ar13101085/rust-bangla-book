import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-[var(--border)] bg-[var(--card)]">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight">
              বাংলায় Rust শিখুন
            </span>
          </Link>
          <nav class="flex items-center gap-6 text-sm font-medium">
            <Link href="/" class="hover:text-[var(--primary)]">
              হোম
            </Link>
            <Link href="/lessons/ch01-02-hello-world/" class="hover:text-[var(--primary)]">
              পাঠসমূহ
            </Link>
            <a
              href="https://www.rust-lang.org"
              target="_blank"
              rel="noreferrer"
              class="hover:text-[var(--primary)]"
            >
              rust-lang.org
            </a>
          </nav>
        </div>
      </header>

      <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Slot />
      </main>

      <footer class="border-t border-[var(--border)] bg-[var(--card)] py-6 text-center text-sm text-[var(--muted-foreground)]">
        Rust শেখার জন্য বাংলা টিউটোরিয়াল · code examples in English
      </footer>
    </div>
  );
});
