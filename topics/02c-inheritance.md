# Inheritance

## 1. Introduction to Inheritance

New classes can be derived from existing classes using a mechanism called **inheritance**. Classes that are used for derivation are called **base classes** of a particular derived class.

### Syntax

```cpp
class DerivedSingleBase : [virtual] [access-specifier] Base
{
    // member list
};

class DerivedMultipleBases : [virtual] [access-specifier] Base1, [virtual] [access-specifier] Base2, ...
{
    // member list
};
```

### Why Inheritance?
It solves the following problems:
- **Redundancy:** Prevents declaring the same fields multiple times.
- **Maintenance:** Centralizes common logic so changes don't have to be made everywhere.

### What Derived Classes Can Do:
1. Inherit all members from the base class.
2. Add new data members and functions.
3. Override base class function behavior.

---

## 2. Constructors and Memory Layout

### Memory Layout
The Base class members are always placed at the **top** of the memory block, followed immediately by the Derived class members.

### Constructor Execution Order
The Base class constructor must **fully complete** before the Derived class constructor is allowed to start.

**Why?**
The Derived class might rely on inherited variables to set up its own state. If the Base class is not initialized first, the Derived class would read dangerous, uninitialized garbage memory.

**When `Derived obj;` is called in code:**
1. **Allocation:** The OS carves out the total required memory block (filled with garbage data).
2. **Base Initialization:** The `Base()` constructor runs, initializing the top section of the memory block.
3. **Derived Initialization:** The `Derived()` constructor runs, initializing the bottom section of the memory block.

### Destructor Execution Order
Destructors dismantle the object from bottom to top (or outside-in).
Destructors run in the **exact reverse order** of constructors. The Derived class destructor runs first, followed by the Base class destructor.

### Quick Question

**Tell output and size of `obj`:**
```cpp
#include <iostream>
using namespace std;

class Base {
public:
    int x;
    
    Base() {
        cout << "1. Base Constructor\\n";
    }
    
    ~Base() {
        cout << "4. Base Destructor\\n";
    }
};

class Derived : public Base {
public:
    double z;
    int y;
    
    Derived() {
        cout << "2. Derived Constructor\\n";
    }
    
    ~Derived() {
        cout << "3. Derived Destructor\\n";
    }
};

int main() {
    Derived obj; 
    return 0;
}
```

<details>
<summary>Solution</summary>

**Output:**
```text
1. Base Constructor
2. Derived Constructor
3. Derived Destructor
4. Base Destructor
```

**Size:** `24` bytes.
(4 bytes for `Base::x` + 4 bytes padding + 8 bytes for `Derived::z` + 4 bytes for `Derived::y` + 4 bytes padding = 24 bytes, assuming 8-byte alignment due to `double z`).
</details>

---

## 3. Name Hiding

When working with inheritance in C++, **Name Hiding** occurs when a derived class declares a member (variable or function) with the exact same name as a member in its base class. 

> [!IMPORTANT]
> **The Rule of Name Hiding:** If the compiler finds a member with a particular name in the derived class, it immediately **stops searching** the base class. All members with that same name in the base class become completely hidden to the derived class object.

---

## 1. How the Compiler Searches for a Member

Whenever you attempt to access a member variable or call a member function on an object (e.g., `obj.member;`), the C++ compiler follows a strict search order:

1. **Search the Derived Class**
   - **If found:** STOP searching immediately and use it.
   - **If NOT found:** Proceed to step 2.
2. **Search the Base Class**

This simple rule is the foundation of name hiding.

---

## 2. Name Hiding with Variables

Let's look at a simple example where both the base class and derived class have a variable named `x`.

```cpp
#include <iostream>
using namespace std;

class A {
public:
    int x = 10;
};

class B : public A {
public:
    int x = 20;
};

int main() {
    B obj;
    cout << obj.x << endl; // Output: 20
    return 0;
}
```

### Why is the output 20?
1. The compiler sees `obj.x`.
2. It searches the scope of class `B`.
3. It finds `x = 20`.
4. It **stops searching**, completely ignoring class `A`.

### Memory Layout
It is important to understand that the base variable is NOT overwritten or destroyed. **Both variables exist in memory!**

```text
Memory Layout for 'obj':
+----------------+
| A::x = 10      |
+----------------+
| B::x = 20      |
+----------------+
```
Only the *name* is hidden. If you want to explicitly access the hidden base variable, you can use the scope resolution operator (`::`):

```cpp
cout << obj.A::x << endl; // Output: 10
```

---

## 3. Name Hiding vs. Function Overloading

A common mistake is confusing name hiding with function overloading. Consider this scenario:

```cpp
#include <iostream>
using namespace std;

class A {
public:
    void show(int x) {
        cout << x << endl;
    }
};

class B : public A {
public:
    void show() {
        cout << "Hello" << endl;
    }
};

int main() {
    B obj;
    obj.show(10); // What happens here?
    return 0;
}
```

Most students expect the output to be `10` (assuming `show(int x)` is inherited and acts as an overload). 

**Actual Result:** `Compilation Error`

### Why? Name Lookup Happens BEFORE Overload Resolution

The C++ compiler always performs these two separate steps in order:

1. **Step 1: Name Lookup**
   Find every visible function having the requested name (`show`).
2. **Step 2: Overload Resolution**
   Look at the arguments provided (e.g., `10`) and choose the best matching function among those found in Step 1.

When the compiler resolves `obj.show(10)`, it starts **Name Lookup** in class `B`. It finds a function named `show` (even though it takes 0 arguments). Because it found the name, it **immediately stops searching**. `A::show(int)` is completely hidden and is never considered. 

Then it moves to **Overload Resolution** and tries to pass `10` into `B::show()`. Since `B::show()` takes no arguments, it throws a compilation error!

### Another Example: Implicit Type Conversion

```cpp
class A {
public:
    void f(int) { cout << "A::f(int)" << endl; }
};

class B : public A {
public:
    void f(double) { cout << "B::f(double)" << endl; }
};

int main() {
    B obj;
    obj.f(5); // Passing an integer
    return 0;
}
```

**What the compiler does:**
1. Searches `B` for the name `f`.
2. Finds `f(double)` and stops searching.
3. Overload resolution: Can we pass `int` (5) to `f(double)`? Yes, it does an implicit conversion from `int` to `double`.
4. Calls `B::f(double)`.

It **never** considers `A::f(int)`, even though it would have been an exact type match!

---

## 4. How to Bring Base Functions Back

If you want the base class functions to participate in overload resolution alongside the derived class functions, you must explicitly bring them into the derived class scope using the `using` keyword.

```cpp
class A {
public:
    void show(int) {
        cout << "Integer" << endl;
    }
};

class B : public A {
public:
    // Bring all 'show' functions from A into B's scope
    using A::show;

    void show() {
        cout << "No Argument" << endl;
    }
};

int main() {
    B obj;
    
    // Now both functions are visible during Name Lookup!
    obj.show();   // Calls B::show() -> Output: "No Argument"
    obj.show(10); // Calls A::show(int) -> Output: "Integer"
    
    return 0;
}
```

---

## 5. Name Hiding vs. Function Overriding

It is extremely important to distinguish between Name Hiding and Function Overriding:

| Feature | Name Hiding | Function Overriding |
| :--- | :--- | :--- |
| **When it happens** | **Compile Time** | **Runtime** |
| **Mechanism** | The compiler searches scopes for a name and stops at the derived class. | Dynamic dispatch using the vtable. |
| **Requirement** | Happens automatically for any matching name. | Requires the `virtual` keyword in the base class and an exact signature match. |

### Function Overriding Example

```cpp
#include <iostream>
using namespace std;

class A {
public:
    virtual void show() {
        cout << "A" << endl;
    }
};

class B : public A {
public:
    void show() override {
        cout << "B" << endl;
    }
};

int main() {
    A* ptr = new B();
    ptr->show(); // Output: "B"
    return 0;
}
```
In this case, the `virtual` keyword enables **runtime polymorphism**, so the actual object type (`B`) determines which function is called, rather than the pointer type (`A*`). This is true overriding, not name hiding.

---

### Important Rules: The Compiler's Sequence

The C++ compiler generally resolves member access in this strict sequence:

1. **Name Lookup**
   If the same name is found from multiple base classes and the reference is ambiguous, the compiler reports an error immediately. Overload resolution is **not performed** until the name lookup itself is unambiguous.
2. **Overload Resolution**
   If the name lookup succeeds (only one unambiguous scope is found), the compiler then selects the best overloaded function based on the provided arguments.
3. **Access Control**
   Only *after* choosing the correct function/member does the compiler check whether it is accessible (`public`, `protected`, `private`). If it isn't accessible, an access error is reported.

## 4. Quick Questions on Name Lookup

**Q1. What is the output of the following code?**
```cpp
#include <iostream>
using namespace std;

class A {
private:
    void show(int) {
        cout << "A\\n";
    }

public:
    void show(double) {
        cout << "B\\n";
    }
};

int main() {
    A obj;
    obj.show(10);
}
```

<details>
<summary>Solution</summary>

**Compilation Error (private access)**

**Reason:**
Name lookup finds both overloads in the same class. Overload resolution chooses `show(int)` as the best match (since 10 is an exact match for `int`). Only *after* choosing the best match does the compiler check access specifiers. It finds that `show(int)` is private, producing an access error. It **does not** fall back to `show(double)`.
</details>

---

**Q2. What is the output of the following code?**
```cpp
#include <iostream>
using namespace std;

class A {
public:
    void fun(int) {
        cout << "A::fun(int)\\n";
    }
};

class B {
private:
    void fun(double) {
        cout << "B::fun(double)\\n";
    }
};

class C : public A, public B {
};

int main() {
    C obj;
    obj.fun(10);
}
```

<details>
<summary>Solution</summary>

**Compilation Error (Ambiguous Name Lookup)**

**Reason:**
The compiler first sees that `fun` exists in both base classes `A` and `B` independently. The name lookup is ambiguous between the two base classes, so it stops immediately. It never even reaches overload resolution, nor does it care that `B::fun(double)` happens to be private. 
</details>

---

## 5. Multiple Inheritance

In C++, a class can inherit from more than one base class. This is called **Multiple Inheritance**.

### Constructor and Destructor Order
When an object is created, the constructors of the Base classes are called in the exact **left-to-right order** that they appear in the class declaration.

> [!WARNING]
> **Crucial Trap:** The compiler only looks at the *class declaration line*. It completely **ignores** the order you write them in your constructor's initializer list!

**Destructor Order: Right-to-Left (Reverse)**
As always, destructors run in the exact reverse order of the constructors. The Derived class is destroyed first, followed by the Base classes from right-to-left.

### Quick Question

**What is the output of this code?**
```cpp
#include <iostream>
using namespace std;

class Base1 {
public:
    Base1() { cout << "1. Base1 Built\\n"; }
    ~Base1() { cout << "6. Base1 Destroyed\\n"; }
};

class Base2 {
public:
    Base2() { cout << "2. Base2 Built\\n"; }
    ~Base2() { cout << "5. Base2 Destroyed\\n"; }
};

// DECLARATION ORDER: Base1 is left, Base2 is right.
class Derived : public Base1, public Base2 {
public:
    // Notice how Base2 is written first here? The compiler IGNORES this order.
    Derived() : Base2(), Base1() { 
        cout << "3. Derived Built\\n"; 
    }
    ~Derived() { cout << "4. Derived Destroyed\\n"; }
};

int main() {
    Derived obj;
    return 0;
}
```

<details>
<summary>Solution</summary>

**Output:**
```text
1. Base1 Built
2. Base2 Built
3. Derived Built
4. Derived Destroyed
5. Base2 Destroyed
6. Base1 Destroyed
```
</details>

---

## 6. The Diamond Problem

The Diamond Problem is a specific ambiguity that arises in Multiple Inheritance. It occurs when two classes (`B` and `C`) inherit from the same Base class (`A`), and then a new class (`D`) inherits from both `B` and `C`.

This creates a diamond-shaped inheritance graph:
```text
    A (Base)
   / \\
  B   C
   \\ /
    D (Most Derived)
```

### The Problem

```cpp
class A {
public:
    int x;
};

class B : public A {}; // B gets its own copy of A
class C : public A {}; // C gets its own copy of A

class D : public B, public C {}; // D inherits both!
```

Because `D` inherits from both `B` and `C`, and both contain their own physical copy of `A`, two massive issues occur:

#### Issue A: Memory Duplication
When you instantiate `D obj;`, the memory layout does not contain one `A`. It contains **two**!
1. `obj` contains a `B` subobject (which contains `A::x`).
2. `obj` contains a `C` subobject (which contains a second `A::x`).

This wastes memory and breaks the logical structure of the object.

#### Issue B: Ambiguity (Compiler Error)
Because there are two copies of `A` in memory, the compiler cannot resolve direct calls to `A`'s variables or methods.

```cpp
D obj;
obj.x = 10; // COMPILATION ERROR!
```
The compiler throws an "ambiguous access" error because it does not know if you mean:
- `obj.B::x = 10;`
- `obj.C::x = 10;`

---

## 7. Solutions to the Diamond Problem

### Solution 1: Virtual Inheritance (Preferred)

To solve the diamond problem natively, C++ introduced the `virtual` keyword for inheritance. 

By declaring the inheritance from `A` as `virtual`, you command the compiler: *"No matter how many paths lead back to A, only create **ONE physical copy** of A in memory."*

```cpp
class A {
public:
    int x;
};

// Use the 'virtual' keyword when inheriting from the shared base
class B : virtual public A {}; 
class C : virtual public A {}; 

class D : public B, public C {};
```

Now, when you do `obj.x = 10;`, it works perfectly. `B` and `C` share the exact same physical copy of `A` in memory.

---

### Important: Virtual Base Initialization

> [!IMPORTANT]
> All virtual base classes are initialized by the constructor of the **most-derived class**. Any mem-initializers for virtual base classes specified in a constructor for any class that is not the most derived class are **completely ignored**.

**Example:**
```cpp
#include <iostream>
using namespace std;

class A {
public:
    A(int val) { 
        cout << "1. A built with value: " << val << "\\n"; 
    }
};

class B : virtual public A {
public:
    // B tries to build A with '10'
    B() : A(10) { 
        cout << "2. B built\\n"; 
    }
};

class C : virtual public A {
public:
    // C tries to build A with '20'
    C() : A(20) { 
        cout << "3. C built\\n"; 
    }
};

class D : public B, public C {
public:
    // D bypasses B and C, and builds A directly with '99'
    D() : A(99), B(), C() { 
        cout << "4. D built\\n"; 
    }
};

int main() {
    D obj;
    return 0;
}
```

<details>
<summary>Solution</summary>

**Output:**
```text
1. A built with value: 99
2. B built
3. C built
4. D built
```
</details>

---

## 8. Summary: The Strict Constructor Sequence

When an object is instantiated, constructors execute in this strict, exact order:

1. **Virtual Base Classes First:** The compiler searches the entire inheritance tree for any virtual base classes. They are constructed first. *(If there are multiple virtual bases, they are constructed in the order they appear in the inheritance graph, from top-to-bottom, left-to-right).*
2. **Non-Virtual Base Classes Second:** After all virtual bases are fully built, the standard non-virtual base classes are constructed in the exact order they are listed in the class declaration (e.g., `class D : public B, public C` means `B` builds before `C`).
3. **Member Variables Third:** The member variables of the current class are initialized.
4. **Constructor Body Last:** Finally, the code inside the `{ }` brackets of the current class's constructor is executed.

---

### Solution 2: Using the Scope Resolution Operator

If you cannot (or choose not to) use virtual inheritance, you can manually resolve the ambiguity using the **scope resolution operator (`::`)**. This explicitly tells the compiler which pathway to take.

```cpp
obj.B::show();   // Uses A through B
obj.C::show();   // Uses A through C
```

**Example:**
```cpp
#include <iostream>
using namespace std;

class A {
public:
    int value = 0;
    
    void show() {
        cout << "Value is: " << value << "\\n";
    }
};

class B : public A {
    // B gets its own copy of A
};

class C : public A {
    // C gets its own copy of A
};

class D : public B, public C {
    // D inherits both B's copy and C's copy.
};

int main() {
    D obj;
    
    // obj.value = 10;   <-- COMPILER ERROR: Which 'value'?
    // obj.show();       <-- COMPILER ERROR: Which 'show()'?
    
    // ---------------------------------------------------------
    // THE FIX: Use Scope Resolution (::) to specify the pathway
    // ---------------------------------------------------------
    
    // 1. Set the variable using the B pathway
    obj.B::value = 10;
    
    // 2. Set the variable using the C pathway
    obj.C::value = 99;
    
    cout << "Calling through B's path: ";
    obj.B::show();  // Prints 10
    
    cout << "Calling through C's path: ";
    obj.C::show();  // Prints 99
    
    return 0;
}
```

---

## 9. Inheritance vs. Composition

### 1. Inheritance (The "IS-A" Relationship)
Inheritance is an OOP mechanism where a new class (derived class) acquires properties and behavior of an existing class (base class). It represents a relationship where the child class is a specialized form of the parent class.

**Meaning:** An object of the derived class can be safely treated as an object of the base class.

**Example:**
```text
  Animal
    |
   Dog
```
*A Dog IS-A Animal.*

### 2. Composition (The "HAS-A" Relationship)
Composition is a design technique where one class contains an object of another class as a member variable. Instead of *being* the other class, it *uses* the other class to achieve its functionality.

**Meaning:** An object contains another object as a part of its physical structure.

**Examples:**
| Object | Has a... |
| :--- | :--- |
| **Car** | Engine |
| **House** | Room |

### Why Composition is Often Preferred

Consider this example where we want to build a `Car`:

**Inheritance Approach (Problematic):**
```cpp
class Car : public Engine, public SteeringWheel, public Brakes {
};
```
*Why is this bad?* (Search for this yourself!)


**Composition Approach (Preferred):**
```cpp
class Car {
private:
    Engine engine;
    SteeringWheel wheel;
    Brakes brakes;
};
```
*Why is this preferred?* (Search for this yourself!)
