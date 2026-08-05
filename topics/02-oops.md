# Object-Oriented Programming in C++

## Prerequisites

- Basic C++ knowledge

## Topics Covered

- Structure memory layout and alignment

## Structure and its Size

A C/C++ structure (`struct`) is a collection of variables of the same or different data types grouped under a single name. For example:

```cpp
struct A { // struct definition
    int x;   // data member
    void f(); // function member
};
```

### How to get `sizeof(struct)`?

To understand how the size of a `struct` is calculated, we must first understand the **concept of alignment** and why it is needed.

#### Concept of Alignment

**Alignment** means storing data in memory at addresses that are suitable for the CPU. Different data types often require memory addresses that are multiples of their size. 

For example:
- `char` → 1-byte alignment
- `short` → 2-byte alignment
- `int` → 4-byte alignment
- `double` → 8-byte alignment (on many systems)

Alignment is done to enable faster memory access. The CPU reads memory in chunks called **memory words** (e.g., 4 bytes on a 32-bit CPU, 8 bytes on a 64-bit CPU). Suppose an `int` (4 bytes) starts at address `100`, which is divisible by 4.

```text
Address: 100 101 102 103
         +---+---+---+---+
         |   int value   |
         +---+---+---+---+
```
The CPU can fetch the entire integer in **one memory access**.

#### What if it is not aligned?

Suppose the same `int` starts at address `101`.

```text
Address: 100 101 102 103 104
         +---+---+---+---+---+
         |   |     int     | |
         +---+---+---+---+---+
```
Now the integer spans across two memory words. The CPU may need to:
1. Read the first word.
2. Read the second word.
3. Combine both values.

This takes more CPU cycles, making the program slower.

#### Padding

To meet alignment requirements, the compiler may insert **padding bytes** between structure members.

For example:
```cpp
struct Example {
    char c;   // 1 byte
    int i;    // 4 bytes
};
```

**Memory Layout:**
```text
Address:
+--------+--------+--------+--------+--------+--------+--------+--------+
| char c | padding| padding| padding|   int i (4 bytes)                 |
+--------+--------+--------+--------+--------+--------+--------+--------+
```
**Total size = 8 bytes**

Although `char` is 1 byte and `int` is 4 bytes (total = 5 bytes), the compiler adds **3 padding bytes**, making the structure size 8 bytes.

> [!NOTE]
> A `struct` or `class` object will have an alignment equal to the **largest alignment** among its data members. The total size of the `struct` or `class` will be a multiple of this alignment.

**Example:**
```cpp
struct A {
    double a; // 8 bytes
    int b;    // 4 bytes
};
```
Here, `sizeof(struct A) == 16`. It takes 8 bytes for `a`, 4 bytes for `b`, and **4 padding bytes** to make the total size (16) a multiple of the largest alignment (which is 8 from `double`).

### Quick Questions

**What is `sizeof(t)` for an empty struct or class?**
```cpp
class Test {
};

Test t;
```

<details>
<summary>Solution</summary>

**Answer: At least 1.**

If the size were `0`, situations would arise where two distinct objects of class `Test` would have the **exact same memory address**, which is illegal as per the C++ standard. Every object must have a unique address.

**Example:**
```cpp
int main() {
    Test t1, t2;
    // If size was 0, the addresses of t1 and t2 would not be unique!
    return 0;
}
```
</details>


### Practice Question

**What is the size of the following structures?**
```cpp
struct StructA {
    char c;
    double d;
    int i; 
};

struct StructB {
    double d;
    int i;
    char c;
};
```

<details>
<summary>Solution</summary>

**Do it yourself!** (Hint: calculate the size and padding for each struct based on the alignment rules).
</details>


## Class

A `class` in C++ is a user-defined data type that encapsulates data members and member functions into a single unit.

### Class vs Struct in C++

| Feature | `struct` | `class` |
| :--- | :--- | :--- |
| **Default Member Access** | `public` | `private` |
| **Default Inheritance** | `public` | `private` |

## Access Specifiers (The Basics)

Access specifiers define the visibility of class members. The keywords `public`, `private`, and `protected` specify the sections of visibility.

- **`public`**: No restriction (accessible by function members, derived classes, and outside the class).
- **`protected`**: Accessible by function members and derived classes.
- **`private`**: Accessible only by internal function members (strictly hidden).

### Inheritance Visibility Propagation

Access specifiers are also used to define how visibility is propagated from a base class to a specific derived class during inheritance:

| Base Class Member | Inheritance Type | Derived Class Member |
| :--- | :---: | :--- |
| `public`<br>`protected`<br>`private` | **`public`** | `public`<br>`protected`<br>*(can't access in derived class)* |
| `public`<br>`protected`<br>`private` | **`protected`** | `protected`<br>`protected`<br>*(can't access in derived class)* |
| `public`<br>`protected`<br>`private` | **`private`** | `private`<br>`private`<br>*(can't access in derived class)* |


### Examples of Inheritance Visibility

#### Example 1: Protected Inheritance
```cpp
struct A {
    int var1; // public
protected:
    int var2; // protected
};

struct B : protected A {
    int var3; // public
};

int main() {
    B b;
    // b.var1; // compile error: var1 is protected in B
    // b.var2; // compile error: var2 is protected in B
    b.var3;    // ok: var3 is public in B
    return 0;
}
```

#### Example 2: Public vs Private Inheritance
```cpp
class A {
public:
    int var1;
protected:
    int var2;
};

class B1 : A {};        // private inheritance (by default for classes)
class B2 : public A {}; // public inheritance

int main() {
    B1 b1;
    // b1.var1; // compile error: var1 became private in B1
    // b1.var2; // compile error: var2 became private in B1

    B2 b2;
    b2.var1;    // ok: var1 remains public in B2
    // b2.var2; // compile error: var2 remains protected in B2
    
    return 0;
}
```

#### Example 3: Function Visibility
```cpp
struct A1 {
    int value;   // public (by default for structs)
protected:
    void f1() {} // protected
private:
    void f2() {} // private
};

class A2 {
    int data;    // private (by default for classes)
};

struct B : A1 {
    void h1() { f1(); } // ok: "f1" is visible to derived class B
    // void h2() { f2(); } // compile error: "f2" is strictly private in A1
};

int main() {
    A1 a;
    a.value;    // ok
    // a.f1();  // compile error: protected (inaccessible outside class)
    // a.f2();  // compile error: private (inaccessible outside class)
    
    return 0;
}
```
> [!IMPORTANT]
> **Access Control is Compile-Time Checked.** Access specifiers are purely compiler directives used for code safety. They do not generate any machine code or runtime metadata. Once the code compiles, the concept of `private` ceases to exist. To the CPU, the object is just raw memory bytes, and functions are just executable memory addresses.
>
> *(Note: If you do not know about `virtual` functions yet, skip this next question, but be sure to come back after you learn about `virtual`!)*

### Practice Question

**Will the code below compile? What will be the output?**
```cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void f() { cout << "Base::f()" << endl; }
};

class Derived : public Base {
private:
    void f() { cout << "Derived::f()" << endl; }
};

int main() {
    Base* p = new Derived();
    p->f();
    return 0;
}
```

<details>
<summary>Solution</summary>

**Yes. The output is `Derived::f()`.**

Even though `Derived::f()` is `private`, access control is only checked during **compile time**. Since `p` is a pointer of type `Base`, and `Base` has a `public` function `f`, the compiler allows the code to compile. 

Since function `f()` is a `virtual` function, **dynamic dispatch** during runtime is used to find the actual function `f()` that will be called (which is the one in `Derived`), completely ignoring the access specifiers at runtime!
</details>

Q: In C++, if a data member of a class/struct is declared private, how can we access it? Explain all possible ways.
1. Using Public Getter and Setter Functions (Recommended)
Concept:
A private variable can be accessed through public member functions. This gives controlled access and maintains encapsulation.
```cpp
#include <iostream>
using namespace std;

class Student {
private:
    int age = 20;

public:
    int getAge() {
        return age;
    }

    void setAge(int a) {
        age = a;
    }
};

int main() {
    Student s;

    cout << s.getAge() << endl;  // Access private variable

    s.setAge(25);                // Modify private variable

    cout << s.getAge() << endl;
}
```
2. Using Friend Class or Friend Function
Concept:

A friend class or friend function can access private members of another class.

```cpp
#include <iostream>
using namespace std;

class Student;

class FriendClass {
public:
    void printAge(Student& s);
};

class Student {
private:
    int age = 25;
    friend class FriendClass;
};

void FriendClass::printAge(Student& s) {
    cout << s.age << endl;  // Accessing private member
}

int main() {
    Student s;
    FriendClass f;
    f.printAge(s);  // Output: 25
}
```

3. Bypassing private with Pointers (Not Recommended / Interview Knowledge)
In C++, access modifiers like private, protected, and public are strictly compile-time constraints. They prevent you from writing s.age directly in your code. However, they do not offer any runtime memory protection.
```cpp
#include <iostream>
using namespace std;

class Student {
private:
    int age;

public:
    Student() {
        age = 20;
    }
};


int main() {

    Student s;

    int* ptr = (int*)&s;

    cout << *ptr << endl;

}
```
output is 20.
Here is how the pointer cast exploits this:

&s gets the memory address of the object s.

(int*)&s uses a C-style cast to tell the compiler, "Treat the memory at this address as if it were a simple integer pointer."

Since the very first thing in the object's memory is the age variable, ptr now points directly to age.

While this works perfectly for this specific snippet, it is considered a "hack" and generally bad practice in production C++ as it depend on proper memory layout of struct, if the class had multiple variables of different types (e.g., a char followed by an int), compiler padding could shift the memory addresses, making it difficult to guess exactly where your target variable lives.

---
*Last updated: July 2026*
