**RAII** stands for **Resource Acquisition is Intitialization**. Which means "**Acquire the resource during object initialization (construction), and release it automatically when the object is destroyed**". It is an **Idiom** (**commonly accepted programming technique or pattern** used to solve a recurring problem in a language).

> Resource lifetime is object lifetime.

Here the word **Resource** can be anything that must be acquired and later released, such as:

- Heap memory (`new`/`delete`)

- Files (`fopen`/`fclose`)

- Mutexes (`lock`/`unlock`)

- Sockets

- Threads

> RAII is not only applicable for memory.

#### Example

Without **RAII**:

```cpp
FILE* file = fopen("cc.txt", "r");

// ... use file ...

flcose(file); // Easy to forget!
```

If an exception occurs before `fclose`, the file leaks.

With **RAII**:

```cpp
class File{
public:
    File(const char* name)
    {
        fp = fopen(name, "r"); // Acquire
    }
    
    ~File()
    {
        fclose(fp); // Release
    }
private:
    FILE* fp;
}


void foo()
{
    File file("data.txt");
    // Use the file.
} // Destructor automatically closes the file. No need to worry :)
```

No matter how `foo()` exits: normal return, exception, or early return, the destructor runs and the file is closed.

**RAII** idiom consists in three steps:

- Encapsulate a resource into a class (constructor).

- Use the resource via a local instance of the class.

- The resource is automatically released when object gets out of scope (destructor).

> What is Garbage collection (GC)?
> 
> Garbage collection (GC) is a technique where the runtime automatically finds and frees memory that is no longer being used by the program.

Unfortunately unlike Java, C++ doesn't have a garbage collector.

Implications of **RAII**:

- C++ programming language does not require the garbage collector!!

- The programmer has the responsibility to manage the resources.

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

### Enter Smart Pointers

Writing custom RAII wrappers (like the `FileDescriptor` challenge above) for every single resource gets tedious. For the most common resource of all—**dynamically allocated memory on the heap**—C++ provides ready-to-use RAII templates known as **Smart Pointers**.

Instead of writing your own wrapper around raw pointers, you simply use:
1. `std::unique_ptr`: For exclusive, non-copyable ownership (just like our FileDescriptor!).
2. `std::shared_ptr`: For shared ownership with internal reference counting.
3. `std::weak_ptr`: A companion to `shared_ptr` to observe memory without affecting the reference count.

We will explore exactly how these smart pointers are implemented under the hood in the upcoming chapters.
