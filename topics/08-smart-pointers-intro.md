# Introduction

> 🚧 **Note:** This topic is currently being written by Naveen Thumati.

### The problems

```cpp
auto ptr = new Obj();   // Memory allocated on the heap

// ... hundreds of lines of code ...

// Oops! Forgot to write:
// delete ptr;

return 0;
```

The above program finishes successfully, but the memory allocated for Obj is never released.

> #### What is a memory leak?
> 
> A **memory leak** occurs when memory is allocated on the heap but is **never freed**, even though the program no longer needs it.



Unfortunately, forgetting to call `delete` is not the only way memory leaks occur. Even if you remember to write `delete`, an exception or an early return can bypass the cleanup code entirely:

```cpp
auto ptr = new Obj();

foo();          // May throw an exception

delete ptr;     // Never executed if foo() throws
```

As programs grow larger, manually ensuring that every resource is released along every possible execution path quickly becomes difficult and error-prone.

First let's understand why memory leaks are **dangerous**:

- **Increased Memory Usage**
  - Memory that is no longer needed remains allocated, causing the memory consumption to grow continuously.
- **Memory Exhaustion**
  - Eventually, we may run out of available memory, causing `new` to fail (`std::bad_alloc`) or return a null pointer with `std::nothrow`.
- **Performance Degradation**
  - As memory usage increases, the program may experience slower allocations, poorer cache performance, etc.

However, memory leaks are only one consequence of manual resource management. Incorrect use of raw pointers can also result in:

- **Dangling pointers:** Pointers that still hold a memory address after the memory has been freed.
- **Double deletion:** Attempting to `delete` the same memory address twice, which corrupts the heap and crashes the program.
- **Use-after-free bugs:** Accessing memory after it has been deleted, leading to unpredictable undefined behavior.
- **Exception-unsafe code:** Failing to release resources when an exception disrupts the normal control flow.

These bugs are often subtle, difficult to reproduce, and can lead to undefined behavior.

### The Modern C++ Solution

Modern C++ addresses these problems through **RAII (Resource Acquisition Is Initialization)** and the concept of **Ownership**.

The core idea of RAII is simple:

> A resource should be owned by an object whose constructor acquires the resource and whose destructor releases it automatically.  

Because destructors are invoked automatically whenever an object leaves scope—including during exception unwinding—resources are cleaned up reliably without requiring explicit `delete` statements.

Although this chapter focuses primarily on dynamically allocated memory, RAII is a general resource management technique and is equally applicable to files, mutexes, sockets, database connections, threads, and many other resources.

Building upon RAII, the C++ Standard Library provides **smart pointers**. These don't just clean up memory; they strictly enforce *who owns the memory* (exclusive ownership vs. shared ownership) directly in the type system.

**The Modern Way:**
```cpp
#include <memory>

// No 'new', no 'delete', 100% safe
auto ptr = std::make_unique<Obj>(); 

foo(); // If foo() throws an exception, ptr is automatically cleaned up!
```

In this section, we will dive deep into the internals of resource management. Use the sidebar to navigate through the subtopics:

1. [**RAII**](#/topic/raii)
2. [**std::unique_ptr**](#/topic/unique-ptr)
3. [**std::shared_ptr**](#/topic/shared-ptr)
4. [**std::weak_ptr**](#/topic/weak-ptr)
5. [**std::make_unique & std::make_shared**](#/topic/make-unique-shared)
6. [**Exceptions and handling**](#/topic/exceptions-handling)

---

*Last updated: July 2026*
