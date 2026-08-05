# `std::unique_ptr` & Exclusive Ownership

Before C++11, developers relied heavily on raw pointers for dynamic memory management. However, raw pointers are notoriously hard to love.

### Why Raw Pointers Are Hard to Love

1. **Ambiguity:** A declaration like `int* ptr` doesn't indicate whether it points to a single object or an array.
2. **Ownership:** The declaration reveals nothing about *who* owns the memory. Should you destroy what it points to when you're done?
3. **Destruction Mechanism:** If you determine you *should* destroy it, how? Do you use `delete`, `delete[]`, or a custom destruction function?
4. **Error-Prone Paths:** It's incredibly difficult to ensure you perform the destruction exactly *once* along every possible execution path (especially when exceptions are thrown). Missing a path leads to **memory leaks**, while double-freeing leads to **undefined behavior**.
5. **Dangling Pointers:** There's no built-in mechanism to tell if a pointer dangles (points to memory that has already been freed).

### Enter Smart Pointers

**Smart pointers** are wrappers around raw pointers that act much like raw pointers but fundamentally avoid these pitfalls by adhering to the principles of **RAII**. 

There are three primary smart pointers in modern C++:
- `std::unique_ptr`
- `std::shared_ptr`
- `std::weak_ptr`

> [!WARNING]
> You may occasionally see `std::auto_ptr` in legacy C++98 codebases. It co-opted copy operations for moves, leading to terrifying bugs (e.g., copying an `auto_ptr` sets the original to null). It was deprecated in C++11 and completely removed in C++17. **Always replace `std::auto_ptr` with `std::unique_ptr`.**

---

## Exclusive Ownership Semantics

`std::unique_ptr` embodies **exclusive ownership**. A non-null `std::unique_ptr` always uniquely owns what it points to. 

Because ownership is exclusive, **copying a `std::unique_ptr` is explicitly prohibited by the compiler**. If you could copy it, you'd end up with two pointers claiming ownership of the same resource, leading directly to a double-free bug.

Instead, `std::unique_ptr` is a **move-only** type. Moving a `std::unique_ptr` transfers ownership from the source pointer to the destination pointer, leaving the source pointer null.

Upon destruction, a non-null `std::unique_ptr` automatically destroys its resource (by default, calling `delete` on the wrapped raw pointer).

### Zero Overhead Guarantee
It is reasonable to assume that, by default, `std::unique_ptr`s are the **exact same size** as raw pointers. For most operations (including dereferencing via `*` or `->`), they execute the exact same assembly instructions. If a raw pointer is fast enough for your system, a `std::unique_ptr` is too.

---

### Test Your Knowledge: The Move-Only Rule

**Question:** What happens if you try to pass a `std::unique_ptr` by value to a function?

```cpp
void process(std::unique_ptr<int> ptr) {
    // ...
}

int main() {
    std::unique_ptr<int> p = std::make_unique<int>(42);
    process(p); // What happens here?
}
```

<details>
<summary>View Answer</summary>

**Answer: Compilation Error.**

Because `process` takes the argument by value, the compiler attempts to invoke the copy constructor of `std::unique_ptr`. Since copying is deleted, it fails to compile. 

To pass ownership to the function, you **must** explicitly move it:
```cpp
process(std::move(p)); // Compiles! Ownership is transferred to the function.
// 'p' is now nullptr.
```
</details>

**Question:** Can you store a `std::unique_ptr` inside a `std::vector`?

<details>
<summary>View Answer</summary>

**Answer: Yes, but you must be careful.**

You cannot `push_back` an existing `unique_ptr` directly because `push_back` tries to copy it. You must `std::move` it:

```cpp
std::vector<std::unique_ptr<int>> vec;
std::unique_ptr<int> p = std::make_unique<int>(42);

vec.push_back(p);             // ERROR: copy constructor is deleted
vec.push_back(std::move(p));  // SUCCESS: moves ownership into the vector
```

Alternatively, use `emplace_back` to construct it directly in place, or `push_back(std::make_unique<int>(42))`.
</details>

---

## Factory Functions & Custom Deleters

A common use case for `std::unique_ptr` is acting as the return type for factory functions in an object-oriented hierarchy. 

Consider an `Investment` base class:
```cpp
class Investment {
public:
    virtual ~Investment() = default; // Essential for polymorphic deletion!
};

class Stock : public Investment {};
class Bond : public Investment {};
```

A factory function allocates an object on the heap and returns a pointer to it. By returning a `std::unique_ptr`, the factory enforces that the caller assumes ownership and responsibility for cleanup.

```cpp
template<typename... Ts>
std::unique_ptr<Investment> makeInvestment(Ts&&... params);
```

### Custom Deleters

What if the object shouldn’t just be `deleted`, but requires a custom cleanup process (like writing to a log file or closing a network connection)? `std::unique_ptr` supports **custom deleters**.

```cpp
// 1. Define a custom deleter (Stateless Lambda)
auto delInvmt = [](Investment* pInvestment) {
    makeLogEntry(pInvestment);
    delete pInvestment;  
};

// 2. Specify the deleter type in the template signature
template<typename... Ts>
std::unique_ptr<Investment, decltype(delInvmt)>
makeInvestment(Ts&&... params) {
    
    // 3. Pass the deleter instance to the constructor
    std::unique_ptr<Investment, decltype(delInvmt)> pInv(nullptr, delInvmt);
    
    if ( /* Stock */ ) {
        pInv.reset(new Stock(std::forward<Ts>(params)...));
    }
    // ...
    return pInv;
}
```

> [!TIP]
> **The Size of Custom Deleters:**
> By default, `std::unique_ptr` is the size of a single raw pointer (e.g., 8 bytes on a 64-bit system). However, if you use a **function pointer** as a custom deleter, the size of the `unique_ptr` doubles (16 bytes) to store the function pointer. 
> 
> By using a **captureless lambda** (as seen above), the deleter is a stateless function object, adding **zero size overhead** to the `unique_ptr`!

---

## The Challenge: Implement Your Own `UniquePtr`

To truly understand how `std::unique_ptr` achieves exclusive ownership without overhead, you must build it yourself.

> **The Prompt:**
> Write a templated class `UniquePtr<T>`. 
> 1. It should wrap a raw pointer `T*`.
> 2. Implement the constructor and destructor (RAII).
> 3. Enforce exclusive ownership (disable copying).
> 4. Implement move semantics (Move constructor and Move assignment).
> 5. Implement `operator*` and `operator->`.
> 6. Implement `get()` (returns the raw pointer), `release()` (relinquishes ownership), and `reset()` (destroys current resource and takes ownership of a new one).

<details>
<summary>View the Solution</summary>

```cpp
#include <utility> // for std::exchange

template <typename T>
class UniquePtr {
private:
    T* m_ptr;

public:
    // 1. Constructor
    explicit UniquePtr(T* ptr = nullptr) : m_ptr(ptr) {}

    // 2. Destructor (RAII)
    ~UniquePtr() {
        delete m_ptr;
    }

    // 3. Disable Copying (Exclusive Ownership)
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    // 4. Move Constructor
    // std::exchange returns the old value of other.m_ptr, then sets other.m_ptr to nullptr.
    UniquePtr(UniquePtr&& other) noexcept 
        : m_ptr(std::exchange(other.m_ptr, nullptr)) {}

    // 5. Move Assignment
    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            delete m_ptr; // Free existing resource
            m_ptr = std::exchange(other.m_ptr, nullptr); // Steal new resource
        }
        return *this;
    }

    // 6. Dereferencing Operators
    T& operator*() const { return *m_ptr; }
    T* operator->() const { return m_ptr; }

    // 7. Core API
    T* get() const { return m_ptr; }

    T* release() {
        return std::exchange(m_ptr, nullptr); // Caller is now responsible for deletion
    }

    void reset(T* ptr = nullptr) {
        delete m_ptr;
        m_ptr = ptr;
    }
    
    // Bonus: Boolean conversion for easy null-checking
    explicit operator bool() const { return m_ptr != nullptr; }
};
```
</details>

---

## Dangerous Pitfalls

While `std::unique_ptr` protects against most memory leaks, it is not invincible. Here are the most dangerous traps advanced developers fall into.

### 1. The Double-Free from Raw Pointers
Never initialize two `std::unique_ptr`s with the exact same raw pointer.

```cpp
int* raw = new int(42);
std::unique_ptr<int> p1(raw);
std::unique_ptr<int> p2(raw); // FATAL BUG
```
Both `p1` and `p2` think they have exclusive ownership. When they go out of scope, they will both attempt to `delete` the same memory address, crashing your program. 
*(Solution: Always use `std::make_unique` instead of raw `new`).*

### 2. Dangling from `.get()`
The `.get()` method exists to interface with legacy C-APIs that require raw pointers. **Never store the result of `.get()`**.

```cpp
int* dangling_ptr = nullptr;
{
    auto p = std::make_unique<int>(100);
    dangling_ptr = p.get(); // Taking a raw look at the managed memory
} // 'p' goes out of scope and deletes the integer.

*dangling_ptr = 50; // UNDEFINED BEHAVIOR! Memory is already freed.
```

### 3. The `std::unique_ptr<T[]>` Trap
`std::unique_ptr` technically has an array form: `std::unique_ptr<int[]>`. This allows it to call `delete[]` instead of `delete`.

```cpp
// Works, but generally frowned upon:
std::unique_ptr<int[]> arr(new int[100]); 
arr[0] = 42;
```

> [!CAUTION]
> In modern C++, you almost **never** need the array form of `unique_ptr`. It lacks bounds checking, lacks iterators, and lacks resizing capabilities.
> 
> If you need a dynamically allocated array, use **`std::vector<T>`**. If you need a fixed-size heap allocation without the overhead of `vector` capacity tracking, use a `std::unique_ptr<std::array<T, N>>` or simply `std::vector` with `shrink_to_fit()`. The only valid use case for `std::unique_ptr<T[]>` is when interacting with a legacy C-API that returns a raw array via `malloc` or `new[]` that you are forced to manage.

### 4. Upgrading to Shared Ownership
While `std::unique_ptr` represents exclusive ownership, it can be seamlessly upgraded to shared ownership if necessary:

```cpp
std::shared_ptr<Investment> sp = makeInvestment(args);
```
Because of this, `std::unique_ptr` is the ultimate return type for factory functions. It is highly efficient by default but perfectly flexible if the caller demands shared semantics. (Note: You *cannot* downgrade a `shared_ptr` to a `unique_ptr`).

---
*Last updated: August 2026*
