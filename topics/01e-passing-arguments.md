### Passing Arguments: Value vs. Reference vs. Pointer

#### Pass by Value
- A new copy of the data is created in the function's memory.
- The original variable and the function parameter have entirely different memory locations.
- Changes affect only the copy, not the original data.
- For large objects, this can be expensive because copying takes both time and memory.

#### Pass by Reference
- No new object is created.
- The function parameter becomes an alias of the original object.
- Both refer to the exact same memory location.
- Changes directly modify the original object.
- This is highly efficient for large objects because no copy is made.

> [!TIP]
> **Practice:** Analyze the following examples to reinforce the difference between passing pointers and references.

```cpp
void f(int* value) {} // 'value' is a pointer, can be nullptr
void g(int& value) {} // 'value' is a reference, must always point to a valid object

int a = 3;

f(&a);      // OK: passing the address of 'a'
f(nullptr); // OK: passing null to a pointer
// f(a);    // COMPILE ERROR: 'a' is an int, not a pointer

g(a);       // OK: passing 'a' by reference
// g(3);    // COMPILE ERROR: cannot bind non-const reference to an rvalue literal
// g(&a);   // COMPILE ERROR: '&a' is a pointer, not a reference
```

```cpp
#include <iostream>
using namespace std;

void modifyPointer(int* p) {
    p = nullptr; // This only modifies the local copy of the pointer, NOT the original
}

void modifyReference(int& r) {
    r = 100;     // This directly modifies the original variable
}

int main() {
    int x = 10;
    int* ptr = &x;

    modifyPointer(ptr);
    cout << *ptr << endl; // Prints 10 (ptr is NOT nullptr!)

    modifyReference(x);
    cout << x << endl;    // Prints 100
    
    return 0;
}
```

