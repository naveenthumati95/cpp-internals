# Structure and its Size


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



---
*Last updated: July 2026*
