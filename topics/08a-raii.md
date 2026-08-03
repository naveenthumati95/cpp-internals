**RAII** stands for **Resource Acquisition is Initialization**. This means: **"Acquire the resource during object initialization (construction), and release it automatically when the object is destroyed"**. It is an **idiom** (a commonly accepted programming technique) used to solve a recurring problem in C++.

> Resource lifetime is tied directly to object lifetime.

Here, the word **Resource** refers to anything that must be acquired and later released, such as:

- Heap memory (`new`/`delete`)
- Files (`fopen`/`fclose`)
- Mutexes (`lock`/`unlock`)
- Network Sockets
- Threads

> RAII is not only applicable to memory—it is the foundation of all resource management in C++.

#### Example

Without **RAII**:

```cpp
FILE* file = fopen("data.txt", "r");

// ... use file ...

fclose(file); // Easy to forget!
```

If an exception occurs before `fclose`, or if a developer adds an early `return` statement, the file handle leaks.

With **RAII**:

```cpp
#include <stdexcept>

class File {
public:
    File(const char* name) {
        fp = fopen(name, "r"); // Acquire
        if (!fp) {
            throw std::runtime_error("Failed to open file");
        }
    }

    ~File() {
        if (fp) {
            fclose(fp); // Release
        }
    }
private:
    FILE* fp;

    // WARNING: This class is still unsafe if copied! (See Rule of Five below)
};

void foo() {
    File file("data.txt");
    // Use the file...
} // Destructor automatically closes the file. No need to worry!
```

No matter how `foo()` exits—whether via a normal return, an exception, or an early return—the destructor is guaranteed to run and the file is safely closed.

The **RAII** idiom consists of three core steps:

- **Encapsulate** a resource into a class (acquire in constructor).
- **Use** the resource via a local, stack-allocated instance of the class.
- **Release** the resource automatically when the object goes out of scope (destructor).

> **What is Garbage Collection (GC)?**
> Garbage collection is a technique used in languages like Java or C# where the runtime periodically pauses execution to automatically find and free memory that is no longer being used.

Unlike Java, C++ doesn't have (or need) a garbage collector. 

**Implications of RAII:**

- Deterministic destruction eliminates the need for non-deterministic garbage collection.
- Developers have exact, predictable control over when resources are released (crucial for performance and hardware constraints).
- The programmer's responsibility shifts from *managing resources manually* to *designing robust RAII classes*.

---

### Rule of Five in RAII

When you write an RAII class, encapsulating the resource in the constructor and destructor is only half the battle. You must also strictly control how the resource behaves when the object is copied or moved. 

By default, the compiler generates shallow copies. For resources like heap memory or file descriptors, a shallow copy means two objects now claim ownership of the *exact same resource*, leading directly to a **double-free** or **use-after-free** bug when their destructors run!

To fix this, you must explicitly define the **Rule of Five**:

1. Destructor
2. Copy Constructor
3. Copy Assignment Operator
4. Move Constructor
5. Move Assignment Operator

### Challenge: Implement a File Descriptor Wrapper

To truly understand RAII, let's write a wrapper class for a low-level UNIX file descriptor. 

> **Your Task:**
> Create a class called `FileDescriptor` that wraps a raw `int fd`. 
> 
> **Requirements:**
> 
> 1. The constructor should accept the `fd`.
> 2. The destructor should automatically call `close_fd(fd)` (assume this function exists).
> 3. **Copying** a file descriptor doesn't make sense (you shouldn't have two objects closing the same `fd`). Prevent copying entirely.
> 4. **Moving** is perfectly valid (transferring ownership of the `fd` to a new object). Implement the move constructor and move assignment operator. Leave the old object in a safe state (e.g., `-1`).

Try writing this out yourself before checking the answer below!

<details>
<summary><strong>View the C++ Solution</strong></summary>

```cpp
#include <utility>

// Assume this system function exists
void close_fd(int fd);

class FileDescriptor {
private:
    int m_fd;

public:
    // 1. Constructor acquires the resource
    explicit FileDescriptor(int fd) : m_fd(fd) {}

    // 2. Destructor releases the resource
    ~FileDescriptor() {
        if (m_fd != -1) {
            close_fd(m_fd);
        }
    }

    // 3. Delete Copy Constructor
    FileDescriptor(const FileDescriptor&) = delete;

    // 4. Delete Copy Assignment Operator
    FileDescriptor& operator=(const FileDescriptor&) = delete;

    // 5. Move Constructor
    FileDescriptor(FileDescriptor&& other) noexcept : m_fd(other.m_fd) {
        other.m_fd = -1; // Strip ownership from the source
    }

    // 6. Move Assignment Operator
    FileDescriptor& operator=(FileDescriptor&& other) noexcept {
        if (this != &other) { // Protect against self-assignment
            // Clean up our current resource before taking the new one
            if (m_fd != -1) {
                close_fd(m_fd);
            }
            // Transfer ownership
            m_fd = other.m_fd;
            other.m_fd = -1;
        }
        return *this;
    }

    // Helper to use the resource
    int get() const { return m_fd; }
};
```

</details>

### Common Examples of RAII

As mentioned, RAII extends far beyond simple memory allocation. The C++ Standard Library utilizes RAII extensively:

- **Threading (`std::lock_guard` / `std::unique_lock`):** Acquires a mutex upon creation and automatically releases the lock when it goes out of scope, guaranteeing you never leave a mutex locked during an exception.
- **File I/O (`std::fstream`):** Opens a file handle in the constructor and automatically closes it in the destructor.
- **Memory (`std::vector` / `std::string`):** Manages internal dynamic heap arrays, automatically reallocating when necessary and freeing the memory upon destruction.

### Advanced Pitfalls in RAII

Even with RAII, there are a few dangerous traps that can catch experienced C++ developers off guard.

#### 1. The "Unnamed Temporary" Bug

When using an RAII wrapper like a mutex lock, you must give the object a variable name. If you don't, the compiler creates a *temporary* object that is destroyed at the end of the exact same statement!

```cpp
std::mutex m;

void bad_function() {
    // BUG: Creates a temporary lock that is instantly destroyed!
    std::lock_guard<std::mutex>(m); 

    // This code is completely unprotected!
    shared_data++; 
}

void good_function() {
    // CORRECT: The 'lock' variable lives until the end of the scope
    std::lock_guard<std::mutex> lock(m); 

    shared_data++;
}
```

*Tip: Modern C++ libraries often use the `[[nodiscard]]` attribute on RAII types to force a compiler warning if you forget to assign or name the variable.*

#### 2. The "Multiple Resources" Trap

What happens if your class attempts to acquire *two* raw resources manually in its constructor?

```cpp
class TwoFiles {
    FILE* f1;
    FILE* f2;
public:
    TwoFiles(const char* name1, const char* name2) {
        f1 = fopen(name1, "r"); // Resource 1 acquired
        f2 = fopen(name2, "r"); // What if this fails and throws an exception?
    }
    ~TwoFiles() {
        if (f1) fclose(f1);
        if (f2) fclose(f2);
    }
};
```

If the second `fopen` fails and an exception is thrown, **the constructor never finishes**. In C++, if a constructor does not complete, the destructor is **never called** for that object. This means `f1` will leak forever!

**The Fix:**
A single class should only ever be responsible for managing exactly *one* raw resource. If you need two files, you should use two distinct RAII wrapper objects (or Smart Pointers) as member variables. If an exception occurs during construction, C++ guarantees that the destructors for all *fully-constructed* member variables will run automatically, preventing the leak.

### Enter Smart Pointers

Writing custom RAII wrappers (like the `FileDescriptor` challenge above) for every single resource gets tedious. For the most common resource of all—**dynamically allocated memory on the heap**—C++ provides ready-to-use RAII templates known as **Smart Pointers**.

Instead of writing your own wrapper around raw pointers, you simply use:

1. `std::unique_ptr`: For exclusive, non-copyable ownership (just like our FileDescriptor!).
2. `std::shared_ptr`: For shared ownership with internal reference counting.
3. `std::weak_ptr`: A companion to `shared_ptr` to observe memory without affecting the reference count.

We will explore exactly how these smart pointers are implemented under the hood in the upcoming chapters.
