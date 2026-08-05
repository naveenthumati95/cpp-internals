# Rule of Five — Constructors, Destructors, Copy & Move Semantics

## Prerequisites
- Basic C++ knowledge
- OOP fundamentals (classes, inheritance)

## Topics Covered
- Constructors (Default, Copy, Move)
- Destructor
- Initializer Lists & Initialization Order
- Uniform Initialization (C++11)
- Copy Semantics
- Move Semantics & `std::move`
- Rule of Three vs Rule of Five

---

## Class Constructor

### Constructor [ctor]

A constructor is a special member function of a class that is executed when a new instance of that class is created.

**Goals:** Initialization and resource acquisition.

**Syntax:** `T(...)` — same name as the class and no return type.

**Important points:**
- A constructor is supposed to initialize all data members.
- We can define multiple constructors with different signatures (constructor overloading).
- Any constructor can be `constexpr`.

---

## Default Constructor

The default constructor `T()` is a constructor with no arguments.

Every class has always either an **implicit**, **explicit**, or **deleted** default constructor.

```cpp
struct A {
    A() {}    // explicit default constructor
    A(int) {} // user-defined (non-default) constructor
};
```

```cpp
struct A {
    int x = 3; // implicit default constructor
};

A a{}; // call the default constructor, equivalent to: A a;
```

> **Note:** An implicit default constructor is `constexpr`.

### Default Constructor Examples

```cpp
struct A {
    A() { cout << "A"; } // default constructor
};

A a1;       // call the default constructor
// A a2();  // interpreted as a function declaration!!
A a3{};     // ok, call the default constructor
            // direct-list initialization (C++11)

A array[3];          // print "AAA"
A* ptr = new A[4];   // print "AAAA"
```

### Deleted Default Constructor 1/2

The implicit default constructor of a class is marked as **deleted** if (simplified):

**1. It has any user-defined constructor:**
```cpp
struct A {
    A(int x) {}
};
// A a; // compile error
```

**2. It has a non-static member/base class of reference/const type:**
```cpp
struct NoDefault { // deleted default constructor
    int& x;
    const int y;
};
```

### Deleted Default Constructor 2/2

**3. It has a non-static member/base class which has a deleted (or inaccessible) default constructor:**
```cpp
struct A {
    NoDefault var; // deleted default constructor
};

struct B : NoDefault {}; // deleted default constructor
```

**4. It has a non-static member/base class with a deleted or inaccessible destructor:**
```cpp
struct A {
private:
    ~A() {}
};
```

---

## Initializer List

The Initializer list is used for initializing the data members of a class or explicitly calling the base class constructor **before entering the constructor body**.

(Not to be confused with `std::initializer_list`)

```cpp
struct A {
    int x, y;

    A(int x1) : x(x1) {}           // ": x(x1)" is the Initializer list
                                     // direct initialization syntax

    A(int x1, int y1) :             // ": x{x1}, y{y1}"
        x{x1},                      // is the Initializer list
        y{y1} {}                     // direct-list initialization syntax
};                                   // (C++11)
```

---

## In-Class Member Initializer

C++11 In-class non-static data members initialization (NSDMI) allows initializing the data members where they are declared. A user-defined constructor can be used to override their default values.

```cpp
struct A {
    int x = 0;                   // in-class member initializer
    const char* str = nullptr;   // in-class member initializer

    A() {}                       // "x" and "str" are well-defined if
                                 // the default constructor is called

    A(const char* str1) : str{str1} {}
};
```

---

## `const` and Reference Member Initialization

`const` and reference data members **must** be initialized by using the initialization list or by using in-class brace-or-equal-initializer syntax (C++11).

```cpp
struct A {
    int x;
    const char y;       // must be initialized
    int& z;             // must be initialized
    int& v = x;         // equal-initializer (C++11)
    const int w{4};     // brace initializer (C++11)

    A() : x(3), y('a'), z(x) {}
};
```

---

## Initialization Order

Class member initialization follows the **order of declarations** and **NOT** the order in the initialization list.

```cpp
struct ArrayWrapper {
    int* array;
    int size;

    ArrayWrapper(int user_size) :
        size{user_size},
        array{new int[size]} {}
        // wrong!!: "size" is still undefined
};

ArrayWrapper a(10);
cout << a.array[4]; // segmentation fault
```

**Why does this crash?**
`array` is declared before `size` in the class. So `array` is initialized first, but at that point `size` has not been initialized yet. `new int[size]` uses a garbage value, leading to undefined behavior.

---

## Uniform Initialization (C++11)

Uniform Initialization `{}`, also called list-initialization, is a way to fully initialize any object independently of its data type.

**Advantages:**
- Minimizing Redundant Typenames (in function arguments and returns)
- Solving the "Most Vexing Parse" problem (constructor interpreted as function prototype)

### Minimizing Redundant Typenames

```cpp
struct Point {
    int x, y;
    Point(int x1, int y1) : x(x1), y(y1) {}
};

// C++03
Point add(Point a, Point b) {
    return Point(a.x + b.x, a.y + b.y);
}
Point c = add(Point(1, 2), Point(3, 4));

// C++11
Point add(Point a, Point b) {
    return { a.x + b.x, a.y + b.y }; // here
}
auto c = add({1, 2}, {3, 4}); // here
```

### "Most Vexing Parse" Problem

```cpp
struct A {
    A(int) {}
};

struct B {
    // A a(1); // compile error — It works in a function scope
    A a{2};    // ok, call the constructor
};
```

```cpp
struct A {};

struct B {
    B(A a) {}
    void f() {}
};

B b( A() );  // "b" is interpreted as function declaration
             // with a single argument A (*)() (function pointer)
// b.f()     // compile error — "Most Vexing Parse" problem
             // solved with B b{ A{} };
```

---

## Copy Constructor

A copy constructor `T(const T&)` creates a new object as a **deep copy** of an existing object.

```cpp
struct A {
    A() {}             // default constructor
    A(int) {}          // non-default constructor
    A(const A&) {}     // copy constructor → direct initialization
};
```

### Copy Constructor Details

- Every class always defines an **implicit** or **explicit** copy constructor, potentially deleted.
- The copy constructor implicitly calls the **default Base class constructor**.
- Even the copy constructor is considered a user-defined constructor.
- The copy constructor doesn't have template parameters, otherwise it is a standard member function.
- The copy constructor must **not** be confused with the assignment `operator=`.

```cpp
MyStruct x;
MyStruct y{x};  // copy constructor
y = x;          // call the assignment operator=, not the copy constructor
                // → copy initialization, see next lecture
```

### Copy Constructor Example

```cpp
struct Array {
    int size;
    int* array;

    Array(int size1) : size{size1} {
        array = new int[size];
    }

    // copy constructor, ": size{obj.size}" initializer list
    Array(const Array& obj) : size{obj.size} {
        array = new int[size];
        for (int i = 0; i < size; i++)
            array[i] = obj.array[i];
    }
};

Array x{100};   // do something with x.array ...
Array y{x};     // call "Array::Array(const Array&)"
```

### Copy Constructor Usage

The copy constructor is used to:

**1. Initialize one object from another one having the same type:**
```cpp
A a1;
A a2(a1);     // Direct copy initialization
A a3{a1};     // Direct copy initialization
A a4 = a1;    // Copy initialization
A a5 = {a1};  // Copy list initialization
```

**2. Copy an object which is passed by-value as input parameter of a function:**
```cpp
void f(A a);
```

**3. Copy an object which is returned as result from a function:**
```cpp
A f() { return A(3); } // *** without RVO optimization
                        // (see 'Advanced Concepts I' lecture)
```

### Copy Constructor Usage Examples

```cpp
struct A {
    A() {}
    A(const A& obj) { cout << "copy"; }
};

void f(A a) {}   // pass by-value
A g1(A& a) { return a; }
A g2() { return A(); }

A a;
A b = a;     // copy constructor (assignment) "copy"
A c(b);      // copy constructor (direct) "copy"
f(b);        // copy constructor (argument) "copy"
g1(a);       // copy constructor (return value) "copy"
A d = g2();  // * see RVO optimization (Advanced Concepts I)
```

### Pass by-value and Copy Constructor

```cpp
struct A {
    A() {}
    A(const A& obj) { cout << "expensive copy"; }
};

struct B : A {
    B() {}
    B(const B& obj) { cout << "cheap copy"; }
};

void f1(B b) {}
void f2(A a) {}

B b1;
f1(b1);   // cheap copy
f2(b1);   // expensive copy!! It calls A(const A&) implicitly
```

### Deleted Copy Constructor

The implicit copy constructor of a class is marked as **deleted** if:

**1. The class has the move constructor:**
```cpp
struct A {
    A(A&&) {};  // 'A' implicit copy constructor is deleted
};
```

**2. The class has a deleted copy assignment operator:**
```cpp
struct A {
    A& operator=(const A&) = delete;  // 'A' implicit copy constructor is deleted
};
```

**3. It has a non-static member/base class with a deleted (or inaccessible) copy constructor:**
```cpp
#include <memory>  // std::unique_ptr

struct A {
    A(const A&) = delete;  // explicitly deleted
};

struct B {
    std::unique_ptr<int> ptr;  // unique_ptr is non-copyable
};  // 'B' implicit copy constructor is deleted

class C {
    C(const C&) {}  // copy constructor is private
};

struct D1 : A {};  // 'D1' implicit copy constructor is deleted
struct D2 : C {};  // 'D2' implicit copy constructor is deleted

struct E {
    A a;
};  // 'E' implicit copy constructor is deleted
```

**4. It has a non-static member/base class with a deleted (or inaccessible) destructor:**
```cpp
struct A {
    ~A() = delete;  // explicitly deleted
};

class B {
    ~B() {}  // destructor is private
};

struct C1 : A {};  // 'C1' implicit copy constructor is deleted
struct C2 : B {};  // 'C2' implicit copy constructor is deleted

struct D {
    A a;
};  // 'D' implicit copy constructor is deleted
```

---

## Class Destructor

### Destructor [dtor]

A destructor is a special member function that is executed whenever an object is **out-of-scope** or whenever the `delete`/`delete[]` expression is applied to a pointer of that class.

**Goals:** Resources releasing.

**Syntax:** `~T()` — same name of the class and no return type.

- Any object has exactly **one** destructor, which is always implicitly or explicitly declared.
- C++20: The destructor can be `constexpr`.

### Destructor Example

```cpp
struct Array {
    int* array;

    Array() {           // constructor
        array = new int[10];
    }

    ~Array() {          // destructor
        delete[] array;
    }
};

int main() {
    Array a;                          // call the constructor
    for (int i = 0; i < 5; i++)
        Array b;                      // call 5 times the constructor + destructor
}  // call the destructor of "a"
```

---

## Move Semantics

Move semantics refers to **transferring ownership of resources** from one object to another.

Copy semantics **duplicates** the resource, move semantics **does not**.

### The Problem (Before C++11)

```cpp
#include <algorithm>

class Array {  // Array Wrapper
public:
    Array() = default;

    Array(int size) : _size{size}, _array{new int[size]} {}

    Array(const Array& obj) : _size{obj._size}, _array{new int[obj._size]} {
        // EXPENSIVE COPY (deep copy)
        std::copy(obj._array, obj._array + _size, _array);
    }

    ~Array() { delete[] _array; }

private:
    int _size;
    int* _array;
};
```

```cpp
#include <vector>

int main() {
    std::vector<Array> vector;
    vector.push_back( Array{1000} );  // call push_back(const Array&)
}  // expensive copy
```

**Before C++11:** `Array{1000}` is created, passed by const-reference, copied (expensive deep copy), and then destroyed.

> **Note:** `Array{1000}` is no more used outside `push_back`.

**After C++11:** `Array{1000}` is created, and **moved** to vector (fast!).

### Class Prototype with Move Semantic Support

```cpp
class X {
public:
    X();                            // default constructor
    X(const X& obj);                // copy constructor
    X(X&& obj);                     // move constructor
    X& operator=(const X& obj);     // copy assign operator
    X& operator=(X&& obj);          // move assign operator
    ~X();                           // destructor
};
```

### Move Constructor

```cpp
Array(Array&& obj) {
    _size = obj._size;        // (1) shallow copy
    _array = obj._array;      // (1) shallow copy
    obj._size = 0;            // (2) release obj (no more valid)
    obj._array = nullptr;     // (2) release obj
}
```

### Move Assignment Operator

```cpp
Array& operator=(Array&& obj) {
    delete[] _array;            // (1) release this
    _size = obj._size;          // (2) shallow copy
    _array = obj._array;        // (2) shallow copy
    obj._array = nullptr;       // (3) release obj
    obj._size = 0;              // (3) release obj
    return *this;               // (4) return *this
}
```

---

## `std::move`

C++11 provides the method `std::move` (`<utility>`) to indicate that an object may be "moved from".

It allows efficient transfer of resources from one object to another.

```cpp
#include <vector>

int main() {
    std::vector<Array> vector;
    vector.push_back( Array{1000} );         // call "push_back(Array&&)"

    Array arr{1000};
    vector.push_back( arr );                 // call "push_back(const Array&)"
    vector.push_back( std::move(arr) );      // call "push_back(Array&&)"
                                              // efficient!!
    // "arr" is not more valid here
}
```

---

## Move Semantic Notes

If an object requires the copy constructor/assignment, then it should also define the move constructor/assignment. The opposite could not be true.

The defaulted move constructor/assignment `=default` recursively applies the move semantic to its base class and data members.

**Important:** It does **not** release the resources. It is very dangerous for classes with manual resource management.

```cpp
// Suppose: Array(Array&&) = default;
Array x{10};
Array y = std::move(x);  // call the move constructor

// "x" calls ~Array() when it is out of scope, but now the internal pointer
// "_array" is NOT nullptr -> double free or corruption!!
```

### Move Semantic and Code Reuse

Some operations can be expressed as a function of the move semantic:

```cpp
A& operator=(const A& other) {
    *this = A{other};  // copy constructor + move assignment
    return *this;
}

void init(... /* any parameters */ ) {
    *this = A{...};    // user-declared constructor + move assignment
}
```

---

## Rule of Five

### Motivation

If a class manages resources (dynamic memory, file handles, network connections, etc.), the compiler-generated defaults for copying and moving are **wrong**. They perform **shallow copies**, which lead to:
- **Double free** — two objects try to delete the same memory.
- **Memory leaks** — resources are never released.
- **Dangling pointers** — one object uses memory already freed by another.

### Definition

If you define **any one** of the following five special member functions, you should define (or explicitly delete) **all five**:

1. **Destructor** — `~T()`
2. **Copy Constructor** — `T(const T&)`
3. **Copy Assignment Operator** — `T& operator=(const T&)`
4. **Move Constructor** — `T(T&&)`
5. **Move Assignment Operator** — `T& operator=(T&&)`

### Rule of Three vs Rule of Five

- **Rule of Three (pre-C++11):** If you define a destructor, copy constructor, or copy assignment operator, define all three.
- **Rule of Five (C++11):** The Rule of Three extended with move constructor and move assignment operator. Move operations were added because C++11 introduced rvalue references, enabling efficient transfer of resources instead of expensive deep copies.

### Complete Implementation Example

```cpp
#include <algorithm>
#include <iostream>

class Array {
public:
    // 1. Default Constructor
    Array() : _size{0}, _array{nullptr} {}

    // User-defined Constructor
    Array(int size) : _size{size}, _array{new int[size]{}} {}

    // 2. Destructor
    ~Array() {
        delete[] _array;
    }

    // 3. Copy Constructor (deep copy)
    Array(const Array& obj) : _size{obj._size}, _array{new int[obj._size]} {
        std::copy(obj._array, obj._array + _size, _array);
    }

    // 4. Copy Assignment Operator (deep copy)
    Array& operator=(const Array& obj) {
        if (this != &obj) {                    // self-assignment check
            delete[] _array;                   // release old resource
            _size = obj._size;                 // copy size
            _array = new int[_size];           // allocate new resource
            std::copy(obj._array, obj._array + _size, _array);  // deep copy
        }
        return *this;
    }

    // 5. Move Constructor (ownership transfer)
    Array(Array&& obj) noexcept
        : _size{obj._size}, _array{obj._array} {
        obj._size = 0;           // release source
        obj._array = nullptr;    // release source
    }

    // 6. Move Assignment Operator (ownership transfer)
    Array& operator=(Array&& obj) noexcept {
        if (this != &obj) {
            delete[] _array;         // release old resource
            _size = obj._size;       // shallow copy
            _array = obj._array;     // shallow copy
            obj._size = 0;           // release source
            obj._array = nullptr;    // release source
        }
        return *this;
    }

private:
    int _size;
    int* _array;
};
```

### Why All Five Are Needed

| If you only define... | What goes wrong |
|---|---|
| Destructor only | Compiler-generated copy does shallow copy → double free |
| Copy constructor only | Assignment still shallow copies → double free |
| Copy only (no move) | Temporaries are copied instead of moved → performance loss |
| Move only (no copy) | Cannot copy objects when needed → compile errors |
| `=default` move with raw pointers | Source object not nullified → double free or corruption |

---

## Important Interview Notes

### Difference Between Constructor and Assignment Operator
```cpp
A a1;
A a2(a1);   // copy CONSTRUCTOR — creates a new object
a2 = a1;    // copy ASSIGNMENT OPERATOR — modifies existing object
```

### Shallow Copy vs Deep Copy
- **Shallow copy:** Copies the pointer value (both objects point to the same memory).
- **Deep copy:** Allocates new memory and copies the actual data (each object owns its own memory).

### Why `std::move` Doesn't Actually Move
`std::move` is just a **cast** to an rvalue reference (`T&&`). It doesn't move anything by itself. It simply tells the compiler "I am done with this object, you may move from it." The actual move happens in the move constructor or move assignment operator.

### Moved-From Objects Are Still Valid
After `std::move`, the object is in a **valid but unspecified state**. You can:
- Assign a new value to it.
- Destroy it.
You should **not** use its value without reassigning first.

### Common Mistakes

| Mistake | Consequence |
|---|---|
| No virtual destructor in base class | Derived destructor not called → resource leak |
| Forgetting self-assignment check in `operator=` | Deleting own data before copying → crash |
| Using `=default` move with raw pointers | Double free or corruption |
| Not nullifying source in move constructor | Source destructor frees transferred resource |
| Wrong initialization order in initializer list | Using uninitialized members → segfault |

### RAII (Resource Acquisition Is Initialization)
The Rule of Five is the foundation of RAII — a C++ idiom where resource lifetime is tied to object lifetime. When the object is created, it acquires resources (constructor). When the object is destroyed, it releases resources (destructor). Copy and move operations ensure resources are properly managed during object transfers.

> **Best Practice:** Prefer smart pointers (`std::unique_ptr`, `std::shared_ptr`) over raw pointers. With smart pointers, the compiler-generated defaults are correct, and you can use the **Rule of Zero** — define none of the five special functions and let the compiler handle everything.

### Interview Questions

**Q1: Does the following code work?**
```cpp
class Test {
public:
    Test(const Test& obj) {}
};
Test t;
```
<details>
<summary>View Solution</summary>

**No. The code will not compile.** 
Because a user-defined copy constructor is provided, the compiler will **not** generate the implicit default constructor required for the `Test t;` statement.
</details>

<br>

**Q2: Why is the argument to the copy constructor a `const` reference?**
```cpp
class Test {
public:
    Test(const Test& t) {} 
};
```
<details>
<summary>View Solution</summary>

1. **`const`:** You don't want to accidentally modify the object from which the copy is being made.
2. **Reference (`&`):** The alternative (passing by value) would mean creating a copy of the argument to pass it into the function. But making a copy requires calling the copy constructor, which would require passing by value, which makes another copy... resulting in infinite recursion!
</details>

<br>

**Q3: How to ensure `Test` objects are only created on the heap (with `new`) and not on the stack?**
```cpp
Test t;                  // case 1 (stack)
Test* tp = new Test();   // case 2 (heap)
```
<details>
<summary>View Solution</summary>

**Make the destructor in class `Test` private.**
When an object is created on the stack (case 1), the compiler must guarantee that its destructor can be called when it goes out of scope. If the destructor is private, the compiler cannot call it, so case 1 won't compile. You will need to provide a custom public `destroy()` method that calls `delete this;` for heap objects.
</details>

<br>

**Q4: How to ensure `Test` objects cannot be created on the heap, but ONLY on the stack?**
```cpp
Test t;                                      // case 1 (stack)
Test* tp = new Test(); // or new Test[10];   // case 2 (heap)
```
<details>
<summary>View Solution</summary>

**Make the `new` and `new[]` operators private in class `Test`.**
Now the code in case 2 won't compile, because allocating dynamic memory for `Test` relies on the overloaded `operator new`, which is now inaccessible.
</details>

<br>

**Q5: How does the copy constructor interact with inheritance?**
<details>
<summary>View Solution</summary>

The derived class copy constructor must **explicitly** call the base class copy constructor in its initializer list. If it doesn't, the base class's **default** constructor is called instead.

**Common bug:** Forgetting to copy the base portion of an object during a copy operation.

**Correct implementation:**
```cpp
Derived(const Derived& other) : Base(other), member(other.member) {}
```
</details>

---

*Last updated: August 2026*
