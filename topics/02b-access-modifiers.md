# Classes and Access Modifiers


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
### Interview Question

**Q: In C++, if a data member of a class/struct is declared private, how can we access it? Explain all possible ways.**

#### 1. Using Public Getter and Setter Functions (Recommended)
**Concept:** A `private` variable can be accessed through `public` member functions. This gives controlled access and maintains encapsulation.

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
    return 0;
}
```

#### 2. Using Friend Class or Friend Function
**Concept:** A `friend` class or `friend` function can access `private` members of another class.

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
    return 0;
}
```

#### 3. Bypassing `private` with Pointers (Interview Knowledge)

In C++, access modifiers like `private`, `protected`, and `public` are strictly compile-time constraints. They prevent you from writing `s.age` directly in your code. However, they do not offer any runtime memory protection!

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
    cout << *ptr << endl; // Output: 20
    return 0;
}
```

**Here is how the pointer cast exploits this:**
1. `&s` gets the memory address of the object `s`.
2. `(int*)&s` uses a C-style cast to tell the compiler, "Treat the memory at this address as if it were a simple integer pointer."
3. Since the very first thing in the object's memory is the `age` variable, `ptr` now points directly to `age`.

> [!WARNING]
> While this works perfectly for this specific snippet, it is considered a "hack" and generally bad practice in production C++. It depends entirely on the memory layout of the struct. If the class had multiple variables of different types (e.g., a `char` followed by an `int`), compiler padding could shift the memory addresses, making it difficult to guess exactly where your target variable lives!

---
*Last updated: July 2026*
