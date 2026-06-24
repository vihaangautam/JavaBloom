# AP CSA Flashcards dataset

# Format: (chapter_number, chapter_title, front, back, explanation)
apcsa_cards = [
    # Unit 1: Using Objects & Reference Types
    (1, "Unit 1: Objects & References", 
     "What is an Object Reference?", 
     "A variable that holds the memory address of an object, not the object itself.", 
     "In Java, declared objects are reference variables. E.g., MyClass x; allocates space for a reference pointer. The object itself is created in the heap via 'new'."),

    (1, "Unit 1: Objects & References", 
     "What is Object Aliasing?", 
     "When two or more reference variables point to the exact same object in memory.", 
     "E.g., if a = new Car(); b = a; both variables refer to the same object. Changes made via reference 'a' will be visible when accessed through reference 'b'."),

    (1, "Unit 1: Objects & References", 
     "What is a Null Reference?", 
     "A reference variable that does not point to any object, containing the value 'null'.", 
     "Accessing methods or variables on a null reference triggers a NullPointerException at runtime. Always check if a reference is null before calling methods."),

    (1, "Unit 1: Objects & References", 
     "Why are Java Strings immutable?", 
     "For security, synchronization, and caching efficiency in the String Constant Pool.", 
     "Once created, a String's characters cannot be altered. Concatenating or modifying strings generates a brand new String object, leaving the original unchanged."),

    (1, "Unit 1: Objects & References", 
     "Explain Java's pass-by-value of object references.", 
     "Method arguments are copies of the references. You can modify object fields, but cannot reassign the caller's reference pointer.", 
     "Java passes all parameters by value. For objects, the 'value' passed is the memory address. Inside the method, reassigning the parameter to a new object (e.g., param = new MyObject()) doesn't affect the caller's variable."),

    # Unit 2: Selection & Iteration
    (2, "Unit 2: Selection & Iteration", 
     "Explain Short-Circuit Evaluation.", 
     "When the evaluation of a logical expression stops as soon as the outcome is determined.", 
     "For &&: if LHS is false, expression evaluates to false immediately without checking RHS. For ||: if LHS is true, expression evaluates to true immediately (skipping RHS)."),

    (2, "Unit 2: Selection & Iteration", 
     "State De Morgan's Laws.", 
     "!(A && B) is equivalent to (!A || !B); !(A || B) is equivalent to (!A && !B).", 
     "To negate compound boolean conditions: negate individual sub-conditions and flip the operator (AND to OR, OR to AND)."),

    (2, "Unit 2: Selection & Iteration", 
     "What is an Off-By-One error?", 
     "A loop logic bug where the loop executes one time too many or one time too few.", 
     "Commonly caused by incorrect relational boundaries (e.g. using '<=' instead of '<' when checking array indexes, leading to ArrayIndexOutOfBoundsException)."),

    # Unit 3: Class Creation
    (3, "Unit 3: Class Creation", 
     "What is the purpose of the 'this' keyword?", 
     "A reference to the current object instance within a constructor or method.", 
     "Commonly used to distinguish instance variables from local parameters with the same name during initialization, e.g. this.name = name;"),

    (3, "Unit 3: Class Creation", 
     "How is Encapsulation enforced in Class design?", 
     "Declaring instance variables as private and exposing them through public accessors (getters) and mutators (setters).", 
     "Prevents external code from corrupting object states. It ensures changes to variables are validated inside the class methods."),

    (3, "Unit 3: Class Creation", 
     "Differentiate: Accessor (getter) vs Mutator (setter) method", 
     "Accessors read values without modifying state; Mutators modify state and return void.", 
     "Accessor: public String getName() { return name; }. Mutator: public void setName(String name) { this.name = name; }."),

    # Unit 4: Data Collections
    (4, "Unit 4: Data Collections", 
     "Differentiate: Array vs ArrayList size checks", 
     "Array uses '.length' (field); ArrayList uses '.size()' (method).", 
     "E.g., array length: int len = arr.length; ArrayList size: int size = list.size();. Writing arr.length() or list.size yields a compiler error."),

    (4, "Unit 4: Data Collections", 
     "Identify core ArrayList modification methods.", 
     "add(obj), add(index, obj), remove(index), set(index, obj), get(index).", 
     "ArrayList is a dynamic collection. Adding or removing elements shifts subsequent items, updating indexes and array capacity automatically."),

    (4, "Unit 4: Data Collections", 
     "What is the trap of removing elements in an ArrayList while traversing it?", 
     "Skipping elements or causing index exceptions because indexes shift dynamically.", 
     "When you remove an element at index 'i', the list size decreases and all elements shift left. If you increment the counter normally, the element that shifted into index 'i' is skipped. Solution: iterate backwards or use an Iterator."),

    (4, "Unit 4: Data Collections", 
     "What is the row-major order limitation of Enhanced For-Loops (for-each) on arrays?", 
     "You cannot use them to modify primitive array elements or track index positions.", 
     "A for-each loop only provides read-only access to elements. E.g. for(int x : arr) { x = 10; } does not modify the array elements because x is a local copy."),

    (4, "Unit 4: Data Collections", 
     "How do you calculate number of columns in a 2D Array?", 
     "arr[0].length (length of the first row).", 
     "Java 2D arrays are arrays of row arrays. arr.length is row count. arr[0].length is column count (assuming a rectangular grid)."),

    # Unit 5: Tracing Recursion
    (5, "Unit 5: Tracing Recursion", 
     "What is the Base Case in recursion?", 
     "The condition under which a recursive method terminates and returns a value without making further recursive calls.", 
     "Without a base case, recursion continues infinitely, filling stack frames until a StackOverflowError occurs."),

    (5, "Unit 5: Tracing Recursion", 
     "What data structure manages active function frames during recursive execution?", 
     "The Call Stack (LIFO - Last In First Out).", 
     "Each recursive call pushes a new execution frame onto the stack containing its local variables. When a call completes, its frame is popped off, and its return value flows back to the caller.")
]
