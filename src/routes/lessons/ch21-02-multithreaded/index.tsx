import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch21-02-multithreaded";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২১.২
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Single থেকে Multithreaded server-এ
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Turning Our Single-Threaded Server into a Multithreaded Server
        </p>
        <p class="mt-3">
          Single-threaded server-এর সমস্যা — একটা slow request পুরো server-কে block করে দেয়। সমাধান —{" "}
          thread pool: fixed সংখ্যক thread, queue থেকে job নিয়ে কাজ করে। এই পাঠে আমরা ধাপে ধাপে নিজের{" "}
          <InlineCode>ThreadPool</InlineCode> implement করব — <InlineCode>Worker</InlineCode>,{" "}
          <InlineCode>Job</InlineCode>, <InlineCode>mpsc</InlineCode>, আর{" "}
          <InlineCode>Arc&lt;Mutex&gt;</InlineCode>।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">সমস্যা simulate করা</h2>
        <p>
          একটা <InlineCode>/sleep</InlineCode> route বানিয়ে দেখি — slow request এলে অন্য request
          কেমন wait করে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}`}
        />
        <p>
          এখন browser-এ এক tab-এ <InlineCode>/sleep</InlineCode> open করো — সেটা ৫ second wait
          করছে। তারপর আরেক tab-এ <InlineCode>/</InlineCode> খুলো — সেটাও wait করে! কারণ single
          thread, sequentially handle।
        </p>

        <h2 class="mt-10 text-2xl font-bold">প্রতিটা request-এ নতুন thread? না।</h2>
        <p>
          সমাধান হিসেবে প্রতি request-এ <InlineCode>thread::spawn</InlineCode> করতেও পারি — কিন্তু
          attacker হাজার হাজার request পাঠালে server সব thread spawn করে memory exhaust হবে। তাই
          fixed-size <strong>thread pool</strong>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">আদর্শ API আগে design</h2>
        <p>
          Compiler-driven development — যেমন API চাই সেটা আগে লিখো, তারপর compiler-এর error থেকে
          implementation:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}`}
        />
        <p>
          <InlineCode>ThreadPool::new(4)</InlineCode> চারটা thread; <InlineCode>execute</InlineCode>{" "}
          closure নেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 1 — খালি ThreadPool</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`pub struct ThreadPool;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        ThreadPool
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}`}
        />
        <p>
          Trait bound গুলো <InlineCode>thread::spawn</InlineCode>-এর signature থেকে নেওয়া:{" "}
          <InlineCode>FnOnce()</InlineCode> (একবারই execute), <InlineCode>Send</InlineCode> (thread-এ
          transfer), <InlineCode>'static</InlineCode> (lifetime অজানা)।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 2 — input validate</h2>
        <CodeBlock
          lang="rust"
          code={`pub struct ThreadPool;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The \`new\` function will panic if the size is zero.
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        ThreadPool
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 3 — Worker struct</h2>
        <p>
          আমরা সরাসরি <InlineCode>JoinHandle</InlineCode> store না করে একটা{" "}
          <InlineCode>Worker</InlineCode> struct বানাই — id সহ:
        </p>
        <CodeBlock
          lang="rust"
          code={`use std::thread;

pub struct ThreadPool {
    workers: Vec<Worker>,
}

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        let thread = thread::spawn(|| {});

        Worker { id, thread }
    }
}`}
        />
        <p>
          <InlineCode>Vec::with_capacity</InlineCode> — known size, allocation efficient।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Step 4 — channel দিয়ে job পাঠানো</h2>
        <CodeBlock
          lang="rust"
          code={`use std::{sync::mpsc, thread};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers, sender }
    }
    // --snip--
}`}
        />
        <p>
          এক <InlineCode>sender</InlineCode>, এক <InlineCode>receiver</InlineCode>। কিন্তু একটা
          সমস্যা — <InlineCode>Receiver</InlineCode>-কে multiple worker-এর মধ্যে share করতে হবে।
          সরাসরি pass করতে গেলে first iteration-এ ownership move হয়ে যায়:
        </p>
        <CodeBlock
          lang="rust"
          filename="won't compile"
          code={`for id in 0..size {
    workers.push(Worker::new(id, receiver));  // moved on first iteration
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 5 — Arc&lt;Mutex&lt;Receiver&gt;&gt;</h2>
        <p>
          মাল্টিপল thread-এ একই <InlineCode>Receiver</InlineCode> share করতে হলে দু'টা জিনিস দরকার:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>Arc</InlineCode> — multiple ownership, atomic refcount।
          </li>
          <li>
            <InlineCode>Mutex</InlineCode> — একসাথে শুধু একজন read করবে (যাতে job duplicate না হয়)।
          </li>
        </ul>
        <CodeBlock
          lang="rust"
          code={`use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }
    // --snip--
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker { id, thread }
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 6 — Job type এবং execute</h2>
        <p>
          Closure-এর exact type জানা যায় না, তাই trait object: <InlineCode>Box&lt;dyn FnOnce() +
          Send + 'static&gt;</InlineCode>। এটা <InlineCode>Job</InlineCode> alias-এ:
        </p>
        <CodeBlock
          lang="rust"
          code={`type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Step 7 — Worker-এ loop</h2>
        <p>
          Worker thread infinitely loop — channel থেকে job receive করে, execute করে:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}`}
        />
        <p>
          <InlineCode>receiver.lock()</InlineCode> — Mutex acquire (<InlineCode>MutexGuard</InlineCode>{" "}
          ফেরত), <InlineCode>recv()</InlineCode> — channel থেকে job, <InlineCode>job()</InlineCode>{" "}
          — closure call।
        </p>

        <h2 class="mt-10 text-2xl font-bold">কেন while let না?</h2>
        <p>
          এই version লোভনীয় কিন্তু ভুল:
        </p>
        <CodeBlock
          lang="rust"
          filename="anti-pattern"
          code={`impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}`}
        />
        <p>
          সমস্যা — <InlineCode>while let</InlineCode>-এর temporary{" "}
          <InlineCode>MutexGuard</InlineCode> পুরো block (<InlineCode>job()</InlineCode> সহ) শেষ না
          হওয়া পর্যন্ত drop হয় না। ফলে অন্য worker lock পায় না, concurrency নষ্ট!
        </p>
        <p>
          আগের <InlineCode>let job = ...</InlineCode> version-এ semicolon-এর সাথে সাথে guard drop —
          job execute হওয়ার আগেই lock release হয়। সেটাই সঠিক pattern।
        </p>

        <h2 class="mt-10 text-2xl font-bold">পুরো lib.rs একসাথে</h2>
        <CodeBlock
          lang="rust"
          filename="src/lib.rs"
          code={`use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The \`new\` function will panic if the size is zero.
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Test</h2>
        <CodeBlock
          lang="text"
          code={`$ cargo run
   Compiling hello v0.1.0
    Finished \`dev\` profile
     Running \`target/debug/hello\`
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.`}
        />
        <p>
          এক tab-এ <InlineCode>/sleep</InlineCode>, আরেক tab-এ <InlineCode>/</InlineCode> — দ্বিতীয়
          সাথে সাথে respond, কারণ আলাদা worker সেটা handle করছে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Thread pool — fixed worker, কাজ-এর queue, DoS থেকে protection।
          </li>
          <li>
            Compiler-driven development — আগে desired API, তারপর implementation।
          </li>
          <li>
            <InlineCode>FnOnce + Send + 'static</InlineCode> — closure যেকোনো thread-এ একবার চালানোর
            জন্য typical bound।
          </li>
          <li>
            <InlineCode>Box&lt;dyn FnOnce()&gt;</InlineCode> trait object — heterogeneous closure
            store/transfer।
          </li>
          <li>
            <InlineCode>Arc&lt;Mutex&lt;Receiver&gt;&gt;</InlineCode> — single receiver multiple
            thread-এ share করার pattern।
          </li>
          <li>
            <InlineCode>let</InlineCode> vs <InlineCode>while let</InlineCode> — temporary
            MutexGuard-এর lifetime concurrency-তে গুরুত্বপূর্ণ।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২১.২: Single থেকে Multithreaded server-এ · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Thread pool বানানো — Worker, Job, mpsc channel, Arc<Mutex<Receiver>>; compiler-driven development আর FnOnce trait bound।",
    },
  ],
};
