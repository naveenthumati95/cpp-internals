### Heap Memory — `new` vs `malloc`

`new`/`new[]` and `delete`/`delete[]` are C++ keywords that perform dynamic memory allocation/deallocation and object construction/destruction at runtime.

`malloc` and `free` are C functions, and they only allocate and free memory blocks (expressed in bytes).

> [!TIP]
> - `free()`, `delete`, and `delete[]` applied to `NULL` / `nullptr` pointers **do not produce errors** (they safely do nothing).
> - **Mixing** `new`, `new[]`, and `malloc` with something different from their counterparts (e.g., allocating with `new[]` and deallocating with `free()`) leads to **undefined behavior**.

```cpp
// Allocate a single element
int* value = (int*) malloc(sizeof(int)); // C
int* value = new int;                    // C++

// Allocate N elements
int* array = (int*) malloc(N * sizeof(int)); // C
int* array = new int[N];                     // C++

// Allocate N structures
MyStruct* array = (MyStruct*) malloc(N * sizeof(MyStruct)); // C
MyStruct* array = new MyStruct[N];                          // C++

// Allocate and zero-initialize N elements
int* array = (int*) calloc(N, sizeof(int)); // C
int* array = new int[N]();                  // C++

// Deallocate a single element
int* value = (int*) malloc(sizeof(int)); // C
free(value);

int* value = new int; // C++
delete value;

// Deallocate N elements
int* value = (int*) malloc(N * sizeof(int)); // C
free(value);

int* value = new int[N]; // C++
delete[] value;
```

### What `new` does and its difference from `malloc()`

- **Return type:** `new` returns a pointer of the required type, while `malloc()` returns a `void*` (which must be cast in C++).
- **Failure:** `new` throws a `std::bad_alloc` exception on failure (unless `std::nothrow` is used), whereas `malloc()` returns `NULL` / `nullptr`.
- **Allocation size:** With `new`, the compiler automatically determines the required size of the object. With `malloc()`, the programmer must explicitly specify the number of bytes using `sizeof()`.
- **Initialization:** `new` allocates memory and calls the constructor, allowing the object to be initialized. `malloc()` only allocates raw memory and does not call constructors.
- **Destruction:** Memory allocated with `new` must be released using `delete`, which also calls the object's destructor. Memory allocated with `malloc()` must be released using `free()`, which does not call destructors.
- **Polymorphism:** Objects with virtual functions should be created using `new` (or by normal object construction), because constructors initialize the object's virtual table pointer (`vptr`). `malloc()` only allocates raw memory and does not call constructors, so the object is not properly constructed. Calling virtual functions on such an object results in undefined behavior.

> **Note:** Do not worry if you don't know much about Object-Oriented Programming (OOP) yet. You can come back to this point after covering the OOP chapter!

```cpp
#include <iostream>

class Base {
public:
    Base() {
        std::cout << "Constructor\n";
    }

    virtual void show() {
        std::cout << "Base\n";
    }

    ~Base() {
        std::cout << "Destructor\n";
    }
};

int main() {
    Base* p1 = new Base;   // Constructor is called
    p1->show();
    delete p1;             // Destructor is called

    Base* p2 = (Base*)malloc(sizeof(Base)); // Only raw memory allocated
    // p2->show();         // Undefined behavior!
    free(p2);              // No destructor is called
}
```

### Allocation Metadata & `delete`

The compiler knows the `sizeof(Student)`, so with the `new` statement, it allocates the required memory (e.g., 16 bytes) and then calls the constructor. `operator new()` usually calls the system's memory allocator. However, memory allocators don't simply return raw memory. Instead, they maintain some metadata. A hidden header is managed by the allocator, which contains the size of the allocation.

#### What happens when you call `delete`?
```cpp
delete p;
```
This performs two operations:

1. **Destructor is called:**
   `p->~Student();`

2. **Memory is deallocated:**
   The allocator’s metadata header (which stored the size of the allocation) is consulted. The memory manager reclaims the bytes and adds them back to the heap's free list. 

Similarly, for arrays:
```cpp
Student* p = new Student[3];
```
```text
+-------------------+-----------------------------+
| Count = 3         | Student | Student | Student |
+-------------------+-----------------------------+
                    ^
                    |
                    p
```

### Quick Question

**Q-2: What is the output of this program?**
```cpp
int *p = new int[10];
p++;
delete[] p;
```

**Answer:**
This code results in **undefined behavior**. 

`p++` increments `p` by 1. Since the pointer at address `p + 1` was not the original base address returned by `new[]`, passing it to `delete[]` causes undefined behavior during runtime. The memory allocator attempts to find the metadata header at `(p + 1) - header_offset`, reading garbage data and likely crashing the program.

### Quick Question

**Q-3: What is the difference between `delete` and `delete[]`? What happens if you use one where the other was expected?**

**Answer:**
- `delete` is used to deallocate a single object allocated with `new`.
- `delete[]` is used to deallocate an array of objects allocated with `new[]`.

If you use `delete` on an array, or `delete[]` on a single object, it results in **undefined behavior**. Usually, using `delete` on an array of objects only calls the destructor for the *first* element, leaking the rest (or outright crashing the program).

```cpp
class Student {
public:
    Student() { std::cout << "Constructor\n"; }
    ~Student() { std::cout << "Destructor\n"; }
};

int main() {
    // CORRECT usage:
    Student* s = new Student;
    delete s; // Calls destructor once

    Student* arr = new Student[3];
    delete[] arr; // Calls destructor 3 times

    // INCORRECT usage (Undefined Behavior!):
    Student* bad_arr = new Student[3];
    delete bad_arr; // BUG: Only calls destructor for the 1st student!

    return 0;
}
```
