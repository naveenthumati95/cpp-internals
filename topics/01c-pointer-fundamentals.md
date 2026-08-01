### Pointer Fundamentals

**Pointer (`T*`)**
A pointer is a variable referring to a location in memory.

**Pointer Dereferencing (`*ptr`)**
Pointer dereferencing means obtaining the value stored at the location referred to by the pointer.

**Address-of Operator (`&`)**
The address-of operator returns the memory address of a variable.

```cpp
int a = 3;
int* b = &a; // address-of operator
// 'b' is equal to the address of 'a'

a++;
std::cout << *b; // prints 4
```
> **Note:** Be careful not to confuse the address-of operator (`&`) with the reference syntax (`T& var = ...`).

#### `struct` Member Access
- The dot (`.`) operator is applied to local objects and references.
- The arrow (`->`) operator is used with a pointer to an object.

```cpp
struct A {
    int x;
};

A a;         // local object
a.x = 10;    // dot syntax

A* ptr = &a; // pointer
ptr->x = 20; // arrow syntax: same as (*ptr).x
```

#### Pointer Arithmetic

> [!IMPORTANT]
> **Pointer Arithmetic Rule:**  
> `address(ptr + i) = address(ptr) + (sizeof(T) * i)`  
> *(where `T` is the type of elements pointed to by `ptr`)*

**Subscript Operator (`[]`)**
The expression `ptr[i]` is mathematically identical to `*(ptr + i)`. 
> **Note:** Because it is just pointer addition under the hood, the subscript operator in C++ also accepts *negative* values!

```cpp
int array[4] = {1, 2, 3, 4};

std::cout << array[1];       // prints 2
std::cout << *(array + 1);   // prints 2

std::cout << array;          // prints memory address (e.g., 0xFFFAFFF2)
std::cout << array + 1;      // prints address + sizeof(int) (e.g., 0xFFFAFFF6)

int* ptr = array + 2;
std::cout << ptr[-1];        // prints 2 (equivalent to *(ptr - 1))
```

### Quick Question

**Q-4: What is the output of the following program?**

```cpp
#include <iostream>
using namespace std;

int main() {
    char str[] = "ABCDEFGHIJKLMNOP";   // 16 characters

    // Cast the char pointer to an int pointer
    int* p = reinterpret_cast<int*>(str);

    // Increment the int pointer
    p += 2;

    // Cast back to a char pointer
    char* q = reinterpret_cast<char*>(p);

    cout << *q << endl;

    return 0;
}
```

**Answer:**
The output is **`I`**.

Initially, `p` points to the address of `'A'`. Since `p` is an `int*`, it points to objects of type `int` (which is typically 4 bytes). Applying the pointer arithmetic rule:  
`address(ptr + i) = address(ptr) + (sizeof(T) * i)`

So, `p += 2` moves the pointer by `2 * sizeof(int)` = **8 bytes**, not 2 bytes.  
Counting 8 characters forward from `'A'` (where `'A'` is index 0), the 8th index is the character `'I'`.

#### Memory Leaks and Dangling Pointers

**Memory Leak**
A memory leak occurs when dynamically allocated memory is not deallocated after use, leading to increased memory consumption, reduced performance, and potentially application crashes due to exhaustion of available memory.

```cpp
int main() {
    int* array = new int[10];
    array = nullptr; // memory leak!!
} // the memory can no longer be deallocated!!
```

**Dangling Pointer**
A dangling pointer points to a deallocated memory region. Accessing it is extremely dangerous.

```cpp
int* array = new int[10];

delete[] array; // OK -> "array" is now a dangling pointer

*array = 5;     // POTENTIAL SEGMENTATION FAULT!
delete[] array; // DOUBLE FREE CORRUPTION!
```
> **Note:** What happens if we call `delete` two times on an array? As shown above, this results in **Double Free Corruption**, crashing your program.

