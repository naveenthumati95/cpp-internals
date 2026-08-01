### References (`T&`)

A reference is an alias (another name) for an existing variable. It does not create a new object or allocate new memory; instead, it refers to the exact same memory location as the original variable. Any change made through the reference directly affects the original variable.

> [!IMPORTANT]
> 1. A pointer has its own memory address and size on the stack. A reference structurally shares the same memory address as the original variable.
> 2. The compiler may internally implement references as pointers under the hood, but the language treats them completely differently.
> 3. References allow for better compiler optimizations because they must be initialized, cannot be null, and cannot be reseated. This lets the compiler eliminate the hidden pointer entirely and keep values in registers longer.

For example:
```cpp
int a = 10;
int& r = a;

r++;
```
Because of compiler optimization (the compiler strictly knows `r` always refers to `a`), it behaves perfectly as if you had written:
```cpp
a++;
```

#### References vs Pointers

- **Nullability:** References cannot have a `NULL` value. A reference is *always* connected to valid storage.
- **Reseating:** References cannot be changed. Once initialized, a reference cannot be "re-pointed" to refer to another object. Pointers, however, can point to different objects at any time.
- **Initialization:** References *must* be initialized when they are created. Pointers can be declared uninitialized and assigned later.

#### Examples
```cpp
// int& a;       // COMPILE ERROR: requires initialization
// int& b = 3;   // COMPILE ERROR: cannot bind non-const reference to rvalue literal

int c = 2;
int& d = c;      // OK: valid initialization
int& e = d;      // OK: reference to reference collapses into a reference to 'c'

++d;             // increments 'c' to 3
++e;             // increments 'c' to 4
std::cout << c;  // prints 4

int a = 3;
int* b = &a;     // pointer
int* c_ptr = &a; // pointer (renamed from c to avoid collision)

++b;             // changes the memory address the pointer 'b' holds
++(*c_ptr);      // changes the value of 'a' (a = 4)

int& ref = a;    // reference
++ref;           // changes the value of 'a' (a = 5)
```

### Quick Questions

**Q-5: What is the output of the following program (on a 64-bit system)?**
```cpp
#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int& r = x;
    int* p = &x;

    cout << sizeof(r) << " " << sizeof(p) << endl;
}
```
**Answer:** DIY (Do It Yourself)

---

**Q-6: What is the output of this program?**
```cpp
int& fun() {
    int x = 10;
    return x;   
}

int main() {
    int& r = fun();
    cout << r;
    return 0;
}
```
**Answer:** DIY (Do It Yourself)

---

**Q-7: What is the output of this program?**
```cpp
#include <iostream>
using namespace std;

int x = 10;   // global variable

int& fun() {
    return x;  // returning reference to global variable
}

int main() {
    fun() = 12;
    cout << fun();
    return 0;
}
```
**Answer:** DIY (Do It Yourself)

