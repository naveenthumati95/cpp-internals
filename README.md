# C++ Internals

> Deep Dive into C++ Under the Hood

A collaborative, open-source course exploring the internal workings of C++. From OOP fundamentals to lock-free concurrency, we break down what happens beneath the surface of modern C++.

## 🌐 Live Website

Visit: [https://naveenthumati95.github.io/cpp-internals](https://naveenthumati95.github.io/cpp-internals)

## 📚 Topics

### Foundations
1. Object-Oriented Programming in C++
2. Type Deduction — Templates, auto & decltype
3. Pointers, Functors & Lambdas
4. const, static, volatile & Their Uses in Classes

### Modern C++
5. Rvalue References, Move Semantics & Perfect Forwarding
6. Smart Pointers, RAII & Exception Safety
7. Best Modern C++ Practices

### Templates & Metaprogramming
8. CRTP, Type Casting, TMP, SFINAE & Variadic Templates

### STL & Internals
9. STL Containers & Internal Complexities (+ Custom Implementations)

### Concurrency
10. Concurrency Part 1 — Threads, Mutexes, Semaphores & Synchronization
11. Concurrency Part 2 — Atomics, Memory Model & Lock-Free Programming

### Performance
12. Performance & Low-Latency Patterns

## ✍️ How to Add Content

### Writing a Topic

1. Navigate to the `topics/` directory
2. Open the corresponding `.md` file (e.g., `01-oops.md`)
3. Write your content in **GitHub Flavored Markdown**
4. Commit and push to the `main` branch
5. GitHub Pages will automatically deploy the changes

### Markdown Tips

- Use `#` for main title, `##` for sections, `###` for subsections
- Use fenced code blocks with language tags for syntax highlighting:
  ```cpp
  int main() {
      return 0;
  }
  ```
- Use `> blockquote` for notes and tips
- Use `**bold**` and `*italic*` for emphasis
- Tables, task lists, and other GFM features are fully supported

### Adding a New Topic

To add a topic beyond the current 12:

1. Create a new `.md` file in `topics/` (e.g., `13-new-topic.md`)
2. Edit `js/main.js` and add the topic to the `TOPICS` array
3. Commit and push

## 👥 Contributors

- **Naveen Thumati** — Core Contributor & Maintainer
- **Aryan Chakravorty** — Core Contributor
- **Abhiraj Singh** — Core Contributor

## 🛠️ Tech Stack

- Pure HTML5, CSS3, and Vanilla JavaScript
- [marked.js](https://marked.js.org/) for Markdown rendering
- [highlight.js](https://highlightjs.org/) for code syntax highlighting
- Hosted on GitHub Pages

## 📄 License

MIT License
