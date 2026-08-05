
Inheritance:
New classes can be derived from existing classes using a mechanism called "inheritance".Classes that are used for derivation are called "base classes" of a particular derived class.

syntax:
class DerivedSingleBase : [virtual] [access-specifier] Base
{
    // member list
};

class DerivedMultipleBases : [virtual] [access-specifier] Base1,
    [virtual] [access-specifier] Base2, ...
{
    // member list
};

why inheritance ?
it solved following problems:
•Redundancy: Same fields declared multiple times
•Maintenance: Changes must be made everywhere

What derived classes can do:
1. Inherit all members from base class
2. Add new data members and functions
3. Override base class function behavior


Constructors and Inheritance -
Memory Layout:
The Base class members are always placed at the "top", followed immediately by the Derived class members.
constructor -
The Base class constructor must fully complete before the Derived class constructor is allowed to start.
why?
The Derived class might rely on inherited variables to set up its own state. If the Base class is not initialized first, the Derived class would read dangerous, uninitialized garbage memory.

When Derived obj; is called in code:

Allocation: The OS carves out the total required memory block (filled with garbage data).

Base Initialization: The Base() constructor runs, initializing the top section of the memory block.

Derived Initialization: The Derived() constructor runs, initializing the bottom section of the memory block.


Destructors dismantle the object from bottom to top (or outside-in).
Destructors run in the exact reverse order of constructors. The Derived class destructor runs first, followed by the Base class destructor.

Qs-
#include <iostream>
using namespace std;

class Base {
public:
    int x;
    
    Base() {
        cout << "1. Base Constructor\n";
    }
    
    ~Base() {
        cout << "4. Base Destructor\n";
    }
};

class Derived : public Base {
public:
    double z;
    int y;
    
    Derived() {
        cout << "2. Derived Constructor\n";
    }
    
    ~Derived() {
        cout << "3. Derived Destructor\n";
    }
};

int main() {
    Derived obj; 
    return 0;
}
Tell ouput and size of obj ->

soln-
1. Base Constructor
2. Derived Constructor
3. Derived Destructor
4. Base Destructor
and size is 24.




# Name Hiding in C++

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

Important rules :
The compiler generally checks in this sequence:

1.Name lookup
If the same name is found from multiple base classes and the reference is ambiguous, the compiler reports an error immediately.
Overload resolution is not performed until the name lookup itself is unambiguous.
2.Overload resolution
If the name lookup succeeds, the compiler selects the best overloaded function.
3.Access control
After choosing the correct function/member, the compiler checks whether it is accessible (public, protected, private).
If it isn't accessible, an access error is reported.

Quick Qs-
#include <iostream>
using namespace std;

class A {
private:
    void show(int) {
        cout << "A\n";
    }

public:
    void show(double) {
        cout << "B\n";
    }
};

int main() {
    A obj;
    obj.show(10);
}


Solution-

Compilation Error (private access)

Reason:
Name lookup finds both overloads in the same class. Overload resolution chooses show(int) as the best match. Only then does the compiler check access and finds that show(int) is private, producing an access error. It does not fall back to show(double).


#include <iostream>
using namespace std;

class A {
public:
    void fun(int) {
        cout << "A::fun(int)\n";
    }
};

class B {
private:
    void fun(double) {
        cout << "B::fun(double)\n";
    }
};

class C : public A, public B {
};

int main() {
    C obj;
    obj.fun(10);
}

solution-
compilation error
The compiler first sees that fun exists in both base classes A and B. The name lookup is ambiguous, so it stops immediately. It never reaches overload resolution or checks that B::fun(double) is private.