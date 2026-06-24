# ICSE Class 10 Flashcards dataset

# Format: (chapter_number, chapter_title, front, back, explanation)
icse10_cards = [
    # Chapter 1: OOP Principles Depth
    (1, "Ch 1: OOP Principles", 
     "Differentiate: Overloading vs Overriding", 
     "Overloading defines methods with same name but different parameters in the same class; Overriding redefines a parent method in a subclass.", 
     "Overloading is compile-time (polymorphism). Overriding is runtime (polymorphism) and require inheritance. Overridden methods share the exact same signature."),

    (1, "Ch 1: OOP Principles", 
     "What is dynamic binding (late binding)?", 
     "Resolving method calls at runtime based on the actual object type rather than compile-time reference type.", 
     "In Java, overridden methods are bound at runtime based on the object reference dynamically. This supports runtime polymorphism."),

    (1, "Ch 1: OOP Principles", 
     "What is static binding (early binding)?", 
     "Resolving method calls at compile-time based on reference types.", 
     "Java binds private, final, static, and overloaded methods at compile time because they cannot be overridden."),

    # Chapter 2: Constructors
    (2, "Ch 2: Constructors", 
     "What is a Constructor?", 
     "A member block of code used to initialize class variables when an object is created.", 
     "Constructors share the exact name of the class and look like methods, but do not possess any return type (not even void)."),

    (2, "Ch 2: Constructors", 
     "What is a Default Constructor?", 
     "A constructor automatically provided by the Java compiler if no explicit constructor is defined.", 
     "It takes no arguments and initializes instance variables to their default values (e.g. 0, 0.0, null, false)."),

    (2, "Ch 2: Constructors", 
     "Differentiate: Default vs Parameterized Constructor", 
     "Default constructor takes no arguments; Parameterized constructor accepts values to custom-initialize variables.", 
     "If you declare a parameterized constructor, Java will not automatically generate the default constructor. You must define it manually if needed."),

    (2, "Ch 2: Constructors", 
     "What is Constructor Overloading?", 
     "Declaring multiple constructors in the same class with different parameters.", 
     "Allows objects of the same class to be initialized in different ways depending on what inputs are passed to 'new' (e.g., empty constructor vs initialized constructor)."),

    (2, "Ch 2: Constructors", 
     "Why don't constructors have a return type?", 
     "Because they implicitly return the reference to the newly created object.", 
     "If you specify a return type (even void), Java will treat it as a standard class method, not a constructor. E.g., void MyClass() is a method, not a constructor."),

    (2, "Ch 2: Constructors", 
     "When is a constructor called?", 
     "Automatically when an object is instantiated using the 'new' keyword.", 
     "It is called exactly once per object lifecycle to allocate memory and initialize states, e.g. MyClass obj = new MyClass();"),

    # Chapter 3: Wrapper Classes
    (3, "Ch 3: Wrapper Classes", 
     "What is a Wrapper Class?", 
     "A class that converts primitive data types into object equivalents.", 
     "Every primitive has a corresponding Wrapper class in java.lang (e.g., int -> Integer, char -> Character). They are useful in Collections (like ArrayList) which only accept objects."),

    (3, "Ch 3: Wrapper Classes", 
     "Differentiate: Integer.parseInt(s) vs Integer.valueOf(s)", 
     "parseInt() returns a primitive int; valueOf() returns an Integer wrapper object.", 
     "Integer.parseInt(\"123\") returns 123. Integer.valueOf(\"123\") returns a cache-supported Integer object instance containing 123."),

    (3, "Ch 3: Wrapper Classes", 
     "Differentiate: Autoboxing vs Unboxing", 
     "Autoboxing is automatic conversion of primitive to wrapper; Unboxing is wrapper to primitive.", 
     "Autoboxing: Integer x = 5; (int to Integer). Unboxing: int y = x; (Integer to int). Done automatically by the compiler."),

    (3, "Ch 3: Wrapper Classes", 
     "Identify key Character wrapper class methods.", 
     "isLetter(), isDigit(), isWhitespace(), isUpperCase(), isLowerCase(), toUpperCase(), toLowerCase().", 
     "Unlike String methods, Character methods are static and take a char parameter, e.g. Character.isDigit('5') -> true."),

    # Chapter 4: Strings
    (4, "Ch 4: Strings", 
     "Differentiate: String vs StringBuffer", 
     "String is immutable (cannot be changed); StringBuffer is mutable (can be changed).", 
     "Modifying a String creates a completely new object in the String pool. Modifying a StringBuffer modifies the existing memory buffer directly (useful for loops)."),

    (4, "Ch 4: Strings", 
     "Differentiate: s1 == s2 vs s1.equals(s2) for Strings", 
     "== compares memory addresses (reference equality); equals() compares characters (value equality).", 
     "If s1 = \"hello\" and s2 = new String(\"hello\"), s1 == s2 is false (different memory blocks), but s1.equals(s2) is true (same characters)."),

    (4, "Ch 4: Strings", 
     "What does s.compareTo(t) return?", 
     "An integer difference based on lexicographical (alphabetical) ASCII comparison.", 
     "Returns 0 if equal; negative value if s comes before t; positive value if s comes after t. Compares character-by-character."),

    (4, "Ch 4: Strings", 
     "Why does s.substring(start, end) exclude the ending index?", 
     "Because the length of the substring is exactly equal to (end - start).", 
     "E.g., \"Java\".substring(1, 3) yields \"av\" (characters at index 1 and 2, index 3 is excluded). 3 - 1 = 2 characters."),

    (4, "Ch 4: Strings", 
     "What does s.indexOf('c') return if character 'c' is not found?", 
     "-1.", 
     "indexOf() returns the first index of character or substring. If the target is missing, it returns -1. E.g. \"Java\".indexOf('x') -> -1."),

    # Chapter 5: Arrays
    (5, "Ch 5: Arrays", 
     "What is an Array?", 
     "A collection of variables of the same data type stored in contiguous memory locations.", 
     "Arrays are objects in Java. Their size is fixed at allocation time, and indexes start at 0, ranging up to (length - 1)."),

    (5, "Ch 5: Arrays", 
     "What runtime error occurs if you access an invalid array index?", 
     "ArrayIndexOutOfBoundsException.", 
     "Occurs when index is negative or greater than or equal to array.length, e.g. int[] a = new int[5]; a[5] = 10;"),

    (5, "Ch 5: Arrays", 
     "How do you get row and column count in a 2D Array?", 
     "Row count: arr.length; Column count: arr[0].length.", 
     "A 2D array is an array of arrays. arr.length yields number of rows. arr[r].length yields column count in that specific row."),

    # Chapter 6: Searching & Sorting
    (6, "Ch 6: Searching & Sorting", 
     "What is the prerequisite for Binary Search?", 
     "The array must be sorted in either ascending or descending order.", 
     "Linear search does not require sorted data. Binary search relies on divide-and-conquer, narrowing search scope based on midpoint comparisons."),

    (6, "Ch 6: Searching & Sorting", 
     "What is the worst-case comparison complexity of Bubble Sort?", 
     "O(N^2) comparisons.", 
     "Bubble sort steps through the array repeatedly, swapping adjacent elements. With N elements, it performs N*(N-1)/2 comparisons in the worst case."),

    (6, "Ch 6: Searching & Sorting", 
     "How does Selection Sort operate?", 
     "Finds the smallest element in unsorted range and swaps it into the starting position.", 
     "Maintains sorted and unsorted segments. On each pass, it selects the minimum value from the unsorted segment and swaps it with the leftmost unsorted element.")
]
