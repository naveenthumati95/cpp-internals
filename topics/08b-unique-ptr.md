# `std::unique_ptr` & Exclusive Ownership

Before C++11, developers relied heavily on raw pointers for dynamic memory management. However, raw pointers are notoriously hard to love.

### Why a raw pointer is hard to love:

1. Its declaration doesn’t indicate whether it points to a **single object** or to an **array**.
2. Its declaration reveals nothing about whether you should destroy what it points to when you’re done using it, i.e., **if the pointer owns the thing it points to**.
3. If you determine that you should destroy what the pointer points to, there’s no way to tell how. Should you use `delete`, or is there a different destruction mechanism (e.g., a dedicated destruction function the pointer should be passed to)?
4. If you manage to find out that `delete` is the way to go, Reason 1 means it may not be possible to know whether to use the single-object form (`delete`) or the array form (`delete []`). If you use the wrong form, results are undefined.
5. Assuming you ascertain that the pointer owns what it points to and you discover how to destroy it, it’s difficult to ensure that you perform the destruction exactly **once** along every path in your code (including those due to exceptions). Missing a path leads to **resource leaks**, and doing the destruction more than once leads to **undefined behavior**.
6. There’s typically no way to tell if the pointer **dangles**, i.e., points to memory that no longer holds the object the pointer is supposed to point to. Dangling pointers arise when objects are destroyed while pointers still point to them.

**Smart pointers** are one way to address these issues. Smart pointers are wrappers around raw pointers that act much like the raw pointers they wrap, but that avoid many of their pitfalls. You should therefore prefer smart pointers to raw pointers. Smart pointers can do virtually everything raw pointers can, but with far fewer opportunities for error.

There are four smart pointers in C++11:
- `std::auto_ptr` (deprecated leftover from C++98)
- `std::unique_ptr`
- `std::shared_ptr`
- `std::weak_ptr`

> **Warning:**
> `std::auto_ptr` co-opted its copy operations for moves. This led to surprising code (copying a `std::auto_ptr` sets it to null!) and frustrating usage restrictions (e.g., it’s not possible to store `std::auto_ptr`s in containers).
> 
> `std::unique_ptr` does everything `std::auto_ptr` does, plus more. So, it's better than `std::auto_ptr` in every way. You should replace `std::auto_ptr` with `std::unique_ptr` and never look back.

---

### Use `std::unique_ptr` for Exclusive-Ownership Resource Management

It’s reasonable to assume that, by default, `std::unique_ptr`s are the **same size as raw pointers**, and for most operations (including dereferencing), they execute exactly the same instructions. This means you can use them even in situations where memory and cycles are tight. If a raw pointer is small enough and fast enough for you, a `std::unique_ptr` almost certainly is, too.

`std::unique_ptr` embodies **exclusive ownership semantics**. A non-null `std::unique_ptr` always owns what it points to. Moving a `std::unique_ptr` transfers ownership from the source pointer to the destination pointer. (The source pointer is set to null.) 

**Copying a `std::unique_ptr` isn’t allowed**, because if you could copy a `std::unique_ptr`, you’d end up with two `std::unique_ptr`s to the same resource, each thinking it owned (and should therefore destroy) that resource. `std::unique_ptr` is thus a **move-only type**. Upon destruction, a non-null `std::unique_ptr` destroys its resource. By default, resource destruction is accomplished by applying `delete` to the raw pointer inside the `std::unique_ptr`.

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

---

### Factory Functions & Object Hierarchies

A common use for `std::unique_ptr` is a factory function return type for objects in a hierarchy. Consider the following hierarchy for types of investments with a base class `Investment`:

```cpp
class Investment { ... };
class Stock : public Investment { ... };
class Bond : public Investment { ... };
class RealEstate : public Investment { ... };
```

A factory function for such a hierarchy typically allocates an object on the heap and returns a pointer to it, with the caller being responsible for deleting the object when it's no longer needed. That's a perfect match for `std::unique_ptr`.

A factory function for the `Investment` hierarchy could be declared like this:

```cpp
template<typename... Ts>
std::unique_ptr<Investment>
makeInvestment(Ts&&... params); 
// returns std::unique_ptr to an object created from the given args
```

Callers can use this function as follows:

```cpp
{
    ...
    auto pInvestment = makeInvestment(args);
    ...
} // destroy *pInvestment automatically at the end of scope
```

`std::unique_ptr` is also useful for **ownership transfer**. Ownership can be moved between objects (e.g., from a factory to a container, then to an object’s data member). Regardless of how ownership changes, the resource is automatically released when the final owning `std::unique_ptr` is destroyed. Even if exceptions or early returns interrupt the control flow, RAII guarantees that the resource is cleaned up safely.

---

### Custom Deleters

One interesting thing about `std::unique_ptr` is that during construction, they can accept **custom deleters**: arbitrary functions (or function objects, including lambdas etc.) to be invoked when it's time for their resources to be destroyed.

If the object created by `makeInvestment` shouldn’t be directly `deleted`, but instead should first have a log entry written, `makeInvestment` could be implemented as follows:

```cpp
auto delInvmt = [](Investment* pInvestment)     // custom deleter
                {
                      makeLogEntry(pInvestment);
                      delete pInvestment;  
                };

template<typename... Ts>
std::unique_ptr<Investment, decltype(delInvmt)>
makeInvestment(Ts&&... params)
{
    std::unique_ptr<Investment, decltype(delInvmt)> pInv(nullptr, delInvmt);
    if ( /* a Stock object should be created */ )
    {
        pInv.reset(new Stock(std::forward<Ts>(params)...));
    }
    else if ( /* a Bond object should be created */ )
    {
        pInv.reset(new Bond(std::forward<Ts>(params)...));
    }
    else if ( /* a RealEstate object should be created */ )
    {
        pInv.reset(new RealEstate(std::forward<Ts>(params)...));
    }
    return pInv;
}
```

The implementation is pretty nice, too, once you understand the following:

- `delInvmt` is a custom deleter for the object returned by `makeInvestment`. A custom deleter receives the raw pointer to the object, performs any required cleanup (such as logging), and then destroys the object using `delete`. Here, a lambda is used because it’s both concise and, as we’ll see later, more efficient than a regular function.
- When a custom deleter is to be used, its type must be specified as the second type argument to `std::unique_ptr`. In this case, that’s the type of `delInvmt`, and that’s why the return type of `makeInvestment` is `std::unique_ptr<Investment, decltype(delInvmt)>`.
- The basic strategy of `makeInvestment` is to create a null `std::unique_ptr`, make it point to an object of the appropriate type, and then return it. To associate the custom deleter `delInvmt` with `pInv`, we pass it as the second constructor argument.
- Attempting to assign a raw pointer (e.g., from `new`) to a `std::unique_ptr` won’t compile, because it would constitute an implicit conversion from a raw to a smart pointer. Such implicit conversions can be problematic, so C++11’s smart pointers prohibit them. That’s why `reset` is used to have `pInv` assume ownership of the object created via `new`.
- The custom deleter takes an `Investment*` parameter. Regardless of whether `makeInvestment` creates a `Stock`, `Bond`, or `RealEstate`, the object is ultimately deleted through an `Investment*`. Since this deletes a derived object via a base-class pointer, `Investment` must have a **virtual destructor**.

```cpp
class Investment{
public:
    ...
    virtual ~Investment();     // Necessary if we are opting for custom deleter
    ...
};
```

> **Tip: The Size of Custom Deleters:**
> With the default deleter (`delete`), a `std::unique_ptr` is typically the same size as a raw pointer. However, custom deleters can increase its size. A **function-pointer** deleter usually doubles the size (from one word to two), while a function-object deleter’s size depends on its stored state. 
> 
> **Captureless lambdas are stateless, so they add no size overhead**, making them preferable to function pointers when possible!

```cpp
auto delInvmt1 = [](Investment* pInvestment)       // stateless lambda deleter
{                                                  
    makeLogEntry(pInvestment);                     
    delete pInvestment;                            
};                                                 

template<typename... Ts>                           // return type
std::unique_ptr<Investment, decltype(delInvmt1)>   // has size of
makeInvestment(Ts&&... args);                      // Investment*


void delInvmt2(Investment* pInvestment)            // function pointer deleter
{                                                  
    makeLogEntry(pInvestment);                     
    delete pInvestment;
}

template<typename... Ts>                           // return type has
std::unique_ptr<Investment,                        // size of Investment*
                void (*)(Investment*)>             // plus at least size
makeInvestment(Ts&&... params);                    // of function pointer!
```

Function-object deleters that store a lot of state can make `std::unique_ptr` objects significantly larger. If a custom deleter causes your `std::unique_ptr`s to become unacceptably large, it’s usually a sign that the design should be reconsidered.

---

### Array vs Single-Object Form

`std::unique_ptr` has two forms: one for single objects (`std::unique_ptr<T>`) and one for arrays (`std::unique_ptr<T[]>`). This eliminates any ambiguity about what it owns, and each form provides only the operations that make sense. The single-object version supports `operator*` and `operator->` but not `operator[]`, while the array version provides `operator[]` but not dereferencing operators.

> **Note:**
> In practice, the array form is rarely needed because `std::vector`, `std::array`, and `std::string` are almost always better choices than raw arrays. A `std::unique_ptr<T[]>` is mainly useful when working with a C-style API that returns a raw pointer to a heap-allocated array whose ownership you need to take.

---

### Upgrading to Shared Ownership

`std::unique_ptr` represents **exclusive ownership**, but it can be **efficiently converted** to a `std::shared_ptr`:

```cpp
std::shared_ptr<Investment> sp = makeInvestment(arguments);
// converts std::unique_ptr to std::shared_ptr
```

This makes `std::unique_ptr` an excellent return type for factory functions. A factory cannot know whether the caller wants exclusive ownership or shared ownership. By returning a `std::unique_ptr`, it provides the most efficient smart pointer by default, while still allowing the caller to convert it to a `std::shared_ptr` if shared ownership is needed. (Note: You *cannot* downgrade a `shared_ptr` to a `unique_ptr`).

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

## Challenge 2: The Pimpl Idiom

One of the most powerful architectural patterns in C++ is the **Pimpl (Pointer to Implementation) Idiom**. It is used to achieve ABI stability and dramatically speed up compilation times by completely hiding private class members from the header file.

> **The Prompt:**
> You are building a high-performance library and want to expose a `Widget` class. `Widget` relies on complex internal state (`std::vector<int>`, custom cache objects, etc.). 
> 
> Using `std::unique_ptr`, implement `Widget.h` and `Widget.cpp` such that **no internal state details leak into the header**, allowing client code to `#include "Widget.h"` without pulling in any heavy dependencies.
> 
> *Hint: Refer to Advanced Question 2 regarding incomplete types!*

<details>
<summary>View the Solution</summary>

**Widget.h (The Header File)**
```cpp
#pragma once
#include <memory>

class Widget {
public:
    Widget();
    ~Widget(); // CRUCIAL: Must be declared here, but NOT defined inline!

    // Prevent copying because the default copy constructor 
    // would try to copy the unique_ptr (which fails).
    Widget(const Widget&) = delete;
    Widget& operator=(const Widget&) = delete;

    // Allow moving
    Widget(Widget&&) noexcept;
    Widget& operator=(Widget&&) noexcept;

    void doWork();

private:
    struct Impl; // Forward declaration (Incomplete Type)
    std::unique_ptr<Impl> pImpl;
};
```

**Widget.cpp (The Source File)**
```cpp
#include "Widget.h"
#include <vector>
#include <string>
#include <iostream>

// Full definition of Impl is hidden away in the .cpp file!
struct Widget::Impl {
    std::vector<int> heavyData;
    std::string internalState;
};

Widget::Widget() : pImpl(std::make_unique<Impl>()) {}

// CRUCIAL: Define the destructor HERE, where Impl is a complete type.
// The default deleter inside unique_ptr can now safely compute sizeof(Impl).
Widget::~Widget() = default; 

Widget::Widget(Widget&&) noexcept = default;
Widget& operator=(Widget&&) noexcept = default;

void Widget::doWork() {
    pImpl->heavyData.push_back(42);
    std::cout << "Working with hidden data!\n";
}
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
> **Warning:** Always use `std::make_unique` instead of raw `new`.

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

---
*Last updated: August 2026*
