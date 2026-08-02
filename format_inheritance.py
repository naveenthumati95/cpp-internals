import os

# Read the existing content
with open('topics/02c-inheritance.md', 'r') as f:
    content = f.read()

# Separate the header and the body of the existing file
header = "# Inheritance\n\n"
body = content.replace("# Inheritance\n\n", "")

new_top = """## 1. Introduction to Inheritance

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

"""

new_bottom = """
### Quick Questions on Name Lookup

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

"""

# Reassemble the file
final_content = header + new_top + body + new_bottom

with open('topics/02c-inheritance.md', 'w') as f:
    f.write(final_content)

print("Formatted successfully.")
