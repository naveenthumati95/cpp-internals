# Smart Pointers, RAII & Exception Handling

> 🚧 **Note:** This topic is currently being written by Naveen Thumati.

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
