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
          <div class="flex items-center gap-4">
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
            </nav>
            <a
              href="https://github.com/ar13101085/rust-bangla-book"
              target="_blank"
              rel="noreferrer"
              class="rounded p-2 hover:bg-[var(--muted)] hover:text-[var(--primary)]"
              aria-label="GitHub repository"
              title="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
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
