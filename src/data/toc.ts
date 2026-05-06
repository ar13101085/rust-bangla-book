export type LessonStatus = "stub" | "wip" | "done";

export type Lesson = {
  slug: string;
  num: string;
  titleEn: string;
  titleBn: string;
  status: LessonStatus;
  chapter: number;
};

export type Chapter = {
  num: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  sections: Lesson[];
  status?: LessonStatus;
};

export const chapters: Chapter[] = [
  {
    num: 1,
    slug: "ch01-00-getting-started",
    titleEn: "Getting Started",
    titleBn: "শুরু করা",
    sections: [
      { slug: "ch01-01-installation", num: "১.১", titleEn: "Installation", titleBn: "Rust install করা", status: "done", chapter: 1 },
      { slug: "ch01-02-hello-world", num: "১.২", titleEn: "Hello, World!", titleBn: "Hello, World!", status: "done", chapter: 1 },
      { slug: "ch01-03-hello-cargo", num: "১.৩", titleEn: "Hello, Cargo!", titleBn: "Hello, Cargo!", status: "done", chapter: 1 },
    ],
  },
  {
    num: 2,
    slug: "ch02-00-guessing-game-tutorial",
    titleEn: "Programming a Guessing Game",
    titleBn: "একটি Guessing Game বানানো",
    sections: [],
    status: "done",
  },
  {
    num: 3,
    slug: "ch03-00-common-programming-concepts",
    titleEn: "Common Programming Concepts",
    titleBn: "সাধারণ programming concepts",
    sections: [
      { slug: "ch03-01-variables-and-mutability", num: "৩.১", titleEn: "Variables and Mutability", titleBn: "Variable এবং Mutability", status: "done", chapter: 3 },
      { slug: "ch03-02-data-types", num: "৩.২", titleEn: "Data Types", titleBn: "Data Type-সমূহ", status: "done", chapter: 3 },
      { slug: "ch03-03-how-functions-work", num: "৩.৩", titleEn: "Functions", titleBn: "Function কীভাবে কাজ করে", status: "done", chapter: 3 },
      { slug: "ch03-04-comments", num: "৩.৪", titleEn: "Comments", titleBn: "Comment", status: "done", chapter: 3 },
      { slug: "ch03-05-control-flow", num: "৩.৫", titleEn: "Control Flow", titleBn: "Control Flow", status: "done", chapter: 3 },
    ],
  },
  {
    num: 4,
    slug: "ch04-00-understanding-ownership",
    titleEn: "Understanding Ownership",
    titleBn: "Ownership বোঝা",
    sections: [
      { slug: "ch04-01-what-is-ownership", num: "৪.১", titleEn: "What is Ownership?", titleBn: "Ownership কী?", status: "done", chapter: 4 },
      { slug: "ch04-02-references-and-borrowing", num: "৪.২", titleEn: "References and Borrowing", titleBn: "Reference এবং Borrowing", status: "done", chapter: 4 },
      { slug: "ch04-03-slices", num: "৪.৩", titleEn: "The Slice Type", titleBn: "Slice Type", status: "done", chapter: 4 },
    ],
  },
  {
    num: 5,
    slug: "ch05-00-structs",
    titleEn: "Using Structs to Structure Related Data",
    titleBn: "Struct ব্যবহার করে data সাজানো",
    sections: [
      { slug: "ch05-01-defining-structs", num: "৫.১", titleEn: "Defining and Instantiating Structs", titleBn: "Struct define এবং তৈরি করা", status: "done", chapter: 5 },
      { slug: "ch05-02-example-structs", num: "৫.২", titleEn: "An Example Program Using Structs", titleBn: "Struct ব্যবহার করে একটি example program", status: "done", chapter: 5 },
      { slug: "ch05-03-method-syntax", num: "৫.৩", titleEn: "Methods", titleBn: "Method Syntax", status: "done", chapter: 5 },
    ],
  },
  {
    num: 6,
    slug: "ch06-00-enums",
    titleEn: "Enums and Pattern Matching",
    titleBn: "Enum এবং Pattern Matching",
    sections: [
      { slug: "ch06-01-defining-an-enum", num: "৬.১", titleEn: "Defining an Enum", titleBn: "Enum define করা", status: "done", chapter: 6 },
      { slug: "ch06-02-match", num: "৬.২", titleEn: "The match Control Flow Construct", titleBn: "match control flow", status: "done", chapter: 6 },
      { slug: "ch06-03-if-let", num: "৬.৩", titleEn: "Concise Control Flow with if let and let...else", titleBn: "if let এবং let...else দিয়ে concise control flow", status: "done", chapter: 6 },
    ],
  },
  {
    num: 7,
    slug: "ch07-00-managing-growing-projects-with-packages-crates-and-modules",
    titleEn: "Managing Growing Projects with Packages, Crates, and Modules",
    titleBn: "Package, Crate, এবং Module দিয়ে বড় project সামলানো",
    sections: [
      { slug: "ch07-01-packages-and-crates", num: "৭.১", titleEn: "Packages and Crates", titleBn: "Package এবং Crate", status: "done", chapter: 7 },
      { slug: "ch07-02-defining-modules-to-control-scope-and-privacy", num: "৭.২", titleEn: "Defining Modules to Control Scope and Privacy", titleBn: "Module দিয়ে scope ও privacy control করা", status: "done", chapter: 7 },
      { slug: "ch07-03-paths-for-referring-to-an-item-in-the-module-tree", num: "৭.৩", titleEn: "Paths for Referring to an Item in the Module Tree", titleBn: "Module tree-তে item refer করার Path", status: "done", chapter: 7 },
      { slug: "ch07-04-bringing-paths-into-scope-with-the-use-keyword", num: "৭.৪", titleEn: "Bringing Paths Into Scope with the use Keyword", titleBn: "use keyword দিয়ে path scope-এ আনা", status: "done", chapter: 7 },
      { slug: "ch07-05-separating-modules-into-different-files", num: "৭.৫", titleEn: "Separating Modules into Different Files", titleBn: "Module-গুলোকে আলাদা file-এ ভাগ করা", status: "done", chapter: 7 },
    ],
  },
  {
    num: 8,
    slug: "ch08-00-common-collections",
    titleEn: "Common Collections",
    titleBn: "Common Collection-সমূহ",
    sections: [
      { slug: "ch08-01-vectors", num: "৮.১", titleEn: "Storing Lists of Values with Vectors", titleBn: "Vector দিয়ে list রাখা", status: "done", chapter: 8 },
      { slug: "ch08-02-strings", num: "৮.২", titleEn: "Storing UTF-8 Encoded Text with Strings", titleBn: "String দিয়ে UTF-8 text রাখা", status: "done", chapter: 8 },
      { slug: "ch08-03-hash-maps", num: "৮.৩", titleEn: "Storing Keys with Associated Values in Hash Maps", titleBn: "Hash Map-এ key এবং value রাখা", status: "done", chapter: 8 },
    ],
  },
  {
    num: 9,
    slug: "ch09-00-error-handling",
    titleEn: "Error Handling",
    titleBn: "Error Handling",
    sections: [
      { slug: "ch09-01-unrecoverable-errors-with-panic", num: "৯.১", titleEn: "Unrecoverable Errors with panic!", titleBn: "panic! দিয়ে unrecoverable error", status: "done", chapter: 9 },
      { slug: "ch09-02-recoverable-errors-with-result", num: "৯.২", titleEn: "Recoverable Errors with Result", titleBn: "Result দিয়ে recoverable error", status: "done", chapter: 9 },
      { slug: "ch09-03-to-panic-or-not-to-panic", num: "৯.৩", titleEn: "To panic! or Not to panic!", titleBn: "কখন panic! করব, কখন না", status: "done", chapter: 9 },
    ],
  },
  {
    num: 10,
    slug: "ch10-00-generics",
    titleEn: "Generic Types, Traits, and Lifetimes",
    titleBn: "Generic Type, Trait, এবং Lifetime",
    sections: [
      { slug: "ch10-01-syntax", num: "১০.১", titleEn: "Generic Data Types", titleBn: "Generic data type", status: "done", chapter: 10 },
      { slug: "ch10-02-traits", num: "১০.২", titleEn: "Defining Shared Behavior with Traits", titleBn: "Trait দিয়ে shared behavior define করা", status: "done", chapter: 10 },
      { slug: "ch10-03-lifetime-syntax", num: "১০.৩", titleEn: "Validating References with Lifetimes", titleBn: "Lifetime দিয়ে reference validate করা", status: "done", chapter: 10 },
    ],
  },
  {
    num: 11,
    slug: "ch11-00-testing",
    titleEn: "Writing Automated Tests",
    titleBn: "Automated Test লেখা",
    sections: [
      { slug: "ch11-01-writing-tests", num: "১১.১", titleEn: "How to Write Tests", titleBn: "Test কীভাবে লিখব", status: "done", chapter: 11 },
      { slug: "ch11-02-running-tests", num: "১১.২", titleEn: "Controlling How Tests Are Run", titleBn: "Test কীভাবে run হবে control করা", status: "done", chapter: 11 },
      { slug: "ch11-03-test-organization", num: "১১.৩", titleEn: "Test Organization", titleBn: "Test organize করা", status: "done", chapter: 11 },
    ],
  },
  {
    num: 12,
    slug: "ch12-00-an-io-project",
    titleEn: "An I/O Project: Building a Command Line Program",
    titleBn: "একটি I/O Project: Command Line Program",
    sections: [
      { slug: "ch12-01-accepting-command-line-arguments", num: "১২.১", titleEn: "Accepting Command Line Arguments", titleBn: "Command line argument নেওয়া", status: "done", chapter: 12 },
      { slug: "ch12-02-reading-a-file", num: "১২.২", titleEn: "Reading a File", titleBn: "File পড়া", status: "done", chapter: 12 },
      { slug: "ch12-03-improving-error-handling-and-modularity", num: "১২.৩", titleEn: "Refactoring to Improve Modularity and Error Handling", titleBn: "Modularity এবং error handling-এর জন্য refactor", status: "done", chapter: 12 },
      { slug: "ch12-04-testing-the-librarys-functionality", num: "১২.৪", titleEn: "Adding Functionality with Test Driven Development", titleBn: "TDD দিয়ে functionality যোগ করা", status: "done", chapter: 12 },
      { slug: "ch12-05-working-with-environment-variables", num: "১২.৫", titleEn: "Working with Environment Variables", titleBn: "Environment variable নিয়ে কাজ", status: "done", chapter: 12 },
      { slug: "ch12-06-writing-to-stderr-instead-of-stdout", num: "১২.৬", titleEn: "Redirecting Errors to Standard Error", titleBn: "Error-গুলোকে standard error-এ পাঠানো", status: "done", chapter: 12 },
    ],
  },
  {
    num: 13,
    slug: "ch13-00-functional-features",
    titleEn: "Functional Language Features: Iterators and Closures",
    titleBn: "Functional language features: Iterator এবং Closure",
    sections: [
      { slug: "ch13-01-closures", num: "১৩.১", titleEn: "Closures", titleBn: "Closure", status: "stub", chapter: 13 },
      { slug: "ch13-02-iterators", num: "১৩.২", titleEn: "Processing a Series of Items with Iterators", titleBn: "Iterator দিয়ে item-গুলো process করা", status: "stub", chapter: 13 },
      { slug: "ch13-03-improving-our-io-project", num: "১৩.৩", titleEn: "Improving Our I/O Project", titleBn: "আমাদের I/O Project উন্নত করা", status: "stub", chapter: 13 },
      { slug: "ch13-04-performance", num: "১৩.৪", titleEn: "Performance in Loops vs. Iterators", titleBn: "Loop বনাম Iterator-এর performance", status: "stub", chapter: 13 },
    ],
  },
  {
    num: 14,
    slug: "ch14-00-more-about-cargo",
    titleEn: "More about Cargo and Crates.io",
    titleBn: "Cargo এবং Crates.io সম্পর্কে আরও",
    sections: [
      { slug: "ch14-01-release-profiles", num: "১৪.১", titleEn: "Customizing Builds with Release Profiles", titleBn: "Release profile দিয়ে build customize করা", status: "stub", chapter: 14 },
      { slug: "ch14-02-publishing-to-crates-io", num: "১৪.২", titleEn: "Publishing a Crate to Crates.io", titleBn: "Crates.io-তে crate publish করা", status: "stub", chapter: 14 },
      { slug: "ch14-03-cargo-workspaces", num: "১৪.৩", titleEn: "Cargo Workspaces", titleBn: "Cargo Workspace", status: "stub", chapter: 14 },
      { slug: "ch14-04-installing-binaries", num: "১৪.৪", titleEn: "Installing Binaries with cargo install", titleBn: "cargo install দিয়ে binary install করা", status: "stub", chapter: 14 },
      { slug: "ch14-05-extending-cargo", num: "১৪.৫", titleEn: "Extending Cargo with Custom Commands", titleBn: "Custom command দিয়ে Cargo extend করা", status: "stub", chapter: 14 },
    ],
  },
  {
    num: 15,
    slug: "ch15-00-smart-pointers",
    titleEn: "Smart Pointers",
    titleBn: "Smart Pointer",
    sections: [
      { slug: "ch15-01-box", num: "১৫.১", titleEn: "Using Box<T> to Point to Data on the Heap", titleBn: "Box<T> দিয়ে heap-এ data রাখা", status: "stub", chapter: 15 },
      { slug: "ch15-02-deref", num: "১৫.২", titleEn: "Treating Smart Pointers Like Regular References", titleBn: "Smart Pointer-কে regular reference-এর মতো behave করানো", status: "stub", chapter: 15 },
      { slug: "ch15-03-drop", num: "১৫.৩", titleEn: "Running Code on Cleanup with the Drop Trait", titleBn: "Drop trait দিয়ে cleanup-এ code চালানো", status: "stub", chapter: 15 },
      { slug: "ch15-04-rc", num: "১৫.৪", titleEn: "Rc<T>, the Reference Counted Smart Pointer", titleBn: "Rc<T>: reference counted smart pointer", status: "stub", chapter: 15 },
      { slug: "ch15-05-interior-mutability", num: "১৫.৫", titleEn: "RefCell<T> and the Interior Mutability Pattern", titleBn: "RefCell<T> এবং Interior Mutability pattern", status: "stub", chapter: 15 },
      { slug: "ch15-06-reference-cycles", num: "১৫.৬", titleEn: "Reference Cycles Can Leak Memory", titleBn: "Reference Cycle থেকে memory leak", status: "stub", chapter: 15 },
    ],
  },
  {
    num: 16,
    slug: "ch16-00-concurrency",
    titleEn: "Fearless Concurrency",
    titleBn: "Fearless Concurrency",
    sections: [
      { slug: "ch16-01-threads", num: "১৬.১", titleEn: "Using Threads to Run Code Simultaneously", titleBn: "Thread দিয়ে code একসাথে চালানো", status: "stub", chapter: 16 },
      { slug: "ch16-02-message-passing", num: "১৬.২", titleEn: "Using Message Passing to Transfer Data Between Threads", titleBn: "Message Passing দিয়ে thread-এর মধ্যে data পাঠানো", status: "stub", chapter: 16 },
      { slug: "ch16-03-shared-state", num: "১৬.৩", titleEn: "Shared-State Concurrency", titleBn: "Shared-state concurrency", status: "stub", chapter: 16 },
      { slug: "ch16-04-extensible-concurrency-sync-and-send", num: "১৬.৪", titleEn: "Extensible Concurrency with the Send and Sync Traits", titleBn: "Send এবং Sync দিয়ে concurrency বাড়ানো", status: "stub", chapter: 16 },
    ],
  },
  {
    num: 17,
    slug: "ch17-00-async-await",
    titleEn: "Fundamentals of Asynchronous Programming: Async, Await, Futures, and Streams",
    titleBn: "Asynchronous Programming-এর মূল: Async, Await, Future, Stream",
    sections: [
      { slug: "ch17-01-futures-and-syntax", num: "১৭.১", titleEn: "Futures and the Async Syntax", titleBn: "Future এবং Async syntax", status: "stub", chapter: 17 },
      { slug: "ch17-02-concurrency-with-async", num: "১৭.২", titleEn: "Applying Concurrency with Async", titleBn: "Async দিয়ে concurrency apply করা", status: "stub", chapter: 17 },
      { slug: "ch17-03-more-futures", num: "১৭.৩", titleEn: "Working With Any Number of Futures", titleBn: "একাধিক Future নিয়ে কাজ", status: "stub", chapter: 17 },
      { slug: "ch17-04-streams", num: "১৭.৪", titleEn: "Streams: Futures in Sequence", titleBn: "Stream: Future-এর sequence", status: "stub", chapter: 17 },
      { slug: "ch17-05-traits-for-async", num: "১৭.৫", titleEn: "A Closer Look at the Traits for Async", titleBn: "Async-এর Trait-গুলোতে আরও গভীরে", status: "stub", chapter: 17 },
      { slug: "ch17-06-futures-tasks-threads", num: "১৭.৬", titleEn: "Futures, Tasks, and Threads", titleBn: "Future, Task, এবং Thread", status: "stub", chapter: 17 },
    ],
  },
  {
    num: 18,
    slug: "ch18-00-oop",
    titleEn: "Object-Oriented Programming Features of Rust",
    titleBn: "Rust-এ Object-Oriented Programming-এর feature",
    sections: [
      { slug: "ch18-01-what-is-oo", num: "১৮.১", titleEn: "Characteristics of Object-Oriented Languages", titleBn: "Object-Oriented language-এর বৈশিষ্ট্য", status: "stub", chapter: 18 },
      { slug: "ch18-02-trait-objects", num: "১৮.২", titleEn: "Using Trait Objects That Allow for Values of Different Types", titleBn: "Trait Object দিয়ে shared behavior abstract করা", status: "stub", chapter: 18 },
      { slug: "ch18-03-oo-design-patterns", num: "১৮.৩", titleEn: "Implementing an Object-Oriented Design Pattern", titleBn: "একটি Object-Oriented design pattern implement করা", status: "stub", chapter: 18 },
    ],
  },
  {
    num: 19,
    slug: "ch19-00-patterns",
    titleEn: "Patterns and Matching",
    titleBn: "Pattern এবং Matching",
    sections: [
      { slug: "ch19-01-all-the-places-for-patterns", num: "১৯.১", titleEn: "All the Places Patterns Can Be Used", titleBn: "Pattern কোথায় কোথায় ব্যবহার হয়", status: "stub", chapter: 19 },
      { slug: "ch19-02-refutability", num: "১৯.২", titleEn: "Refutability: Whether a Pattern Might Fail to Match", titleBn: "Refutability: Pattern fail করতে পারে কিনা", status: "stub", chapter: 19 },
      { slug: "ch19-03-pattern-syntax", num: "১৯.৩", titleEn: "Pattern Syntax", titleBn: "Pattern Syntax", status: "stub", chapter: 19 },
    ],
  },
  {
    num: 20,
    slug: "ch20-00-advanced-features",
    titleEn: "Advanced Features",
    titleBn: "Advanced Feature-সমূহ",
    sections: [
      { slug: "ch20-01-unsafe-rust", num: "২০.১", titleEn: "Unsafe Rust", titleBn: "Unsafe Rust", status: "stub", chapter: 20 },
      { slug: "ch20-02-advanced-traits", num: "২০.২", titleEn: "Advanced Traits", titleBn: "Advanced Trait", status: "stub", chapter: 20 },
      { slug: "ch20-03-advanced-types", num: "২০.৩", titleEn: "Advanced Types", titleBn: "Advanced Type", status: "stub", chapter: 20 },
      { slug: "ch20-04-advanced-functions-and-closures", num: "২০.৪", titleEn: "Advanced Functions and Closures", titleBn: "Advanced Function এবং Closure", status: "stub", chapter: 20 },
      { slug: "ch20-05-macros", num: "২০.৫", titleEn: "Macros", titleBn: "Macro", status: "stub", chapter: 20 },
    ],
  },
  {
    num: 21,
    slug: "ch21-00-final-project-a-web-server",
    titleEn: "Final Project: Building a Multithreaded Web Server",
    titleBn: "Final Project: Multithreaded Web Server",
    sections: [
      { slug: "ch21-01-single-threaded", num: "২১.১", titleEn: "Building a Single-Threaded Web Server", titleBn: "Single-Threaded Web Server বানানো", status: "stub", chapter: 21 },
      { slug: "ch21-02-multithreaded", num: "২১.২", titleEn: "Turning Our Single-Threaded Server into a Multithreaded Server", titleBn: "Single থেকে Multithreaded server-এ", status: "stub", chapter: 21 },
      { slug: "ch21-03-graceful-shutdown-and-cleanup", num: "২১.৩", titleEn: "Graceful Shutdown and Cleanup", titleBn: "Graceful Shutdown এবং Cleanup", status: "stub", chapter: 21 },
    ],
  },
];

export const allLessons: Lesson[] = chapters.flatMap((ch) => {
  const intro: Lesson = {
    slug: ch.slug,
    num: String(ch.num),
    titleEn: ch.titleEn,
    titleBn: ch.titleBn,
    status: ch.status ?? "stub",
    chapter: ch.num,
  };
  return [intro, ...ch.sections];
});

export function findLesson(slug: string): Lesson | undefined {
  return allLessons.find((l) => l.slug === slug);
}

export function neighbors(slug: string): { prev?: Lesson; next?: Lesson } {
  const idx = allLessons.findIndex((l) => l.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? allLessons[idx - 1] : undefined,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : undefined,
  };
}
