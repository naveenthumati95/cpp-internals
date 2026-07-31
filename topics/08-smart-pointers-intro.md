# Smart Pointers, RAII & Exception Handling

> 🚧 **Note:** This topic is currently being written by Naveen Thumati.

### The problem in a nut shell

```cpp
auto ptr=new Obj(); // some memory is allocated on the heap

// Wrote some 1000 lines of code
// forgot to do delete(ptr)

return 0;
// oops! we forgot to free the heap memory pointed by ptr
// memory leak -> Dangerous
```

> #### What is a memory leak?
> 
> A **memory leak** occurs when memory is allocated on the heap but is **never freed**, even though the program no longer needs it.

First let's understand why memory leaks are **dangerous**:

* **Increased Memory Usage**
  
  * Memory that is no longer needed remains allocated, causing the memory consumption to grow continuosly.
- **Memory Exhaustion**
  - Eventually, we may run out of available memory, causing `new` to fail (`std::bad_alloc`) or return nullptr with (`std::no_throw`).
- **Performance Degradation**
  - As memory usage increases, the program may experience slower allocations, poorer cache performance etc.

Memory leaks, dangling pointers, and double-free errors have haunted C++ developers for decades. Modern C++ solves these problems entirely by abandoning raw `new` and `delete` in favor of **RAII** and **Smart Pointers**. 

In this section, we will dive deep into the internals of resource management. Use the sidebar to navigate through the subtopics:

1. [**RAII**](#/topic/raii)
2. [**std::unique_ptr**](#/topic/unique-ptr)
3. [**std::shared_ptr**](#/topic/shared-ptr)
4. [**std::weak_ptr**](#/topic/weak-ptr)
5. [**std::make_unique & std::make_shared**](#/topic/make-unique-shared)
6. [**Exceptions and handling**](#/topic/exceptions-handling)

---

*Last updated: July 2026*
