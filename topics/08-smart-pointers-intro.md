# Smart Pointers, RAII & Exception Handling

> 🚧 **Note:** This topic is currently being written by Naveen Thumati.

Memory leaks, dangling pointers, and double-free errors have haunted C++ developers for decades. Modern C++ solves these problems entirely by abandoning raw `new` and `delete` in favor of **RAII** and **Smart Pointers**. 

In this section, we will dive deep into the internals of resource management. Use the sidebar to navigate through the subtopics:

1. **RAII**
2. **std::unique_ptr**
3. **std::shared_ptr**
4. **std::weak_ptr**
5. **std::make_unique & std::make_shared**
6. **Exceptions and handling**

---
*Last updated: July 2026*
