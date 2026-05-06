import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch21-03-graceful-shutdown-and-cleanup";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২১.৩
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Graceful Shutdown এবং Cleanup
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Graceful Shutdown and Cleanup
        </p>
        <p class="mt-3">
          আগের পাঠের server চলছে ঠিকই, কিন্তু Ctrl-C করলে সব thread আকস্মিকভাবে বন্ধ — চলমান
          request মাঝপথে কাটা পড়ে। ঠিক হবে — server বন্ধ হওয়ার সময় চলমান কাজ শেষ করে, তারপর
          gracefully exit। এই পাঠে <InlineCode>Drop</InlineCode> trait দিয়ে cleanup, channel close
          করে worker-কে stop signal, আর <InlineCode>Option::take</InlineCode> দিয়ে ownership
          handle।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">প্রথম attempt — Drop implement</h2>
        <p>
          <InlineCode>ThreadPool</InlineCode> drop হলে প্রতিটা worker-এর thread-এ join করতে চাই —
          মানে worker thread শেষ না হওয়া পর্যন্ত wait:
        </p>
        <CodeBlock
          lang="rust"
          filename="won't compile"
          code={`impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}`}
        />
        <p>
          Compiler error — <InlineCode>JoinHandle::join</InlineCode> argument-এর ownership নেয়;
          কিন্তু <InlineCode>&amp;mut</InlineCode>-এর ভিতর থেকে move করা যাবে না।
        </p>

        <h2 class="mt-10 text-2xl font-bold">সমাধান — Vec::drain</h2>
        <p>
          <InlineCode>drain</InlineCode> Vec থেকে সব element move করে নিয়ে আসে — ownership transfer
          হয়:
        </p>
        <CodeBlock
          lang="rust"
          code={`impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in self.workers.drain(..) {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}`}
        />
        <p>
          কিন্তু এতে আরেকটা সমস্যা — worker-এর <InlineCode>loop</InlineCode> infinite, কোনো signal
          ছাড়া কখনো শেষ হবে না। তাই <InlineCode>join</InlineCode> চিরকাল wait করবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Worker-কে stop signal পাঠানো</h2>
        <p>
          Idea — <InlineCode>sender</InlineCode> drop করলে channel close হয়, তখন{" "}
          <InlineCode>recv()</InlineCode> <InlineCode>Err</InlineCode> দেয়। সেটা পেলেই worker
          loop break করবে।
        </p>
        <p>
          কিন্তু <InlineCode>ThreadPool</InlineCode>-এ <InlineCode>sender</InlineCode> field
          থাকলে, drop-এর সময় সেটা নিজেই pool-এর সাথে drop হবে — manually আগে drop করা যাবে না।
          সমাধান — <InlineCode>Option</InlineCode>-এ wrap, যাতে <InlineCode>take()</InlineCode>{" "}
          করা যায়।
        </p>

        <h3 class="mt-6 text-xl font-bold">struct update</h3>
        <CodeBlock
          lang="rust"
          code={`pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}`}
        />

        <h3 class="mt-6 text-xl font-bold">new() update</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn new(size: usize) -> ThreadPool {
    assert!(size > 0);

    let (sender, receiver) = mpsc::channel();

    let receiver = Arc::new(Mutex::new(receiver));

    let mut workers = Vec::with_capacity(size);

    for id in 0..size {
        workers.push(Worker::new(id, Arc::clone(&receiver)));
    }

    ThreadPool {
        workers,
        sender: Some(sender),
    }
}`}
        />

        <h3 class="mt-6 text-xl font-bold">execute() update</h3>
        <CodeBlock
          lang="rust"
          code={`pub fn execute<F>(&self, f: F)
where
    F: FnOnce() + Send + 'static,
{
    let job = Box::new(f);

    self.sender.as_ref().unwrap().send(job).unwrap();
}`}
        />
        <p>
          <InlineCode>as_ref()</InlineCode> — <InlineCode>Option&lt;Sender&gt;</InlineCode> থেকে{" "}
          <InlineCode>Option&lt;&amp;Sender&gt;</InlineCode>; pool চালু থাকা অবস্থায় এটা সবসময়{" "}
          <InlineCode>Some</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Worker-এ Option&lt;JoinHandle&gt;</h2>
        <p>
          একই pattern Worker-এর thread-এ — কারণ drop-এর সময় ownership take করে join করতে চাই:
        </p>
        <CodeBlock
          lang="rust"
          code={`struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}`}
        />

        <h3 class="mt-6 text-xl font-bold">Worker::new — recv-এ match</h3>
        <CodeBlock
          lang="rust"
          code={`impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let message = receiver.lock().unwrap().recv();

                match message {
                    Ok(job) => {
                        println!("Worker {id} got a job; executing.");

                        job();
                    }
                    Err(_) => {
                        println!("Worker {id} disconnected; shutting down.");
                        break;
                    }
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}`}
        />
        <p>
          আগের <InlineCode>recv().unwrap()</InlineCode>-এর জায়গায় <InlineCode>match</InlineCode>।
          Channel close হলে <InlineCode>Err</InlineCode> আসে, worker break করে — clean exit।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Drop impl চূড়ান্ত</h2>
        <CodeBlock
          lang="rust"
          code={`impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}`}
        />
        <p>
          ক্রম গুরুত্বপূর্ণ:
        </p>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            প্রথমে <InlineCode>self.sender.take()</InlineCode> — option থেকে sender বের করে আনে,
            তারপর <InlineCode>drop()</InlineCode> দিয়ে drop। ফলে channel close, worker-এরা{" "}
            <InlineCode>Err</InlineCode> পেয়ে break হয়।
          </li>
          <li>
            তারপর প্রতিটা worker-এর thread <InlineCode>take().join()</InlineCode> — wait এবং clean।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">Test — দু'টা request পরে shutdown</h2>
        <p>
          Demo-র জন্য <InlineCode>main</InlineCode>-এ <InlineCode>take(2)</InlineCode> বসাই — শুধু
          দু'টা request handle করে server বন্ধ:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use hello::ThreadPool;
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
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
        <CodeBlock
          lang="text"
          code={`$ cargo run
Worker 0 got a job; executing.
Shutting down.
Shutting down worker 0
Worker 3 got a job; executing.
Worker 1 disconnected; shutting down.
Worker 2 disconnected; shutting down.
Worker 3 disconnected; shutting down.
Worker 0 disconnected; shutting down.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3`}
        />
        <p>
          সব worker disconnect message print করে, তারপর pool-ের drop-এ একে একে join — graceful
          shutdown complete।
        </p>

        <h2 class="mt-10 text-2xl font-bold">আরও কী করা যায়</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>ThreadPool</InlineCode> এবং তার public method-এ আরও documentation।
          </li>
          <li>
            Library-র জন্য test লেখা।
          </li>
          <li>
            <InlineCode>unwrap</InlineCode>-এর জায়গায় robust error handling।
          </li>
          <li>
            <InlineCode>ThreadPool</InlineCode>-কে শুধু web server না, অন্য task-এর জন্যেও ব্যবহার।
          </li>
          <li>
            crates.io-তে existing thread pool crate দেখে compare — তারা কী আলাদা করেছে।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">পুরো book শেষ — অভিনন্দন!</h2>
        <p>
          এই project-এ চ্যাপ্টার ১৬-এর thread, mpsc, Mutex, Arc; চ্যাপ্টার ১৭-এর channel ধারণা;
          চ্যাপ্টার ১৮-এর trait object, FnOnce closure; চ্যাপ্টার ৬-এর Option/match; চ্যাপ্টার
          ২০-এর Drop trait — সবকিছু একসাথে এসে পড়েছে। বইয়ের শুরু থেকে যা যা শিখেছ, তার সবকিছু
          নিয়ে এই server। এবার নিজে কিছু বানানো শুরু করো!
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            Graceful shutdown — চলমান কাজ শেষ করে exit; abrupt termination-এর বিপরীত।
          </li>
          <li>
            <InlineCode>Drop</InlineCode> trait দিয়ে cleanup logic; <InlineCode>Vec::drain</InlineCode>{" "}
            দিয়ে &mut থেকে ownership move।
          </li>
          <li>
            Channel close করার trick — <InlineCode>sender</InlineCode> drop করলে{" "}
            <InlineCode>recv</InlineCode> Err দেয়।
          </li>
          <li>
            <InlineCode>Option&lt;T&gt;</InlineCode> + <InlineCode>take()</InlineCode> — partial
            ownership transfer pattern।
          </li>
          <li>
            <InlineCode>JoinHandle::join</InlineCode> ownership-নির্ভর — তাই{" "}
            <InlineCode>Option&lt;JoinHandle&gt;</InlineCode>।
          </li>
          <li>
            Worker-এ <InlineCode>recv</InlineCode>-এর result-এ match — Ok-এ kaj, Err-এ exit।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২১.৩: Graceful Shutdown এবং Cleanup · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "ThreadPool-এ Drop trait, Option::take দিয়ে sender close, channel-এর Err-এ worker break — graceful shutdown pattern।",
    },
  ],
};
