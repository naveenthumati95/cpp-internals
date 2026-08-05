# Object-Oriented Programming in C++

## Prerequisites
- Basic C++ knowledge

## Topics Covered
- Structure memory layout and alignment
- Classes and Access Modifiers
- Inheritance
- Polymorphism

---

## Polymorphism

Polymorphism (meaning “having multiple forms”) is the capability of an entity of mutating its behavior in accordance with the specific usage context.

For example:
```cpp
Dog d;
Cat c;
Cow cw;

d.sound();   // Bark
c.sound();   // Meow
cw.sound();  // Moo
```
The function name is the same (`sound()`), but the behavior changes depending on the object.

- Dog → "Bark"
- Cat → "Meow"
- Cow → "Moo"

This is polymorphism.

Polymorphism dispatch can be implemented at:
- **Compile-time (static polymorphism)**: when the called instance is known before the program start.
- **Run-time (dynamic polymorphism)**: when the called instance is known only during the execution, i.e., depends on run-time values.

### Function Binding
Connecting the function call to the function body is called Binding.
- In **Early Binding** (or Static Binding or Compile-time Binding), the compiler identifies the type of object at compile-time.
  - The program can jump directly to the function address.
- In **Late Binding** (or Dynamic Binding or Run-time Binding), the run-time identifies the type of object at execution-time and then matches the function call with the correct function definition.
  - The program has to read the address held in the pointer and then jump to that address (less efficient since it involves an extra level of indirection).

C++ achieves late binding by declaring a `virtual` function.

### Dynamic Polymorphism in C++ 

A Base class may define and implement polymorphic methods, and derived classes can override them, which means they provide their own implementations, invoked at run-time depending on the context.

#### Example: Without `virtual`
```cpp
struct A {
    void f() { cout << "A"; }
};

struct B : A {
    void f() { cout << "B"; }
};

void g(A& a) { a.f(); } // accepts A and B
// note: g(B&) would only accept B

int main() {
    A a; B b;
    g(a); // print "A"
    g(b); // print "A" not "B"!!! 
    // Since 'a' is of type A&, the compiler decides at compile time to call A::f().
}
```

#### Example: With `virtual`
```cpp
struct A {
    virtual void f() { cout << "A"; }
}; // now "f()" is virtual, evaluated at run-time

struct B : A {
    void f() override { cout << "B"; }
    // now B::f() overrides A::f(), run-time dispatch
    // 'virtual void f()' is also valid
}; // 'override' is a c++11 feature, more details in the next slides

void g(A& a) { a.f(); } // accepts A and B

int main() {
    A a;
    B b;
    g(a); // print "A"
    g(b); // NOW, print "B"!! 
    // The function is selected during program execution (run time) instead of at compile time (as virtual keyword is used).
}
```

For example:
```cpp
struct A {
    virtual void f() { cout << "A"; }
};

struct B : A {
    void f() override { cout << "B"; }
};

void f(A& a) { a.f(); } // ok, print "B"
void g(A* a) { a->f(); } // ok, print "B"
void h(A a) { a.f(); } // does not work with pass-by value!! print "A"

int main() {
    B b;
    f(b); // print "B"
    g(&b); // print "B"
    h(b); // print "A" (cast to A)
}
```

---

## Virtual Table 

The virtual table (vtable) is a lookup table of functions used to resolve function calls and support dynamic dispatch (late binding).

A virtual table contains one entry for each virtual function that can be called by objects of the class. Each entry in this table is simply a function pointer that points to the most-derived function accessible by that class.

The compiler adds a hidden pointer to the base class which points to the virtual table for that class (`sizeof` considers the vtable pointer).

For example:

```cpp
struct A {
    virtual void f();
    virtual void g();
};

struct B : A {
    void f() override;
};
```

### Memory Layout Example

```cpp
class A {
public:
    int a;
    virtual void f() { cout << "A"; }
};

class B : public A {
public:
    int b;
    void f() override { cout << "B"; }
};
```

**Memory layout of a `B` object:**

```text
       B Object
+--------------------+
| vptr               | ------+
+--------------------+       |
| A::a               |       |
+--------------------+       |
| B::b               |       |
+--------------------+       |
                             |
                             v
                         B vtable
                    +-------------------+
                    | f() -> B::f()     |
                    +-------------------+
```


---

## Size with `virtual` keyword

Virtual classes allocate one extra pointer (the hidden `vptr`).

```cpp
struct A {
    virtual void f1();
    virtual void f2();
};
class B : A {};

cout << sizeof(A); // 8 bytes (vtable pointer)
cout << sizeof(B); // 8 bytes (vtable pointer)
```

## `override` keyword

The `override` keyword ensures that the function is virtual and is overriding a virtual function from a base class. It forces the compiler to check the base class to see if there is a virtual function with this exact signature.

```cpp
class A {
public:
    virtual void f() { cout << "A"; }
};

class B : public A {
public:
    void f(int x) override { // Error!
        cout << "B";
    }
};
```
With `override`, the compiler immediately reports an error:
```text
error: 'f(int)' marked 'override' but does not override any base class function
```
This helps you catch mistakes early.

---

## Hierarchy Casting

Class-casting allows implicit or explicit conversion of a class into another one across its hierarchy.

> [!NOTE]
> `static_cast` and `dynamic_cast` will be covered later, so come back after that.

### Upcasting
**Conversion between a derived class reference or pointer to a base class.**
- It can be implicit or explicit.
- It is **always safe** because a derived class object always contains a complete base class subobject within it. When you upcast, you are simply "forgetting" the derived part and treating the object as its base. The memory layout guarantees that the base portion sits at the beginning of the derived object, so the pointer/reference is always valid.
- Uses `static_cast` or `dynamic_cast`.

Why is it safe? Consider:
```text
    Derived Object in Memory
    +-------------------+
    | Base part          |  ← Upcast pointer points here (always valid)
    +-------------------+
    | Derived part       |
    +-------------------+
```
Since every `Derived` object **is-a** `Base` object, the cast never lies. The `vptr` inside the object still points to the correct vtable, so virtual function calls will still resolve to the derived overrides.

### Downcasting
**Conversion between a base class reference or pointer to a derived class.**
- It is **only explicit** (the compiler will not do it for you).
- It **can be dangerous** because the base pointer might not actually point to a derived object. If the object is genuinely just a `Base` (not a `Derived`), then treating it as `Derived` means you are accessing memory that does not belong to the derived portion, which leads to **undefined behavior** (segfaults, garbage values, corrupted memory).
- Uses `static_cast` (no runtime check, faster but unsafe) or `dynamic_cast` (performs a runtime check using RTTI, returns `nullptr` for pointers or throws `std::bad_cast` for references if the cast is invalid).

Why is it dangerous? Consider:
```text
    Actual Base Object in Memory
    +-------------------+
    | Base part          |  ← This is ALL that exists
    +-------------------+
    | ???  garbage ???   |  ← Downcast thinks Derived data is here (it is NOT!)
    +-------------------+
```
If you downcast a `Base` object to `Derived` and then access `Derived::member`, you are reading random memory beyond the actual object, which causes undefined behavior.

### Sidecasting (Cross-cast)
**Conversion between a class reference or pointer to another class of the same hierarchy level.**
- It is **only explicit**.
- It **can be dangerous** because the two sibling classes (`B1` and `B2`) have completely unrelated memory layouts beyond their shared base. A `B1` object does not contain any `B2` subobject, so interpreting `B1` memory as `B2` is always invalid.
- Uses `dynamic_cast` only (not `static_cast`). `dynamic_cast` will check at runtime whether the actual object is of the target type, and if not, it throws `std::bad_cast` (for references) or returns `nullptr` (for pointers).

### Examples

**Upcasting and Downcasting**
```cpp
struct A { virtual void f() { cout << "A"; } };
struct B : A {
    int var = 3;
    void f() override { cout << "B"; }
};

int main() {
    A a; B b;
    A& a1 = b; // implicit cast upcasting
    static_cast<A&>(b).f(); // print "B" upcasting
    static_cast<B&>(a).f(); // print "A" downcasting
    
    cout << b.var; // print 3 (no cast)
    cout << static_cast<B&>(a).var; // potential segfault!!! downcasting
    // "var" does not exist in "A"
}
```

**Sidecasting**
```cpp
struct A { virtual void f() { cout << "A"; } };
struct B1 : A { void f() override { cout << "B1"; } };
struct B2 : A { void f() override { cout << "B2"; } };

int main() {
    B1 b1; B2 b2;
    dynamic_cast<B2&>(b1).f(); // sidecasting, throw std::bad_cast
    dynamic_cast<B1&>(b2).f(); // sidecasting, throw std::bad_cast
    // static_cast<B1&>(b2).f(); // compile error
}
```

---

## Object Slicing

### What is Object Slicing?
Object slicing happens when a derived class object is copied into a base class object by value. During this process, the derived class part is removed (sliced away) and only the base class portion is copied. After slicing, the object becomes a pure base class object.

#### Example Without Virtual Function
```cpp
class A {
public:
    void f() { cout << "A"; }
};
class B : public A {
public:
    void f() { cout << "B"; }
};

int main() {
    B b;
    A a = b;   // Object slicing happens here
    a.f();     // Output: A
}
```

**Why does it print A?**
C++ creates a completely new object of type `A` and only copies the `A` portion of `B`. The `B` part is completely removed.

### Object Slicing With Virtual Functions

Many people think `virtual` solves slicing. **It does not.**

```cpp
class A {
public:
    virtual void f() { cout << "A"; }
};
class B : public A {
public:
    void f() override { cout << "B"; }
};

int main() {
    B b;
    A a = b;   // Object slicing
    a.f();     // Output: A
}
```
`A a = b;` creates a *completely new object* of type `A`. The new object's `vptr` points to the `A vtable`, resulting in a call to `A::f()`.

---

### Step 1: The Problem Without virtual

Consider the following program:

```cpp
class Animal {
public:
    void sound() {
        cout << "Animal";
    }
};

class Dog : public Animal {
public:
    void sound() {
        cout << "Dog";
    }
};

Animal* p = new Dog();
p->sound();
```

**Question:**
What should be printed?

Many beginners expect: `Dog`
But the actual output is: `Animal`

**Why?**
At compile time, the compiler only knows:
```cpp
Animal* p;
```
The compiler does not know what object `p` will point to while the program is running.

Therefore, it decides:
`Pointer type = Animal*` → `Call Animal::sound()`

This is called **Static Binding (Compile-time Binding)**.

### Step 2: Why is this a Problem?

Suppose we are creating a Zoo Management System.
```text
            Animal
               ▲
      ┌────────┼────────┐
      │        │        │
     Dog      Cat      Cow
```

Now we write:
```cpp
Animal* p;
```

Later, `p = new Dog();` or `p = new Cat();` or `p = new Cow();`

Finally, `p->sound();`

**Desired Output:**
- Dog → Bark
- Cat → Meow
- Cow → Moo

**Problem:**
At compile time the compiler cannot know: Dog? Cat? Cow?
because the decision depends on runtime.

### Step 3: Solution → virtual Keyword

Now we modify the base class.

```cpp
class Animal {
public:
    virtual void sound() {
        cout<<"Animal";
    }
};
```

Only one keyword changes: `virtual`.

This keyword tells the compiler:
"Do NOT decide now. Wait until runtime."

### Step 4: Compiler Detects a Virtual Function

While compiling, the compiler notices `Animal` has a virtual function.

Immediately, it creates a special table. This table is called the **Virtual Table (vtable)**.

### Step 5: Compiler Creates the vtable

For class `Animal`:
```cpp
class Animal {
public:
    virtual void sound();
};
```

Compiler creates `Animal vtable`:
```text
+---------------------------+
| sound → Animal::sound()   |
+---------------------------+
```

**Notice:**
The vtable stores addresses of virtual functions. It does not store data members.

### Step 6: Derived Class is Compiled

Now compiler sees:
```cpp
class Dog : public Animal {
public:
    void sound() override {
        cout<<"Dog";
    }
};
```

Compiler again creates another table, the `Dog vtable`:
```text
+-------------------------+
| sound → Dog::sound()    |
+-------------------------+
```

Now there are `Animal vtable` and `Dog vtable`.
Each polymorphic class gets its own vtable.

### Step 7: Where is the vtable Stored?

The vtable is created only once per class. It is NOT inside every object.

Usually, it is stored in **Program Memory**:

```text
-----------------------------
Code Section

Animal::sound()
Dog::sound()
-----------------------------
Read Only Section

Animal vtable
Dog vtable
-----------------------------
```

So, 1000 `Dog` objects still share only one `Dog vtable`.

### Step 8: Compiler Adds a Hidden Pointer

Now suppose we create:
```cpp
Dog d;
```

You think the object looks like:
```text
Dog Object
+-----------+
| data      |
+-----------+
```

Actually, compiler secretly changes it to:
```text
Dog Object
+-----------+
| vptr      |   ← hidden pointer
+-----------+
| data      |
+-----------+
```

This hidden pointer is called the **vptr (Virtual Pointer)**.

You never write it. Compiler inserts it automatically.

### Step 9: Object Construction

When `Dog d;` is created, the constructor secretly performs: `vptr = Address of Dog vtable`.

Memory becomes:
```text
Dog Object
+-----------+
| vptr -----|----------------+
+-----------+                |
| data      |                |
+-----------+                |
                             |
                      Dog vtable
                 sound → Dog::sound()
```

Similarly, if `Animal a;`, then:
```text
Animal Object
+-----------+
| vptr -----|------------+
+-----------+            |
| data      |            |
+-----------+            |
                          |
                    Animal vtable
               sound → Animal::sound()
```

### Step 10: Base Pointer Refers to Derived Object

Now:
```cpp
Animal* p;
Dog d;
p = &d;
```

Memory:
```text
            p
            |
            ▼
        Dog Object
+-------------------+
| vptr ------------ |--------------------+
+-------------------+                    |
| data              |                    |
+-------------------+                    |
                                         ▼
                                   Dog vtable
                           sound → Dog::sound()
```

**Notice:**
Although `Pointer type = Animal*`, the object is actually `Dog`.

### Step 11: Calling the Virtual Function

Now we execute:
```cpp
p->sound();
```

Compiler does NOT directly call `Animal::sound()`.
Instead, compiler generates code similar to:
1. **Step 1:** Go to the object
2. **Step 2:** Read object's vptr
3. **Step 3:** Follow the vptr
4. **Step 4:** Reach the vtable
5. **Step 5:** Find entry for `sound()`
6. **Step 6:** Call the function stored there

### Step 12: Runtime Dispatch

Current object: `Dog`.
`Dog` object's vptr points to `Dog vtable`.
`Dog vtable` contains `sound() → Dog::sound()`.

Therefore, `Dog::sound()` is executed.
Output: `Dog`.

This entire decision happens during runtime.
This is called **Dynamic Dispatch** or **Runtime Polymorphism**.

### Step 13: Another Example

Suppose:
```cpp
Animal* p;
Animal a;
p = &a;
```

Memory: `Animal Object` vptr → `Animal vtable` → `Animal::sound()`.
Execution: `p->sound()` → `Animal::sound()` → Output: `Animal`.

### Step 14: Changing the Object Changes the Function

```cpp
Animal* p;
Dog d;
Cat c;
```

**Initially:** `p=&d;`
`p` → `Dog object` → `Dog vtable` → `Dog::sound()` → `Dog`.

**Later:** `p=&c;`
`p` → `Cat object` → `Cat vtable` → `Cat::sound()` → `Cat`.

**Notice:**
The code `p->sound();` never changes.
Only the object changes.

### Step 15: Why Isn't the Decision Made at Compile Time?

Consider:
```cpp
Animal* p;

if(choice==1)
    p=new Dog();
else
    p=new Cat();

p->sound();
```

At compile time, compiler cannot know `choice` because `choice` depends on user input, available only during execution.

Therefore, compile-time binding is impossible. Runtime binding is necessary.

### Complete Flow Diagram

```text
Program Starts
       │
       ▼
Compiler sees virtual function
       │
       ▼
Compiler creates vtable
       │
       ▼
Compiler adds hidden vptr to every object
       │
       ▼
Object is created
       │
       ▼
Constructor initializes vptr
       │
       ▼
Base pointer points to object
       │
       ▼
Virtual function called
       │
       ▼
Read object's vptr
       │
       ▼
Go to vtable
       │
       ▼
Find correct function address
       │
       ▼
Execute overridden function
```

### Key Points to Remember

- `virtual` tells the compiler to use runtime dispatch.
- The compiler creates one vtable per polymorphic class during compilation.
- Each object of such a class contains a hidden `vptr`.
- The constructor initializes the `vptr` to the class's vtable.
- A virtual function call is resolved by following: `object → vptr → vtable → function address → execute function`.
- This mechanism allows the same base pointer or reference to invoke different overridden functions depending on the actual object type, which is the essence of runtime polymorphism.


## Important Rules for Virtual Functions

### 1. Declare a Virtual Destructor
**All classes with at least one virtual method should declare a virtual destructor.**

**Reason:**
```cpp
struct A {
    ~A() { cout << "A"; } // <-- here is the problem (not virtual)
    virtual void f(int a) {}
};

struct B : A {
    int* array;
    B() { array = new int[1000000]; }
    ~B() { delete[] array; }
};

void destroy(A* a) {
    delete a; // calls ~A()
}

B* b = new B;
destroy(b); // without virtual, ~B() is not called
// destroy() prints only "A" -> huge memory leak!! 
```
When you delete an object through a base-class pointer, C++ calls the base destructor by default. If the base destructor is not virtual, the derived destructor is never called, so resources owned by the derived class (such as dynamically allocated memory, files, or sockets) are not released, causing resource leaks.

### 2. Never call virtual methods in constructors and destructors

When a C++ object with virtual functions is created or destroyed, the compiler relies on the `vptr` (Virtual Table Pointer) and `vtable` (Virtual Method Table) to resolve dynamic dispatch. Because an object is built from the "inside out" (base to derived) and destroyed from the "outside in" (derived to base), the `vptr` actually changes what it points to during the construction and destruction phases.

Here is the exact, point-wise timeline of what happens when you instantiate and destroy a Derived class object that inherits from a Base class:

#### 1. Object Construction Phase (Building Up)
When you create a Derived object, memory is allocated for the entire object (including all base subobjects), but it is initialized strictly from the base up to the most derived class.

- **Memory Allocation:** Raw memory is allocated for the complete Derived object. At this exact moment, it is just raw memory; it is not yet an object, and the `vptr` contains garbage.
- **Base Class Initialization Starts:** The Derived constructor is invoked, but before doing anything else, it must call the Base constructor.
- **Base `vptr` Setup:** As soon as the Base constructor begins execution (before any base member variables are initialized and before the Base constructor body runs), the compiler implicitly injects code to point the object's `vptr` to the Base class's vtable.
- **Base Members Initialize:** The member variables of the Base class are initialized.
- **Base Constructor Body Runs:** The code inside the Base constructor executes.
  - **Important:** If you call a virtual function here, the `vptr` is currently pointing to the Base vtable. Therefore, the Base version of the virtual function is called, not the Derived version. The Derived part of the object does not technically exist yet.
- **Derived `vptr` Overwrite:** Once the Base constructor finishes, execution returns to the Derived class. Before initializing any derived members, the compiler injects code to overwrite the `vptr`, pointing it to the Derived class's vtable.
- **Derived Members Initialize:** The member variables of the Derived class are initialized.
- **Derived Constructor Body Runs:** The code inside the Derived constructor executes. If you call a virtual function here, it will correctly resolve to the Derived version.

#### 2. Object Destruction Phase (Tearing Down)
Destruction happens in the exact reverse order of construction. The object is systematically dismantled, and the `vptr` is continually downgraded to reflect the current state of the object.

- **Derived Destructor Starts:** The Derived destructor is invoked. The `vptr` is currently pointing to the Derived vtable.
- **Derived Destructor Body Runs:** The code inside the Derived destructor executes. Any virtual functions called here will resolve to their Derived overrides.
- **Derived Members Destroyed:** The member variables of the Derived class are destroyed in reverse order of their declaration.
- **Base Destructor Starts:** The destructor for the Base class is automatically invoked.
- **Base `vptr` Downgrade:** Just like in construction, the compiler injects code at the start of the Base destructor to overwrite the `vptr`, pointing it back to the Base class's vtable.
- **Base Destructor Body Runs:** The code inside the Base destructor executes.
  - **Important:** The Derived portion of the object has already been destroyed. If you call a virtual function here, it will resolve using the Base vtable, ensuring you do not accidentally call a Derived method that relies on destroyed variables.
- **Base Members Destroyed:** The member variables of the Base class are destroyed.
- **Memory Deallocation:** The raw memory for the object is finally freed back to the system.

**The Golden Rule:** 
Never call virtual functions inside constructors or destructors. Because the `vptr` changes during these phases, the dynamic type of the object is actively changing. The runtime will only ever call the function corresponding to the class currently being constructed/destroyed, which often leads to unexpected behavior if you are expecting it to reach the fully derived override.

**For example:**
```cpp
struct A {
    A() { f(); } // what instance is called? "B" is not ready
    // it calls A::f(), even though A::f() is virtual
    virtual void f() { cout << "Explosion"; }
};

struct B : A {
    B() = default; // call A(). Note: A() may be also implicit
    void f() override { cout << "Safe"; }
};

B b; // call B(), prints "Explosion", not "Safe"!!
```

## Pure Virtual Functions

A **pure virtual function** is a virtual function that must be implemented by a derived class if that derived class is to be instantiated. It is declared by assigning `0`.

```cpp
struct A {
    virtual void f() = 0; // pure virtual without body
    virtual void g() = 0; // pure virtual with body
};
void A::g() {} // pure virtual implementation (body) for g()

struct B : A {
    void f() override {} // must be implemented
    void g() override {} // must be implemented
}; 
```

> [!NOTE]
> A class with at least one pure virtual function cannot be instantiated.

---

## Abstract Classes

A class is considered an **Abstract Class** if it has at least one pure virtual function. Its main purpose is to establish a common interface for derived classes.

```cpp
struct B { // ABSTRACT CLASS
    B() {} // abstract classes may have a constructor
    virtual void g() = 0; // at least one pure virtual function
protected:
    int x; // additional data
};
```

---

## Cost of Virtual Functions

While virtual functions are powerful, they come with a performance cost:
- **Normal Call Flow:** `Object` → `Direct Function Address`
- **Virtual Call Flow:** `Object` → `vptr` → `vtable` → `Function Address` → `Call`

**Costs include:**
- **Extra Pointer Lookup:** Resolving the address at runtime adds overhead.
- **Cache Misses:** The vtable or the function instructions might not be in the CPU cache.
- **Compiler Optimization:** Harder for the compiler to optimize (cannot always inline).

---

## Concept Check & Interview Questions

### Q1: What is the output of the following code?
```cpp
class A {
public:
    virtual void f() { cout << "A"; }
};
class B : public A {
public:
    void f() override { cout << "B"; }
};

void print(A obj) {
    obj.f();
}

int main() {
    B b;
    print(b);
}
```
<details>
<summary><b>Click to reveal solution</b></summary>

`A` (Because `obj` is passed by value, which causes Object Slicing!). The `B` part is sliced off and `obj` becomes a pure `A` object with its `vptr` pointing to the `A` vtable.
</details>

### Q2: Why are Abstract Classes required, what is the need for them?
**Answer:** DIY

### Q3: What is the output of the following code?
```cpp
class Base {
public:
    Base() { cout << "Base Constructor" << endl; }
    virtual void print() { cout << "Base Print" << endl; }
    virtual ~Base() { cout << "Base Destructor" << endl; }
};

class Derived : public Base {
public:
    Derived() { cout << "Derived Constructor" << endl; }
    void print() override { cout << "Derived Print" << endl; }
    ~Derived() { cout << "Derived Destructor" << endl; }
};

int main() {
    Base* ptr = new Derived();
    ptr->print();
    delete ptr;
}
```

<details>
<summary><b>Click to reveal solution</b></summary>

```text
Base Constructor
Derived Constructor
Derived Print
Derived Destructor
Base Destructor
```

**Explanation:**
1. `new Derived()` → Construction happens base-to-derived: `Base()` runs first, then `Derived()`.
2. `ptr->print()` → Since `print()` is virtual and `ptr` actually points to a `Derived` object, dynamic dispatch resolves to `Derived::print()`.
3. `delete ptr` → Since `~Base()` is virtual, destruction happens derived-to-base: `~Derived()` runs first, then `~Base()`. If the destructor were NOT virtual, only `~Base()` would run, causing a resource leak.
</details>

---
*Last updated: July 2026*
