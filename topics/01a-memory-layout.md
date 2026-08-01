## Memory Layout

A C++ program's memory is divided into distinct regions:

![Memory Layout](../image/memory_layout.png)

### Text Segment
It stores the program’s compiled machine code, which means the whole instructions of the program are stored here. For example:
*Assembly*
```asm
add r1, r2, r0;
mul r3, r4, r5;
```

### Data Segment
It stores the global and static variables. It is divided into two parts:

**Initialized Data Segment**
Those global and static variables which are assigned a value at declaration.

**Uninitialized Data Segment (BSS)**
Those global and static variables which have not been explicitly initialized. They are automatically set to zero at run time.


### Stack
Data stored in the stack includes:
- **Local variables:** Variables in a local scope.
- **Function arguments:** Data passed from a caller to a function.
- **Return addresses:** Data passed from a function back to its caller.

**Important:**
1. Every object that resides in the stack is not valid outside its scope.
2. Whenever a function is called, a stack frame is pushed to the stack which includes the return address, parameters, etc. When the function finishes, its frame is popped off.
3. Only global and static variables are automatically initialized to zero. Local variables declared inside functions are stored in the stack and contain garbage values unless explicitly initialized.


### Heap
It is a memory region used for dynamic memory allocation at run time.
Dynamic memory allocation is done using the keywords `new`, `malloc`, `calloc`.


### Stack vs Heap

**Size**
The heap uses the concept of virtual memory (covered in OS), so we can allocate as much memory as needed until the system runs out, while the stack size is limited. So basically, Stack size < Heap size. A stack overflow occurs if the stack does not have the required space, while `new` throws a `std::bad_alloc` exception when the heap runs out of memory.


**Time**
Let's suppose:
```cpp
struct Student {
    int id;
    double marks;
};

int main() {
    int num = 1;
    Student* p = new Student;
    p->id = 101;
    p->marks = 95.5;

    delete p;
}
```
**Memory view:**

Here, `num` is on the stack.
Here, the pointer `p` is created on the stack, which stores the address (let's say 0x5000), but the actual data is stored in the heap.
So, in the stack we occupy 8 bytes to store the address (assuming a 64-bit system), and in the heap, we have 4 + 4 (padding discussed later) + 8 = 16 bytes.

Now, when we require the `num` variable, the compiler knows `num` is at stack offset `-4` (there is a stack pointer, and the offset is from that). So, the compiler will replace the instruction with an assembly instruction like *store n1, 1* (just for understanding, where `n1 = stack pointer - 4`), which takes fewer CPU cycles. While for the heap, if someone has to read `p->id`, first it has to read the address stored in `p` (which is in the stack), then it has to go to that address, add the required offset, and then read it, which requires more CPU cycles.

Heap access time is more than stack access time.


**Cache Locality**

*Allocation*
When another local variable has to be pushed to the stack, the stack pointer moves, so new variables are placed next to the previous stack data. While in heap allocation, the allocator searches for free blocks, so a new object may go anywhere; therefore, memory may become scattered. For example:
Let's say heap memory looks like this: 
`[used][free][used][free][used]`. Then, the next time `new` is called, it may go to the second block, and the time after that it may go to the fourth block (so it is not contiguous).

*Important:*
Heap is contiguous within a single allocation, but fragmented between different allocations. For example, in a `std::vector` which is dynamically allocated, `v[0]` and `v[1]` are contiguous (let's assume `int`, so `v[0]` and `v[1]` are at `address` and `address + 4` respectively).

The stack is more cache-friendly than the heap.
```cpp
int num = 1;  // stack ptr - 4
int x = 10;   // stack ptr - 8
int y = 20;   // stack ptr - 12
int z = 30;   // stack ptr - 16
```
In memory, all those variables are very close, so a cache hit will occur.

While:
```cpp
Student* a = new Student;
Student* b = new Student;
Student* c = new Student;
```
In memory, all those variables may be at different addresses, so a cache miss might occur.

**Life Time**
The stack is usually tied to function scope, while heap memory has to be explicitly deleted by the programmer.


### Examples

```cpp
int data[] = {1, 2}; // DATA segment memory
int big_data[1000000] = {}; // BSS segment memory
// (zero-initialized)

int main() {
    int A[] = {1, 2, 3}; // Stack memory
}
```

```cpp
int x = 3; // Not on the stack (Data segment)
struct A {
    int k; // Depends on where the instance of A is created
};

int main() {
    int y = 3; // On stack
    char z[] = "abc"; // On stack
    A a; // On stack (also k)
    void* ptr = malloc(4); // Variable "ptr" is on the stack, data is on the heap
}
```


**Question**
Why is BSS required?
When the compiler builds your program, it calculates the total size of all your uninitialized global variables. Instead of writing millions of zero-initialization instructions in the executable file, it just creates the `.bss` header in the binary file. So it saves a lot of space in the binary file (`.exe` file). The Hard Disk (or SSD) is where your binary file is stored when the program is closed. Hard disk space is valuable, and reading from it is physically slow. If `.bss` DID NOT exist:
The compiler would be forced to generate 100 Megabytes of literal zeros (00000000...) and save them permanently inside your `.exe` file on the hard disk. Your simple program would instantly take up 100 MB of your hard drive space, just to store "nothing."


```cpp
int x; // Uninitialized global so compiler stores it in .bss 

int main() {
    x = 10; // Runtime Assignment
    // Even though it is initialized at runtime here, it will still be in .bss, 
    // as .bss, .text segment, and .data segment locations are decided during compile time.
    return 0;
}
```



