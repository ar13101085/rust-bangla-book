# বাংলায় Rust শিখুন

> A community-driven Bangla translation of [_The Rust Programming Language_](https://doc.rust-lang.org/book/) — explaining every concept in Bengali while keeping all code examples and technical terms in English, exactly as they appear in `rustc` errors and the official docs.

[![License: MIT/Apache-2.0](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue)](#license)
[![Built with Qwik](https://img.shields.io/badge/built%20with-Qwik-ac7ff4)](https://qwik.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#contributing)

---

## Why this project exists

Rust is one of the most powerful systems languages today, but the official book and most quality learning resources are in English. For Bangla speakers — particularly students and self-taught developers — the language barrier slows down learning of a language that is already mentally demanding (ownership, lifetimes, async).

This project translates the entire Rust Book into Bangla following one strict convention:

- **Prose, explanations, intuitions → Bangla** (Bengali script, informal `তুমি` voice).
- **Code blocks → English** (verbatim from upstream, idiomatic identifiers).
- **Rust keywords and concept names → English Latin script, inline in Bangla prose** — `fn`, `let`, `struct`, `enum`, `impl`, `match`, `unsafe`, `Box`, `Rc`, "ownership", "borrowing", "lifetime", "trait object", etc.

This way readers build the same mental vocabulary that the compiler, error messages, crate documentation, and the global Rust community use — only the explanatory bridge is in their first language.

Example sentence pattern:

> Rust-এ প্রতিটি value-এর একটি `owner` থাকে, এবং `let` দিয়ে আমরা variable bind করি। যদি ownership transfer না করে data-টা শুধু পড়তে চাই, তাহলে reference ব্যবহার করি।

---

## Status

✅ **All 21 chapters fully translated** (101 static pages, no remaining stubs).

| Coverage | Count |
| --- | --- |
| Chapters | 21 / 21 |
| Sections | 80 / 80 |
| Chapter intro pages | 21 / 21 |
| Total static HTML pages | 101 |

---

## Table of Contents (পাঠসূচি)

### ১ — শুরু করা · Getting Started
- ১.১ Rust install করা · *Installation*
- ১.২ Hello, World!
- ১.৩ Hello, Cargo!

### ২ — একটি Guessing Game বানানো · Programming a Guessing Game
- A complete walkthrough — `let`, `match`, `Result`, `loop`, `rand` crate, error handling, all in one short project.

### ৩ — সাধারণ Programming Concepts · Common Programming Concepts
- ৩.১ Variable এবং Mutability · *Variables and Mutability*
- ৩.২ Data Type-সমূহ · *Data Types*
- ৩.৩ Function কীভাবে কাজ করে · *Functions*
- ৩.৪ Comment · *Comments*
- ৩.৫ Control Flow

### ৪ — Ownership বোঝা · Understanding Ownership
- ৪.১ Ownership কী? · *What Is Ownership?*
- ৪.২ Reference এবং Borrowing · *References and Borrowing*
- ৪.৩ Slice Type · *The Slice Type*

### ৫ — Struct ব্যবহার করে data সাজানো · Using Structs
- ৫.১ Struct define এবং তৈরি করা · *Defining and Instantiating Structs*
- ৫.২ Struct ব্যবহার করে একটি example program · *An Example Program Using Structs*
- ৫.৩ Method Syntax

### ৬ — Enum এবং Pattern Matching · Enums and Pattern Matching
- ৬.১ Enum define করা · *Defining an Enum*
- ৬.২ `match` Control Flow · *The `match` Control Flow Construct*
- ৬.৩ `if let` এবং `let...else` দিয়ে concise control flow

### ৭ — Package, Crate, এবং Module · Packages, Crates, and Modules
- ৭.১ Package এবং Crate · *Packages and Crates*
- ৭.২ Module দিয়ে scope ও privacy control করা · *Defining Modules*
- ৭.৩ Module tree-তে item refer করার Path · *Paths*
- ৭.৪ `use` keyword দিয়ে path scope-এ আনা
- ৭.৫ Module-গুলোকে আলাদা file-এ ভাগ করা · *Separating Modules into Different Files*

### ৮ — Common Collection-সমূহ · Common Collections
- ৮.১ Vector দিয়ে list রাখা · *Storing Lists with Vectors*
- ৮.২ String দিয়ে UTF-8 text রাখা · *Storing UTF-8 Encoded Text with Strings*
- ৮.৩ Hash Map-এ key এবং value রাখা · *Storing Keys with Associated Values in Hash Maps*

### ৯ — Error Handling
- ৯.১ `panic!` দিয়ে unrecoverable error · *Unrecoverable Errors*
- ৯.২ `Result` দিয়ে recoverable error · *Recoverable Errors with Result*
- ৯.৩ কখন `panic!` করব, কখন না · *To panic! or Not to panic!*

### ১০ — Generic Type, Trait, এবং Lifetime · Generic Types, Traits, and Lifetimes
- ১০.১ Generic data type · *Generic Data Types*
- ১০.২ Trait দিয়ে shared behavior define করা · *Defining Shared Behavior with Traits*
- ১০.৩ Lifetime দিয়ে reference validate করা · *Validating References with Lifetimes*

### ১১ — Automated Test লেখা · Writing Automated Tests
- ১১.১ Test কীভাবে লিখব · *How to Write Tests*
- ১১.২ Test কীভাবে run হবে control করা · *Controlling How Tests Are Run*
- ১১.৩ Test organize করা · *Test Organization*

### ১২ — একটি I/O Project · An I/O Project: Building a Command Line Program
A six-part project building `minigrep` — a simplified `grep`.
- ১২.১ Command line argument নেওয়া
- ১২.২ File পড়া
- ১২.৩ Modularity এবং error handling-এর জন্য refactor
- ১২.৪ TDD দিয়ে functionality যোগ করা
- ১২.৫ Environment variable নিয়ে কাজ
- ১২.৬ Error-গুলোকে standard error-এ পাঠানো

### ১৩ — Functional language features · Iterators and Closures
- ১৩.১ Closure · *Closures*
- ১৩.২ Iterator দিয়ে item-গুলো process করা · *Processing a Series of Items with Iterators*
- ১৩.৩ আমাদের I/O Project উন্নত করা · *Improving Our I/O Project*
- ১৩.৪ Loop বনাম Iterator-এর performance · *Comparing Performance*

### ১৪ — Cargo এবং Crates.io সম্পর্কে আরও · More about Cargo and Crates.io
- ১৪.১ Release profile দিয়ে build customize করা · *Customizing Builds with Release Profiles*
- ১৪.২ Crates.io-তে crate publish করা · *Publishing a Crate to Crates.io*
- ১৪.৩ Cargo Workspace · *Cargo Workspaces*
- ১৪.৪ `cargo install` দিয়ে binary install করা · *Installing Binaries*
- ১৪.৫ Custom command দিয়ে Cargo extend করা · *Extending Cargo*

### ১৫ — Smart Pointer · Smart Pointers
- ১৫.১ `Box<T>` দিয়ে heap-এ data রাখা
- ১৫.২ Smart Pointer-কে regular reference-এর মতো behave করানো · *Treating Smart Pointers Like Regular References*
- ১৫.৩ `Drop` trait দিয়ে cleanup-এ code চালানো
- ১৫.৪ `Rc<T>`: reference counted smart pointer
- ১৫.৫ `RefCell<T>` এবং Interior Mutability pattern
- ১৫.৬ Reference Cycle থেকে memory leak

### ১৬ — Fearless Concurrency
- ১৬.১ Thread দিয়ে code একসাথে চালানো · *Using Threads*
- ১৬.২ Message Passing দিয়ে thread-এর মধ্যে data পাঠানো · *Message Passing*
- ১৬.৩ Shared-state concurrency
- ১৬.৪ `Send` এবং `Sync` দিয়ে concurrency বাড়ানো · *Extensible Concurrency*

### ১৭ — Asynchronous Programming-এর মূল · Async, Await, Futures, and Streams
- ১৭.১ Future এবং Async syntax · *Futures and the Async Syntax*
- ১৭.২ Async দিয়ে concurrency apply করা · *Applying Concurrency with Async*
- ১৭.৩ একাধিক Future নিয়ে কাজ · *Working With Any Number of Futures*
- ১৭.৪ Stream: Future-এর sequence · *Streams*
- ১৭.৫ Async-এর Trait-গুলোতে আরও গভীরে · *A Closer Look at the Traits for Async*
- ১৭.৬ Future, Task, এবং Thread

### ১৮ — Rust-এ Object-Oriented Programming-এর feature
- ১৮.১ Object-Oriented language-এর বৈশিষ্ট্য · *Characteristics of OO Languages*
- ১৮.২ Trait Object দিয়ে shared behavior abstract করা · *Using Trait Objects*
- ১৮.৩ একটি Object-Oriented design pattern implement করা · *Implementing an OO Design Pattern*

### ১৯ — Pattern এবং Matching · Patterns and Matching
- ১৯.১ Pattern কোথায় কোথায় ব্যবহার হয় · *All the Places Patterns Can Be Used*
- ১৯.২ Refutability: Pattern fail করতে পারে কিনা
- ১৯.৩ Pattern Syntax

### ২০ — Advanced Feature-সমূহ · Advanced Features
- ২০.১ Unsafe Rust
- ২০.২ Advanced Trait · *Advanced Traits*
- ২০.৩ Advanced Type · *Advanced Types*
- ২০.৪ Advanced Function এবং Closure · *Advanced Functions and Closures*
- ২০.৫ Macro · *Macros*

### ২১ — Final Project: Multithreaded Web Server · Building a Multithreaded Web Server
- ২১.১ Single-Threaded Web Server বানানো · *Building a Single-Threaded Web Server*
- ২১.২ Single থেকে Multithreaded server-এ · *Turning into a Multithreaded Server*
- ২১.৩ Graceful Shutdown এবং Cleanup

---

## Tech stack

- **[Qwik](https://qwik.dev)** + **[Qwik City](https://qwik.dev/docs/)** — resumable framework, file-based routing.
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-first config via `@theme`.
- **[shadcn-style components](https://ui.shadcn.com)** — copy-in primitives (`Button`, `Card`) under `src/components/ui/`, built with `clsx` + `tailwind-merge` + `class-variance-authority`.
- **[`@fontsource/noto-sans-bengali`](https://fontsource.org/fonts/noto-sans-bengali)** — self-hosted Bangla web font (no Google Fonts dependency).
- **[`@fontsource/jetbrains-mono`](https://fontsource.org/fonts/jetbrains-mono)** — code monospace.
- **Qwik City static adapter** — outputs plain HTML to `dist/`, deployable to any static host.

---

## Getting started locally

### Prerequisites

- Node.js ≥ 20.3.0 (or ≥ 18.17.0)
- npm (yarn / pnpm should also work but commands below assume npm)

### Setup

```bash
git clone https://github.com/<your-fork>/Rust-Course-Bangla.git
cd Rust-Course-Bangla
npm install
```

### Run the dev server

```bash
npm start
```

Opens at `http://localhost:5173/`. Hot reload on save.

### Build the static site

```bash
npm run build
```

Outputs 101 static HTML pages to `dist/`. Deploy by uploading that folder to any static host (Cloudflare Pages, Netlify, GitHub Pages, S3, etc.).

Before deploying, change the canonical origin in `adapters/static/vite.config.ts`:

```ts
staticAdapter({
  origin: "https://your-domain.example",
}),
```

### Other commands

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with HMR (auto-opens browser). |
| `npm run dev` | Dev server without auto-open. |
| `npm run build` | Full production build → `dist/`. |
| `npm run preview` | Build + serve `dist/` locally. |
| `npm run build.types` | TypeScript typecheck only (no emit). |
| `npm run lint` | ESLint. |
| `npm run fmt` / `npm run fmt.check` | Prettier write / check. |
| `npm run gen.stubs` | Re-generate stub route files from `src/data/toc.ts`. |

---

## Project structure

```
Rust-Course-Bangla/
├── src/
│   ├── data/
│   │   └── toc.ts                 # Single source of truth: chapters + sections
│   ├── routes/
│   │   ├── index.tsx              # Home page (renders TOC from toc.ts)
│   │   ├── layout.tsx             # Header / footer wrapper
│   │   └── lessons/<slug>/        # 100 lesson routes (matches Rust Book slugs)
│   ├── components/
│   │   ├── chapter-intro/         # Helper: renders a chapter overview page
│   │   ├── code-block/            # CodeBlock (full snippet) + InlineCode
│   │   ├── lesson-nav/            # Prev/Next nav (uses neighbors() from toc.ts)
│   │   ├── stub-lesson/           # "Coming soon" placeholder (no longer used)
│   │   └── ui/                    # shadcn-style: Button, Card
│   ├── lib/
│   │   └── utils.ts               # cn() = clsx + tailwind-merge
│   ├── global.css                 # Tailwind v4 @theme + base typography
│   └── root.tsx                   # Document root (lang="bn")
├── adapters/
│   └── static/vite.config.ts      # Static-site-generation adapter
├── scripts/
│   └── gen-stubs.mjs              # Re-runnable stub generator
├── public/                        # Static assets (favicon etc.)
├── CLAUDE.md                      # Editorial guide (read before contributing)
├── package.json
└── vite.config.ts                 # Base Vite + qwikCity + tailwindcss
```

Path alias: `~/*` resolves to `src/*` (configured in `tsconfig.json`).

---

## Editorial conventions

The translation follows three strict rules. **Please honor these in every PR:**

1. **Prose: Bangla.** Headings, paragraphs, intuitive explanations — all in Bengali script.
2. **Code: English.** Every snippet inside `<CodeBlock>` is plain idiomatic Rust with English identifiers, taken verbatim from upstream where possible. Don't transliterate variable names like `secret_number` to Bangla.
3. **Keywords inline in English Latin script.** When a Rust keyword (`fn`, `let`, `mut`, `match`) or a concept name (ownership, borrowing, lifetime, trait) appears inside Bangla prose, write it in Latin script — wrap in `<InlineCode>` to set it apart visually. Do not transliterate to Bangla characters.

The full editorial guide is in [`CLAUDE.md`](./CLAUDE.md), which doubles as the brief for AI assistants helping with translations.

---

## How to add or improve a lesson

### Edit an existing lesson
1. Open `src/routes/lessons/<slug>/index.tsx`.
2. Edit prose, fix typos, refine technical wording.
3. Run `npm start` to preview.
4. Open a PR.

### Add a new chapter or section
1. Add the entry to the appropriate `Chapter.sections` array in `src/data/toc.ts` (or a new chapter to the top-level `chapters` array).
2. Run `npm run gen.stubs` — it creates a stub route file under `src/routes/lessons/<slug>/index.tsx`. Existing files are never overwritten.
3. Replace the stub with full content. Use `ch01-02-hello-world/index.tsx` or any completed lesson as a template.
4. Flip that lesson's `status` to `"done"` in `toc.ts`.

The `<CodeBlock>` and `<InlineCode>` components are exported from `~/components/code-block/code-block`. The `<LessonNav>` component (auto prev/next) goes at the end of every lesson.

---

## Contributing

This is an open-source project — contributions of every size are welcome.

**Good first contributions**
- Fix typos or awkward Bangla phrasing in any lesson.
- Improve a metaphor or example to better fit Bangla-speaking learners' context.
- Suggest better Bangla translations for borderline terms while keeping the strict English-keyword rule.
- Flag inconsistencies between two lessons (e.g., a concept introduced one way in chapter 4, then explained slightly differently in chapter 15).

**Bigger contributions**
- Translate the Foreword, Introduction, or Appendices A–G (currently not yet covered).
- Add real syntax highlighting to `<CodeBlock>` (e.g., via Shiki at build time).
- Improve the home page TOC presentation, mobile layout, or dark mode.
- Add search across lessons.

**Workflow**
1. Fork → branch → edit.
2. Make sure `npm run build` passes (it runs typecheck + lint + SSG).
3. Open a PR with a clear description in either English or Bangla.

For larger changes, please open an issue first to discuss the approach.

---

## Acknowledgments

- The original [_The Rust Programming Language_](https://doc.rust-lang.org/book/) by Steve Klabnik, Carol Nichols, and the Rust Community — without which this project would not exist.
- The Rust core team for explicitly licensing the Book under MIT/Apache-2.0 to enable translations like this one.
- Everyone who reads the lessons, files an issue, or sends a PR.

---

## License

This project is dual-licensed under either:

- **[MIT License](https://opensource.org/licenses/MIT)** ([LICENSE-MIT](./LICENSE-MIT))
- **[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)** ([LICENSE-APACHE](./LICENSE-APACHE))

at your option — the same dual license used by the original Rust Book.

The Bangla translation text is original work covered by these licenses. Code snippets are taken from or based on the upstream Rust Book and remain under the original license.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this project shall be dual licensed as above, without any additional terms or conditions.
