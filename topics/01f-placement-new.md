### Placement `new` (For Quant,not for SDE )

Placement `new` allows us to construct an object at a specific, pre-allocated memory address. **It does not allocate memory.** The memory must be allocated beforehand by the programmer.

#### Normal `new` vs. Placement `new`

**Normal `new`**
```cpp
Student* s = new Student;
```
Does two things:
1. Allocates memory (usually on the heap)
2. Constructs the object

*Memory Ownership:*
- `new` → allocates memory + constructs object
- `delete` → destroys object + frees memory

**Placement `new`**
```cpp
new(address) Type;
```
Does only **one** thing:
1. Constructs the object at the given address

*Memory Ownership:*
1. You allocate the memory manually.
2. Placement `new` constructs the object in that space.
3. You manage the object's lifetime and destruction manually.

#### Syntax
```cpp
Type* ptr = new(memory_address) Type(arguments);
```

#### Example
```cpp
char buffer[sizeof(int)];
int* x = new(buffer) int(10);
```

**Memory Representation:**
```text
Stack

buffer
+-------------+
| int object  |
| value = 10  |
+-------------+
      ^
      |
 x points here
```
The `int` is created safely inside the pre-allocated `buffer`.

#### Why is Placement `new` Required?

**To avoid repeated heap allocations.**

Heap allocation is computationally expensive. Instead of repeatedly going through the cycle of `allocate → construct → destroy → allocate again`, we can optimize performance by:
1. Allocating a large block of memory once.
2. Constructing objects inside that memory space only when needed.

#### Important: Destructor Handling

For objects that have destructors, you must handle destruction manually:

```cpp
struct A {
    ~A() {
        cout << "destroyed";
    }
};

char buffer[sizeof(A)];
A* obj = new(buffer) A();
```

> [!WARNING]
> You **cannot** use `delete obj;` ❌
> This is because the memory was not allocated by standard `new`. Using `delete` here would lead to undefined behavior.

You must **call the destructor manually**:
```cpp
obj->~A();
```
Then, you can safely release or reuse the underlying memory separately.

Few examples :
```cpp
// STACK MEMORY
char buffer[8];
int* x = new (buffer) int;
short* y = new (x + 1) short[2];
// no need to deallocate x, y
// HEAP MEMORY
unsigned* buffer2 = new unsigned[2];
double* z = new (buffer2) double;
delete[] buffer2; // ok
// delete[] z; // ok, but bad practice
```
---
*Last updated: July 2026*
