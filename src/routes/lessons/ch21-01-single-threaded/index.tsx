import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CodeBlock, InlineCode } from "~/components/code-block/code-block";
import { LessonNav } from "~/components/lesson-nav/lesson-nav";

const slug = "ch21-01-single-threaded";

export default component$(() => {
  return (
    <article class="prose-bn">
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          পাঠ ২১.১
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">
          Single-Threaded Web Server বানানো
        </h1>
        <p class="mt-2 text-[var(--muted-foreground)]">
          Building a Single-Threaded Web Server
        </p>
        <p class="mt-3">
          এই chapter-এর final project — একটা ছোট web server, পুরোটা std-library দিয়ে। আজকের পাঠে
          single-threaded version বানাব: <InlineCode>TcpListener</InlineCode> দিয়ে port-এ listen,
          incoming HTTP request পড়া, response পাঠানো, এবং URL-এর ভিত্তিতে আলাদা page serve।
          পরের পাঠে এটাকে multi-threaded করব।
        </p>
      </header>

      <section class="space-y-4 leading-relaxed">
        <h2 class="text-2xl font-bold">প্রোটোকল — TCP আর HTTP</h2>
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <strong>TCP (Transmission Control Protocol)</strong> — lower-level; দু'টা machine-এর
            মাঝে byte-এর reliable stream পাঠানোর protocol।
          </li>
          <li>
            <strong>HTTP (Hypertext Transfer Protocol)</strong> — TCP-এর উপরে চলে; request আর
            response কেমন format-এ যাবে সেটা define করে।
          </li>
        </ul>
        <p>
          দু'টোই request-response — client request পাঠায়, server response দেয়।
        </p>

        <h2 class="mt-10 text-2xl font-bold">TCP connection-এ listen</h2>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        println!("Connection established!");
    }
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>TcpListener::bind("127.0.0.1:7878")</InlineCode> — localhost-এর port 7878-এ
            listen।
          </li>
          <li>
            Port 7878 কেন? টেলিফোন keypad-এ "rust" — দ্রবণ choice; HTTP-এর standard port না।
          </li>
          <li>
            <InlineCode>bind</InlineCode> Result return করে — port already in use হলে fail।
          </li>
          <li>
            <InlineCode>incoming()</InlineCode> — <InlineCode>TcpStream</InlineCode>-এর iterator
            দেয়। প্রতিটা stream একটা open connection।
          </li>
          <li>
            <em>Connection</em> মানে full request-response cycle; <em>stream</em> মানে সেই
            communication channel।
          </li>
        </ul>
        <p>
          Browser থেকে <InlineCode>127.0.0.1:7878</InlineCode> visit করলে terminal-এ
          "Connection established!" multiple বার দেখা যায় — কারণ browser favicon, retry ইত্যাদি
          কারণে কয়েকটা connection খোলে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Request পড়া</h2>
        <p>
          Stream থেকে বাইরে আসা byte পড়তে <InlineCode>BufReader</InlineCode> ব্যবহার করব — line-by-line
          read facilitate করে:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
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
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    println!("Request: {http_request:#?}");
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>lines()</InlineCode> — <InlineCode>Result&lt;String, io::Error&gt;</InlineCode>-এর
            iterator।
          </li>
          <li>
            HTTP request দু'টা newline (blank line) দিয়ে শেষ। তাই{" "}
            <InlineCode>take_while(|line| !line.is_empty())</InlineCode> দিয়ে blank line এলে থামি।
          </li>
          <li>
            <InlineCode>{`{:#?}`}</InlineCode> — pretty-print debug format।
          </li>
        </ul>

        <h3 class="mt-6 text-xl font-bold">HTTP request format</h3>
        <CodeBlock
          lang="text"
          code={`Method Request-URI HTTP-Version CRLF
headers CRLF
message-body`}
        />
        <p>একটা real request এমন দেখায়:</p>
        <CodeBlock
          lang="text"
          code={`GET / HTTP/1.1
Host: 127.0.0.1:7878
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
DNT: 1
Connection: keep-alive
Upgrade-Insecure-Requests: 1`}
        />

        <h2 class="mt-10 text-2xl font-bold">Response লেখা</h2>
        <p>HTTP response format:</p>
        <CodeBlock
          lang="text"
          code={`HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body`}
        />
        <p>
          সবচেয়ে minimal — শুধু status line, body নেই:
        </p>
        <CodeBlock
          lang="text"
          code={`HTTP/1.1 200 OK\\r\\n\\r\\n`}
        />
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let response = "HTTP/1.1 200 OK\\r\\n\\r\\n";

    stream.write_all(response.as_bytes()).unwrap();
}`}
        />
        <ul class="ml-6 list-disc space-y-1">
          <li>
            <InlineCode>200 OK</InlineCode> — সফল response-এর standard status code।
          </li>
          <li>
            <InlineCode>\r\n</InlineCode> — CRLF (carriage return + line feed); HTTP-এর line
            separator।
          </li>
          <li>
            <InlineCode>as_bytes()</InlineCode> — string-কে byte slice-এ; তারপর{" "}
            <InlineCode>write_all</InlineCode> connection-এ পাঠায়।
          </li>
        </ul>

        <h2 class="mt-10 text-2xl font-bold">আসল HTML পাঠানো</h2>
        <p>
          Project root-এ <InlineCode>hello.html</InlineCode> বানাও:
        </p>
        <CodeBlock
          lang="text"
          filename="hello.html"
          code={`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Hi from Rust</p>
  </body>
</html>`}
        />
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
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
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let status_line = "HTTP/1.1 200 OK";
    let contents = fs::read_to_string("hello.html").unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}`}
        />
        <p>
          <InlineCode>Content-Length</InlineCode> header — body-র byte size; browser এর সাহায্যে
          জানে কতটুকু read করতে হবে।
        </p>

        <h2 class="mt-10 text-2xl font-bold">Request validate করে selectively respond</h2>
        <p>
          এতক্ষণ যেকোনো request-এ একই page পাঠাচ্ছিল। এবার শুধু <InlineCode>GET /</InlineCode>-এ
          hello, বাকিতে অন্য কিছু:
        </p>
        <CodeBlock
          lang="rust"
          code={`fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        // some other request
    }
}`}
        />
        <p>
          <InlineCode>lines().next()</InlineCode> first line দেয় — দু'টা unwrap কারণ:{" "}
          <InlineCode>next()</InlineCode> <InlineCode>Option</InlineCode> দেয়, ভিতরে{" "}
          <InlineCode>Result</InlineCode>।
        </p>

        <h2 class="mt-10 text-2xl font-bold">404 page</h2>
        <CodeBlock
          lang="text"
          filename="404.html"
          code={`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Oops!</h1>
    <p>Sorry, I don't know what you're asking for.</p>
  </body>
</html>`}
        />
        <CodeBlock
          lang="rust"
          code={`fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        let status_line = "HTTP/1.1 404 NOT FOUND";
        let contents = fs::read_to_string("404.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    }
}`}
        />

        <h2 class="mt-10 text-2xl font-bold">Refactor — duplicate code কমানো</h2>
        <p>
          <InlineCode>if</InlineCode>/<InlineCode>else</InlineCode>-এর দু'টো branch প্রায় একই।
          Rust-এ <InlineCode>if</InlineCode> expression — তাই dual destructure দিয়ে cleanup:
        </p>
        <CodeBlock
          lang="rust"
          filename="src/main.rs"
          code={`use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
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

    let (status_line, filename) = if request_line == "GET / HTTP/1.1" {
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\\r\\nContent-Length: {length}\\r\\n\\r\\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}`}
        />
        <p>
          ৪০-এর মতো line code, single file — minimal HTTP server প্রস্তুত। Test:{" "}
          <InlineCode>cargo run</InlineCode> তারপর browser-এ <InlineCode>127.0.0.1:7878</InlineCode>{" "}
          (hello), <InlineCode>127.0.0.1:7878/anything</InlineCode> (404)। Ctrl-C দিয়ে stop, code
          changed করলে restart।
        </p>

        <h2 class="mt-10 text-2xl font-bold">এই পাঠ থেকে যা শিখলে</h2>
        <ul class="ml-6 list-disc space-y-2">
          <li>
            <InlineCode>TcpListener::bind</InlineCode> + <InlineCode>incoming()</InlineCode> দিয়ে
            connection accept।
          </li>
          <li>
            <InlineCode>BufReader</InlineCode> + <InlineCode>lines()</InlineCode> দিয়ে HTTP request
            পড়া; blank line-এ stop।
          </li>
          <li>
            HTTP response = status line + headers + blank line + body; CRLF (
            <InlineCode>\r\n</InlineCode>) separator।
          </li>
          <li>
            <InlineCode>Content-Length</InlineCode> header body size জানায়।
          </li>
          <li>
            Request line (যেমন <InlineCode>GET / HTTP/1.1</InlineCode>) match করে selectively
            respond; 404 fallback।
          </li>
          <li>
            Single-threaded — তাই একটা request slow হলে বাকিরা সব wait করে। পরের পাঠে এটাই solve
            করব।
          </li>
        </ul>
      </section>

      <LessonNav slug={slug} />
    </article>
  );
});

export const head: DocumentHead = {
  title: "পাঠ ২১.১: Single-Threaded Web Server বানানো · বাংলায় Rust",
  meta: [
    {
      name: "description",
      content:
        "Rust std-library দিয়ে minimal HTTP server — TcpListener, BufReader দিয়ে request পড়া, status line, Content-Length, এবং 404 page।",
    },
  ],
};
