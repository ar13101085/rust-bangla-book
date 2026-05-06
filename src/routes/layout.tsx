import { component$, Slot, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Sidebar } from "~/components/sidebar/sidebar";

export default component$(() => {
  const sidebarOpen = useSignal(false);

  return (
    <div class="min-h-screen flex flex-col">
      <header class="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded p-2 hover:bg-[var(--muted)] lg:hidden"
              aria-label="পাঠসূচি toggle"
              onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link href="/" class="flex items-center gap-2">
              <span class="text-base font-bold tracking-tight md:text-lg">
                বাংলায় Rust শিখুন
              </span>
            </Link>
          </div>
          <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" class="hover:text-[var(--primary)]">
              হোম
            </Link>
            <Link
              href="/lessons/ch01-02-hello-world/"
              class="hover:text-[var(--primary)]"
            >
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

      <div class="mx-auto flex w-full max-w-7xl flex-1">
        {/* Mobile overlay backdrop */}
        <div
          class={`fixed inset-0 top-[57px] z-30 bg-black/40 lg:hidden ${
            sidebarOpen.value ? "block" : "hidden"
          }`}
          onClick$={() => (sidebarOpen.value = false)}
          aria-hidden="true"
        />

        <aside
          class={`fixed inset-y-0 left-0 top-[57px] z-40 h-[calc(100vh-57px)] w-72 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-4 transition-transform lg:sticky lg:top-[73px] lg:z-0 lg:h-[calc(100vh-73px)] lg:translate-x-0 lg:bg-transparent ${
            sidebarOpen.value ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick$={() => (sidebarOpen.value = false)}
        >
          <Sidebar />
        </aside>

        <main class="w-full min-w-0 flex-1 px-6 py-10 md:px-8 lg:py-12">
          <div class="mx-auto max-w-3xl">
            <Slot />
          </div>
        </main>
      </div>

      <footer class="border-t border-[var(--border)] bg-[var(--card)] py-6 text-center text-sm text-[var(--muted-foreground)]">
        Rust শেখার জন্য বাংলা টিউটোরিয়াল · code examples in English
      </footer>
    </div>
  );
});
