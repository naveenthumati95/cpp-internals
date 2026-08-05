formatted_rules = """## Important Rules for Virtual Functions

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
```"""

with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "r") as f:
    content = f.read()

start_marker = "## Important Rules for Virtual Functions"
end_marker = "## Pure Virtual Functions"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + formatted_rules + "\n\n" + content[end_idx:]
    with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "w") as f:
        f.write(new_content)
    print("Formatted rules successfully injected.")
else:
    print("Could not find markers.")
