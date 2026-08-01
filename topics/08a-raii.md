**RAII** stands for **Resource Acquisition is Intitialization**. Which means "**Acquire the resource during object initialization (construction), and release it automatically when the object is destroyed**". It is an **Idiom** (**commonly accepted programming technique or pattern** used to solve a recurring problem in a language).

> Resource lifetime is object lifetime.

Here the word **Resource** can be anything that must be acquired and later released, such as:

- Heap memory (`new`/`delete`)

- Files (`fopen`/`fclose`)

- Mutexes (`lock`/`unlock`)

- Sockets

- Threads

> RAII is not only applicable for memory.

#### Example

Without **RAII**:

```cpp
FILE* file = fopen("cc.txt", "r");

// ... use file ...

flcose(file); // Easy to forget!
```

If an exception occurs before `fclose`, the file leaks.

With **RAII**:

```cpp
class File{
public:
    File(const char* name)
    {
        fp = fopen(name, "r"); // Acquire
    }
    
    ~File()
    {
        fclose(fp); // Release
    }
private:
    FILE* fp;
}


void foo()
{
    File file("data.txt");
    // Use the file.
} // Destructor automatically closes the file. No need to worry :)
```

No matter how `foo()` exits: normal return, exception, or early return, the destructor runs and the file is closed.

**RAII** idiom consists in three steps:

- Encapsulate a resource into a class (constructor).

- Use the resource via a local instance of the class.

- The resource is automatically released when object gets out of scope (destructor).

> What is Garbage collection (GC)?
> 
> Garbage collection (GC) is a technique where the runtime automatically finds and frees memory that is no longer being used by the program.

Unfortunately unlike Java, C++ doesn't have a garbage collector.

Implications of **RAII**:

- C++ programming language does not require the garbage collector!!

- The programmer has the responsibility to manage the resources.
