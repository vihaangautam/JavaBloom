from database import SessionLocal, engine, Base
from models import Question, Trace
import json

def seed_database():
    # Recreate tables to apply schema fresh
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Define base questions templates for all three tracks
        tracks = ["ICSE9", "ICSE10", "APCSA"]

        for track in tracks:
            # 1. Type Confusion Questions
            tc_questions_data = [
                # Rule 1: Integer Division Truncation
                ("rule_1", "Integer Division", "easy", "What is the evaluated type and value of this division?", "5 / 2", ["double: 2.5", "int: 2", "int: 3", "double: 2.0"], "int: 2", "In Java, when both operands of a division operator are integers, integer division is performed, truncating the fractional part towards zero. The result is 2."),
                ("rule_1", "Integer Division", "easy", "What is the evaluated type and value of this expression?", "7 / -3", ["int: -2", "double: -2.33", "int: -3", "double: -2.0"], "int: -2", "Integer division truncates the fractional part towards zero. Thus, 7 / -3 yields -2."),
                ("rule_1", "Integer Division", "medium", "What does this print?", "System.out.println(15 / 4);", ["3", "3.75", "4", "3.0"], "3", "Both 15 and 4 are integer literals, so integer division is performed, discarding the remainder. 15 / 4 evaluates to 3, and println prints 3."),
                ("rule_1", "Integer Division", "medium", "What does this print?", "System.out.println(-11 / 2);", ["-5", "-5.5", "-6", "-5.0"], "-5", "Integer division truncates towards zero. So -11 / 2 evaluates to -5."),
                ("rule_1", "Integer Division", "hard", "What does this print?", "int x = 10; int y = 3; System.out.println(x / y + x % y);", ["4", "4.33", "3", "5"], "4", "Evaluation order: x / y evaluates to 10 / 3 = 3. Then x % y evaluates to 10 % 3 = 1. Finally, 3 + 1 = 4."),
                ("rule_1", "Integer Division", "hard", "What does this print?", "int result = 50 / 3 / 2; System.out.println(result);", ["8", "8.33", "8.0", "16"], "8", "Division is left-associative. First, 50 / 3 evaluates to 16. Then, 16 / 2 evaluates to 8."),

                # Rule 2: String Concatenation Left-to-Right
                ("rule_2", "String Concatenation", "easy", "What is the result type and value of this expression in Java?", "\"Score: \" + 3 + 4", ["String: \"Score: 7\"", "String: \"Score: 34\"", "int: 7", "Compilation Error"], "String: \"Score: 34\"", "String concatenation (+) is evaluated from left to right. First \"Score: \" + 3 is \"Score: 3\", which is then concatenated with 4 to yield \"Score: 34\"."),
                ("rule_2", "String Concatenation", "easy", "What is the result type and value of this expression in Java?", "3 + 4 + \" Score\"", ["String: \"7 Score\"", "String: \"34 Score\"", "String: \"3 + 4 Score\"", "Compilation Error"], "String: \"7 Score\"", "Evaluated left-to-right. 3 + 4 is numeric addition (7), which is then concatenated with \" Score\", yielding \"7 Score\"."),
                ("rule_2", "String Concatenation", "medium", "What does this print?", "System.out.println(\"PPT\" + 1 + 1);", ["PPT11", "PPT2", "PPT1", "Compilation Error"], "PPT11", "Evaluated left-to-right. \"PPT\" + 1 is \"PPT1\". Then \"PPT1\" + 1 evaluates to \"PPT11\"."),
                ("rule_2", "String Concatenation", "medium", "What does this print?", "System.out.println(1 + 2 + \"XY\" + 3 + 4);", ["3XY34", "12XY34", "3XY7", "12XY7"], "3XY34", "1 + 2 evaluates to numeric 3. Then 3 + \"XY\" is \"3XY\". Then \"3XY\" + 3 is \"3XY3\", and \"3XY3\" + 4 is \"3XY34\"."),
                ("rule_2", "String Concatenation", "hard", "What does this print?", "System.out.println(\"Result: \" + 10 / 2 + 3);", ["Result: 53", "Result: 8", "Result: 5.03", "Compilation Error"], "Result: 53", "Division (/) has higher precedence than concatenation (+). So 10 / 2 is evaluated first, yielding 5. Then \"Result: \" + 5 is \"Result: 5\", and \"Result: 5\" + 3 is \"Result: 53\"."),
                ("rule_2", "String Concatenation", "hard", "What does this print?", "int m = 1; System.out.println(\"PPT\" + (m + 1));", ["PPT2", "PPT11", "PPT1", "Compilation Error"], "PPT2", "Parentheses have the highest precedence. Therefore, (m + 1) is evaluated first to 2. The string \"PPT\" is then concatenated with 2, yielding \"PPT2\"."),

                # Rule 3: Char Arithmetic Promotion
                ("rule_3", "Char Arithmetic", "easy", "What is the evaluated type and value of the printed expression?", "char ch = 'A'; System.out.println(ch + 5);", ["int: 70", "char: 'F'", "String: \"A5\"", "Compilation Error"], "int: 70", "When a char is an operand of a binary arithmetic operator (+), it undergoes numeric promotion to int. The ASCII code for 'A' is 65, so 65 + 5 evaluates to the integer 70."),
                ("rule_3", "Char Arithmetic", "easy", "What is the evaluated type and value of the printed expression?", "char c1 = 'B'; char c2 = 'A'; System.out.println(c1 - c2);", ["int: 1", "char: 'A'", "int: 66", "Compilation Error"], "int: 1", "Both char operands are promoted to int before subtraction. The ASCII values are 'B' = 66 and 'A' = 65. Thus, 66 - 65 evaluates to 1 of type int."),
                ("rule_3", "Char Arithmetic", "medium", "What does this print?", "System.out.println('a' + 2);", ["99", "c", "a2", "97"], "99", "The character 'a' has an ASCII code of 97. It is promoted to int for the addition. 97 + 2 is 99, which is printed as a numeric value."),
                ("rule_3", "Char Arithmetic", "medium", "What does this print?", "char c = 'A'; System.out.println((char)(c + 32));", ["a", "97", "A32", "Compilation Error"], "a", "The expression c + 32 evaluates to 65 + 32 = 97 (an integer). The explicit cast (char) converts 97 back to its char representation, which is 'a'."),
                ("rule_3", "Char Arithmetic", "hard", "What does this print?", "char c = 'A'; System.out.println(c + c);", ["130", "AA", "A", "Compilation Error"], "130", "Both operands of the binary addition are char variables, so both are promoted to int. The calculation is 65 + 65, which yields 130."),
                ("rule_3", "Char Arithmetic", "hard", "What does this print?", "int val = '0' + 9; System.out.println(val);", ["57", "9", "48", "09"], "57", "The character '0' has an ASCII code of 48. Thus, '0' + 9 is evaluated as 48 + 9 = 57."),

                # Rule 4: Widening (Type Promotion)
                ("rule_4", "Widening", "easy", "What is the evaluated type and value of this expression?", "5 / 2.0", ["double: 2.5", "int: 2", "double: 2.0", "float: 2.5"], "double: 2.5", "When mixing int (5) and double (2.0), the int is automatically promoted to double. 5.0 / 2.0 yields double 2.5."),
                ("rule_4", "Widening", "easy", "What is the evaluated type and value of this expression?", "3 * 1.5", ["double: 4.5", "float: 4.5", "int: 4", "double: 4.0"], "double: 4.5", "The int 3 is promoted to double 3.0. 3.0 * 1.5 evaluates to double 4.5."),
                ("rule_4", "Widening", "medium", "What does this print?", "double val = 5 / 2.0 + 3 / 2; System.out.println(val);", ["3.5", "3.0", "4.0", "3"], "3.5", "5 / 2.0 performs double division (yielding 2.5). 3 / 2 performs integer division (yielding 1). Adding them yields 2.5 + 1.0 = 3.5, which is assigned to double variable val."),
                ("rule_4", "Widening", "medium", "What does this print?", "double m = Math.round(2.33) + Math.sqrt(64); System.out.println(m);", ["10.0", "10", "10L", "8.0"], "10.0", "Math.round(2.33) returns the long value 2L. Math.sqrt(64) returns the double value 8.0. When adding them, 2L is promoted to double 2.0, yielding double 10.0."),
                ("rule_4", "Widening", "hard", "What does this print?", "System.out.println(5 / 2 * 2.0);", ["4.0", "5.0", "4", "5"], "4.0", "Left-to-right evaluation. 5 / 2 is integer division, evaluating to 2. Then 2 * 2.0 promotes 2 to double and yields double 4.0."),
                ("rule_4", "Widening", "hard", "What does this print?", "double res = 7 / 2 + 1.5; System.out.println(res);", ["4.5", "5.0", "4.0", "3.5"], "4.5", "7 / 2 is integer division evaluating to 3. Then 3 + 1.5 is double addition evaluating to 4.5."),

                # Rule 5: Explicit Casting Truncation
                ("rule_5", "Casting", "easy", "What is the evaluated type and value after explicit casting?", "(int) 3.9", ["int: 3", "int: 4", "double: 3.0", "Compilation Error"], "int: 3", "Casting a double to int truncates the decimal part (does not round), yielding int 3."),
                ("rule_5", "Casting", "easy", "What is the evaluated type and value after casting?", "(char) 66", ["char: 'B'", "int: 66", "String: \"B\"", "Compilation Error"], "char: 'B'", "Casting the integer 66 to char yields the Unicode character at code point 66, which is 'B'."),
                ("rule_5", "Casting", "medium", "What does this print?", "System.out.println((int) -4.8);", ["-4", "-5", "-4.0", "-4.8"], "-4", "Truncation discards the fractional part towards zero. So -4.8 becomes -4."),
                ("rule_5", "Casting", "medium", "What does this print?", "double m = (int)Math.sqrt(2.33) + Math.round(64); System.out.println(m);", ["65.0", "65", "66.0", "Compilation Error"], "65.0", "Math.sqrt(2.33) is approx 1.526. Casting to (int) yields 1. Math.round(64) yields long 64L. 1 + 64L = 65L (long), which is widened to 65.0 when assigned to double m."),
                ("rule_5", "Casting", "hard", "What does this print?", "double x = 9.8; int y = (int) x + 2; System.out.println(y);", ["11", "11.8", "12", "9"], "11", "Cast operator has high precedence. (int)x is evaluated first, converting 9.8 to int 9. Then 9 + 2 = 11."),
                ("rule_5", "Casting", "hard", "What does this print?", "System.out.println((int) 5.5 / 2.0);", ["2.5", "2.0", "2", "3.0"], "2.5", "(int)5.5 converts to int 5. Then 5 / 2.0 is double division evaluating to 2.5."),

                # Rule 6: Compound Expressions & Precedence
                ("rule_6", "Compound Expressions", "easy", "What does this evaluate to?", "\"A\" + (3 + 4)", ["String: \"A7\"", "String: \"A34\"", "String: \"A3+4\"", "Compilation Error"], "String: \"A7\"", "Parentheses have the highest precedence. 3 + 4 is evaluated first to 7. Then \"A\" + 7 is \"A7\"."),
                ("rule_6", "Compound Expressions", "easy", "What does this evaluate to?", "\"Result: \" + (5 > 3)", ["String: \"Result: true\"", "String: \"Result: false\"", "String: \"Result: 5>3\"", "Compilation Error"], "String: \"Result: true\"", "The comparison 5 > 3 is evaluated first in parentheses, yielding boolean true. Concatenation yields \"Result: true\"."),
                ("rule_6", "Compound Expressions", "medium", "What does this print?", "System.out.println(\"X: \" + 5 * 2);", ["X: 10", "X: 52", "X: 5 * 2", "Compilation Error"], "X: 10", "Multiplication (*) has higher precedence than concatenation (+), so 5 * 2 evaluates to 10 first. Then \"X: \" + 10 evaluates to \"X: 10\"."),
                ("rule_6", "Compound Expressions", "medium", "What does this print?", "int c = (3 < 4) ? 3 * 4 : 3 + 4; System.out.println(c);", ["12", "7", "true", "Compilation Error"], "12", "The ternary condition 3 < 4 evaluates to true, so the first expression 3 * 4 is evaluated, yielding 12."),
                ("rule_6", "Compound Expressions", "hard", "What does this print?", "System.out.println(\"X: \" + (5 + 3) + \" Y: \" + 5 + 3);", ["X: 8 Y: 53", "X: 8 Y: 8", "X: 53 Y: 53", "X: 53 Y: 8"], "X: 8 Y: 53", "\"X: \" + (5 + 3) evaluates to \"X: 8\". Then \"X: 8\" + \" Y: \" is \"X: 8 Y: \". Then concatenated with 5 is \"X: 8 Y: 5\". Then concatenated with 3 is \"X: 8 Y: 53\"."),
                ("rule_6", "Compound Expressions", "hard", "What does this print?", "System.out.println(2 + 4 * 1 / 2 % 5 - 33 + 1 / 2 / 3 * 4);", ["-29", "0", "-27", "-31"], "-29", "Multiplicative operators (*, /, %) evaluate first left-to-right, then additive operators (+, -). In this expression, 4 * 1 / 2 % 5 evaluates to 2. 1 / 2 / 3 * 4 evaluates to 0 due to integer division (1 / 2 = 0). Finally, 2 + 2 - 33 + 0 = -29.")
            ]

            for sub_type, ch_title, diff, question_text, expr, opts, ans, exp in tc_questions_data:
                q = Question(
                    track=track,
                    chapter_title=ch_title,
                    difficulty=diff,
                    type="type_confusion",
                    sub_type=sub_type,
                    content={
                        "expression": expr,
                        "options": opts,
                        "question": question_text
                    },
                    correct_answer=ans,
                    explanation=exp
                )
                db.add(q)
            db.commit()

            # 2. Flashcard Questions
            f1 = Question(
                track=track,
                chapter_title="Chapter 1: Introduction to Java",
                type="flashcard",
                content={
                    "front": "What is the difference between == and .equals() in Java?",
                    "back": "== compares references (memory locations), while .equals() compares the actual values inside the objects."
                },
                correct_answer="N/A",
                explanation="Use == for primitive data types and reference equality. Use .equals() to check if two objects contain the same data."
            )

            f2 = Question(
                track=track,
                chapter_title="Chapter 4: Decision Making (Selection)",
                type="flashcard",
                content={
                    "front": "How many times is a do-while loop guaranteed to run?",
                    "back": "At least once, because the loop condition is evaluated at the bottom after the code body executes."
                },
                correct_answer="N/A",
                explanation="A while loop checks condition first (may run 0 times). A do-while checks condition last (always runs at least 1 time)."
            )

            f3 = Question(
                track=track,
                chapter_title="Chapter 2: Variables & Data Types",
                type="flashcard",
                content={
                    "front": "What is a wrapper class in Java?",
                    "back": "A class that wraps a primitive data type into an object (e.g. Integer wraps int, Double wraps double)."
                },
                correct_answer="N/A",
                explanation="Wrapper classes allow primitives to be used in collection structures like ArrayLists which only support objects."
            )

            f4 = Question(
                track=track,
                chapter_title="Chapter 5: User-Defined Methods",
                type="flashcard",
                content={
                    "front": "What is constructor overloading in Java?",
                    "back": "Defining multiple constructors in the same class, each having a different parameter list (different number, types, or order of parameters)."
                },
                correct_answer="N/A",
                explanation="Constructor overloading allows initializing objects in different ways depending on the arguments passed to 'new'."
            )

            f5 = Question(
                track=track,
                chapter_title="Chapter 2: Variables & Data Types",
                type="flashcard",
                content={
                    "front": "What is the difference between instance and local variables?",
                    "back": "Instance variables belong to a class instance and get default values. Local variables are declared in a method and must be initialized before use."
                },
                correct_answer="N/A",
                explanation="Local variables do not have default values in Java. Accessing an uninitialized local variable triggers a compilation error."
            )

            db.add_all([f1, f2, f3, f4, f5])

            # 3. Predict the Output Questions
            if track == "ICSE9":
                questions_data = [
                    # Chapter 4: Values & Data Types (10 questions)
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        char ch = 'A';
        System.out.println(ch + 5);
    }
}""", "70", "When a char is the operand of a binary arithmetic operator (+), it undergoes numeric promotion to an int. The ASCII value of 'A' is 65, so 65 + 5 evaluates to 70."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        double d = 10.58;
        int i = (int) d;
        System.out.println(i);
    }
}""", "10", "Casting a double to an int truncates the fractional part, keeping only the integer portion (10)."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        System.out.println("Path: C:\\\\\"Java\"");
    }
}""", "Path: C:\\\"Java\"", "Double backslashes '\\\\' represent a single backslash, and '\\\"' represents a double quote in Java."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        char c1 = 'B';
        char c2 = 'A';
        System.out.println(c1 - c2);
    }
}""", "1", "Chars undergo numeric promotion to int during arithmetic operations. The ASCII value of 'B' is 66 and 'A' is 65, so 66 - 65 evaluates to 1."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        float a = 7.5f;
        int b = 2;
        System.out.println(a / b);
    }
}""", "3.75", "Division of a float by an int results in a float value. 7.5 / 2 = 3.75."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        int x = 15;
        double y = 4;
        System.out.println(x / y);
    }
}""", "3.75", "An int divided by a double results in a double value. 15 / 4.0 = 3.75."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        int ascii = 98;
        char ch = (char) ascii;
        System.out.println(ch);
    }
}""", "b", "Casting the integer 98 to a char yields the Unicode character at position 98, which is 'b' (since 'a' is 97)."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        byte b = 50;
        b = (byte)(b * 2);
        System.out.println(b);
    }
}""", "100", "The expression b * 2 promotes to an int. Explicit casting back to byte stores 100."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        double val = 5 / 2.0 + 3 / 2;
        System.out.println(val);
    }
}""", "3.5", "5 / 2.0 is evaluated using double division yielding 2.5. 3 / 2 is integer division yielding 1. 2.5 + 1 = 3.5."),
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        boolean status = (10 >= 10);
        System.out.println(status);
    }
}""", "true", "The relational operator >= checks if 10 is greater than or equal to 10, which evaluates to true."),

                    # Chapter 5: Operators & Expressions (10 questions)
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int a = 5;
        int b = ++a + a++;
        System.out.println(a + " " + b);
    }
}""", "7 12", "++a increments a to 6 and returns 6. Then a++ returns 6 and increments a to 7. So b = 6 + 6 = 12, and a is 7."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int x = 4;
        int y = --x * x++;
        System.out.println(x + " " + y);
    }
}""", "4 9", "--x decrements x to 3 and returns 3. Then x++ returns 3 and increments x back to 4. y = 3 * 3 = 9, and x is 4."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int a = 12, b = 8;
        int result = (a > b) ? (a - b) : (b - a);
        System.out.println(result);
    }
}""", "4", "Since a > b (12 > 8) is true, the ternary operator evaluates the first expression: a - b = 12 - 8 = 4."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int res = 10 + 5 % 3 * 4;
        System.out.println(res);
    }
}""", "18", "Modulo (%) and multiplication (*) have higher precedence than addition (+), and are evaluated left-to-right. 5 % 3 = 2. 2 * 4 = 8. 10 + 8 = 18."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int a = 10, b = 20;
        boolean test = (a > 15) && (++b > 20);
        System.out.println(b + " " + test);
    }
}""", "20 false", "Since (a > 15) is false, the short-circuit AND (&&) operator does not evaluate the second operand, so b remains 20."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int a = 10, b = 20;
        boolean test = (a < 15) || (++b > 20);
        System.out.println(b + " " + test);
    }
}""", "20 true", "Since (a < 15) is true, the short-circuit OR (||) operator does not evaluate the second operand, so b remains 20."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int x = 5;
        x += x++ * ++x;
        System.out.println(x);
    }
}""", "40", "x += x++ * ++x becomes x = x + (x++ * ++x). First LHS x is evaluated to 5. Then RHS: x++ returns 5 (x becomes 6), ++x increments x to 7 and returns 7. RHS is 5 * 7 = 35. Total is 5 + 35 = 40."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x > 3 ? (x < 10 ? 20 : 30) : 40;
        System.out.println(y);
    }
}""", "20", "x > 3 (5 > 3) is true, so the nested ternary is evaluated. x < 10 (5 < 10) is true, so it yields 20."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        boolean p = true, q = false;
        System.out.println((p || q) + " " + (p && q));
    }
}""", "true false", "p || q is true since p is true. p && q is false since q is false."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        int m = 12;
        int n = m-- - --m;
        System.out.println(m + " " + n);
    }
}""", "10 2", "m-- returns 12 (m becomes 11). Then --m decrements m to 10 and returns 10. n = 12 - 10 = 2, and m is 10."),

                    # Chapter 7: Math Library Functions (10 questions)
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.ceil(-4.2) + " " + Math.floor(-4.2));
    }
}""", "-4.0 -5.0", "Math.ceil(-4.2) rounds towards positive infinity yielding -4.0. Math.floor(-4.2) rounds towards negative infinity yielding -5.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.round(2.5) + " " + Math.round(-2.5));
    }
}""", "3 -2", "Math.round(2.5) rounds up to 3. Math.round(-2.5) rounds towards positive infinity to -2."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2)));
    }
}""", "5.0", "3^2 + 4^2 = 9 + 16 = 25. Math.sqrt(25.0) returns the double 5.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.max(5.5, 6));
    }
}""", "6.0", "Math.max(double, double) promotes the int 6 to double 6.0 and returns 6.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.abs(-15.6) + Math.abs(5));
    }
}""", "20.6", "Math.abs(-15.6) is 15.6, and Math.abs(5) is 5. 15.6 + 5 = 20.6."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.pow(4, 0.5));
    }
}""", "2.0", "Math.pow(4, 0.5) calculates the square root of 4, returning the double value 2.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.sqrt(Math.ceil(8.1)));
    }
}""", "3.0", "Math.ceil(8.1) returns 9.0. Then Math.sqrt(9.0) returns 3.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.round(3.49));
    }
}""", "3", "Math.round(3.49) rounds to the nearest integer, which is 3."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.floor(5.9) + " " + Math.floor(-5.9));
    }
}""", "5.0 -6.0", "Math.floor(5.9) returns 5.0, and Math.floor(-5.9) rounds down to -6.0."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println(Math.ceil(2.1) + " " + Math.ceil(-2.1));
    }
}""", "3.0 -2.0", "Math.ceil(2.1) rounds up to 3.0, and Math.ceil(-2.1) rounds up to -2.0."),

                    # Chapter 8: Conditional Constructs (10 questions)
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 2;
        switch(x) {
            case 1: System.out.print("One ");
            case 2: System.out.print("Two ");
            case 3: System.out.print("Three ");
                break;
            default: System.out.print("Default");
        }
    }
}""", "Two Three ", "x is 2. The switch jumps to case 2 printing 'Two '. Since there is no break, it falls through to case 3 printing 'Three ' and then breaks."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int choice = 5;
        switch(choice) {
            default: System.out.print("Default ");
            case 1: System.out.print("One ");
                break;
            case 2: System.out.print("Two");
        }
    }
}""", "Default One ", "choice is 5. Since no case matches, it jumps to default, printing 'Default '. With no break, it falls through to case 1 printing 'One ' and then breaks."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int a = 10, b = 15;
        if (a > 5) {
            if (b < 10)
                System.out.println("X");
            else
                System.out.println("Y");
        } else {
            System.out.println("Z");
        }
    }
}""", "Y", "a > 5 (10 > 5) is true, entering the outer block. b < 10 (15 < 10) is false, so it prints the inner else branch: 'Y'."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 5;
        if (x > 10)
            System.out.print("A ");
            System.out.print("B ");
    }
}""", "B ", "Without curly braces, only the first print is bound to the if statement. The second print 'B ' runs unconditionally."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        char grade = 'B';
        switch(grade) {
            case 'A': System.out.print("Excellent"); break;
            case 'B':
            case 'C': System.out.print("Pass"); break;
            default: System.out.print("Fail");
        }
    }
}""", "Pass", "grade is 'B'. case 'B' matches and falls through to case 'C', printing 'Pass' and then breaking."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int temp = 30;
        boolean raining = true;
        if (temp > 25 && !raining) {
            System.out.println("Go out");
        } else if (temp > 25 && raining) {
            System.out.println("Stay in");
        } else {
            System.out.println("Sleeping");
        }
    }
}""", "Stay in", "temp > 25 is true and raining is true, satisfying the else-if condition and printing 'Stay in'."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 5, y = 20;
        if (x > 10)
            if (y > 10)
                System.out.println("A");
            else
                System.out.println("B");
        System.out.println("C");
    }
}""", "C", "x > 10 is false, so the outer if statement is skipped completely, and only 'C' is printed."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        int n = 1;
        int val = 0;
        switch(n) {
            case 1:
                val += 10;
            case 2:
                val += 20;
                break;
            default:
                val += 30;
        }
        System.out.println(val);
    }
}""", "30", "n is 1. case 1 matches adding 10 to val, then falls through to case 2 adding 20, breaking there. 10 + 20 = 30."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        boolean isChecked = false;
        if (isChecked = true) {
            System.out.println("Checked");
        } else {
            System.out.println("Unchecked");
        }
    }
}""", "Checked", "The assignment operator '=' assigns true to isChecked, and the entire expression evaluates to true, triggering the first block."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        double x = 0.1 + 0.2;
        if (x == 0.3) {
            System.out.println("Equal");
        } else {
            System.out.println("Not Equal");
        }
    }
}""", "Not Equal", "Due to binary floating-point precision, 0.1 + 0.2 evaluates to 0.30000000000000004, which is not exactly equal to 0.3."),

                    # Chapter 9: Iterative Constructs (10 questions)
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 5; i += 2) {
            System.out.print(i + " ");
        }
    }
}""", "0 2 4 ", "The loop runs for i = 0, 2, and 4. When i becomes 6, it terminates."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 1;
        while (x++ < 3) {
            System.out.print(x + " ");
        }
    }
}""", "2 3 ", "x=1: 1 < 3 is true, x becomes 2, prints '2 '. x=2: 2 < 3 is true, x becomes 3, prints '3 '. x=3: 3 < 3 is false, loop exits."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 5;
        do {
            System.out.print(x + " ");
            x--;
        } while (x > 5);
    }
}""", "5 ", "do-while loops run the body first. Prints 5, decrements x to 4, condition 4 > 5 is false, exiting loop."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 4; i++) {
            if (i == 2) continue;
            System.out.print(i + " ");
        }
    }
}""", "1 3 4 ", "When i is 2, the continue statement skips the print statement and proceeds to the next iteration."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            if (i == 3) break;
            System.out.print(i + " ");
        }
    }
}""", "1 2 ", "When i is 3, the break statement terminates the loop execution."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int i;
        for (i = 0; i < 3; i++);
        System.out.println(i);
    }
}""", "3", "The semicolon at the end of the loop header makes the loop body empty. After iterating, i is 3 when the loop terminates."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int count = 1;
        for (;;) {
            if (count > 3) break;
            System.out.print(count + " ");
            count++;
        }
    }
}""", "1 2 3 ", "An infinite loop that prints count, incrementing it until it exceeds 3 and breaks."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        for (int i = 5; i > 1; i -= 2) {
            System.out.print(i + " ");
        }
    }
}""", "5 3 ", "The loop runs for i = 5, then decrements by 2 to i = 3. Next decrement yields 1, which is not > 1, so the loop terminates."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int x = 0;
        while (x < 5) {
            x++;
            if (x == 3) continue;
            System.out.print(x + " ");
        }
    }
}""", "1 2 4 5 ", "x increments first in loop. When x is 3, it skips printing. Output is 1 2 4 5."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        int k = 3;
        do {
            System.out.print(++k + " ");
        } while (k < 5);
    }
}""", "4 5 ", "First iteration: ++k makes k=4, prints '4 ', checks 4 < 5 (true). Second iteration: ++k makes k=5, prints '5 ', checks 5 < 5 (false), loop exits."),

                    # Chapter 10: Nested Loops (10 questions)
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 2; i++) {
            for (int j = 1; j <= 2; j++) {
                System.out.print(i + "" + j + " ");
            }
        }
    }
}""", "11 12 21 22 ", "Outer loop runs twice, inner loop runs twice per outer loop. Prints current i concatenated with j."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.print(" ");
        }
    }
}""", "1 12 123 ", "Inner loop limit depends on outer loop counter i, printing a triangular sequence."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 3; i >= 1; i--) {
            for (int j = 1; j <= i; j++) {
                System.out.print(i);
            }
        }
    }
}""", "333221", "Outer loop decrements. Prints i repeated i times: 3 repeated 3 times, then 2 repeated 2 times, then 1 repeated once."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 2; i++) {
            for (int j = 1; j <= 3; j++) {
                sum += i * j;
            }
        }
        System.out.println(sum);
    }
}""", "18", "Accumulates i * j for i in [1,2] and j in [1,2,3]. (1*1+1*2+1*3) + (2*1+2*2+2*3) = 6 + 12 = 18."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 3; j >= i; j--) {
                System.out.print("*");
            }
            System.out.print(" ");
        }
    }
}""", "*** ** * ", "Prints a inverted triangular pattern of stars separated by spaces."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            if (i == 2) continue;
            for (int j = 1; j <= 2; j++) {
                System.out.print(i + "" + j + " ");
            }
        }
    }
}""", "11 12 31 32 ", "When i is 2, the continue statement skips the entire inner loop execution for that iteration."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 2; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) break;
                System.out.print(i + "" + j + " ");
            }
        }
    }
}""", "11 21 ", "When j reaches 2, the inner loop breaks, returning control to the outer loop. Thus, only j=1 is printed for each outer loop iteration."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        int i = 1;
        while (i <= 2) {
            int j = 1;
            while (j <= 2) {
                System.out.print((i + j) + " ");
                j++;
            }
            i++;
        }
    }
}""", "2 3 3 4 ", "Nested while loops evaluating (i + j). i=1: (1+1) and (1+2). i=2: (2+1) and (2+2)."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        outer: for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (i == 2) break outer;
                System.out.print(i + "" + j + " ");
            }
        }
    }
}""", "11 12 13 ", "When i reaches 2, the labeled 'break outer' statement terminates both outer and inner loops completely."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 2; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print((i * j) + " ");
            }
        }
    }
}""", "1 2 4 ", "Multiplication table snippet. i=1, j=1: '1 '. i=2, j=1,2: '2 4 '. Combined: '1 2 4 '.")
                ]
            else:
                # Placeholder chapters for ICSE10 and APCSA (2 questions per chapter)
                questions_data = [
                    (4, "Ch 4: Values & Data Types", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 4);
    }
}""", "Placeholder 4", "Placeholder question for chapter 4."),
                    (5, "Ch 5: Operators & Expressions", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 5);
    }
}""", "Placeholder 5", "Placeholder question for chapter 5."),
                    (7, "Ch 7: Math Library Functions", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 7);
    }
}""", "Placeholder 7", "Placeholder question for chapter 7."),
                    (8, "Ch 8: Conditional Constructs", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 8);
    }
}""", "Placeholder 8", "Placeholder question for chapter 8."),
                    (9, "Ch 9: Iterative Constructs", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 9);
    }
}""", "Placeholder 9", "Placeholder question for chapter 9."),
                    (10, "Ch 10: Nested Loops", """public class Main {
    public static void main(String[] args) {
        System.out.println("Placeholder " + 10);
    }
}""", "Placeholder 10", "Placeholder question for chapter 10.")
                ]

            for ch_num, ch_title, code, ans, exp in questions_data:
                q = Question(
                    track=track,
                    chapter_number=ch_num,
                    chapter_title=ch_title,
                    difficulty="medium",
                    type="predict_output",
                    content={
                        "code": code,
                        "question": "Predict the exact printed output of this program."
                    },
                    correct_answer=ans,
                    explanation=exp
                )
                db.add(q)
            db.commit()

            # 4. Trace Visualizer Questions
            trace_q1 = Question(
                track=track,
                chapter_title="Chapter 4: Decision Making (Selection)",
                type="trace-visualizer",
                content={
                    "title": "Arrays & Loops Step-Through",
                    "description": "Step through a for-loop accumulating numbers to understand variable scoping."
                },
                correct_answer="6",
                explanation="The loop executes 3 times for i=1, 2, and 3, accumulating the sum as 1 + 2 + 3 = 6."
            )
            db.add(trace_q1)
            db.commit()

            trace_code1 = """public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
            sum += i;
        }
        System.out.println(sum);
    }
}"""
            
            steps1 = [
                {
                    "lineNumber": 3,
                    "variables": {
                        "sum": {"value": "0", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Initialized variable sum to 0."
                },
                {
                    "lineNumber": 4,
                    "variables": {
                        "sum": {"value": "0", "type": "int", "changed": False},
                        "i": {"value": "1", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Loop starts. Initialized counter i to 1."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "sum": {"value": "1", "type": "int", "changed": True},
                        "i": {"value": "1", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Added i (1) to sum. sum is now 1."
                },
                {
                    "lineNumber": 4,
                    "variables": {
                        "sum": {"value": "1", "type": "int", "changed": False},
                        "i": {"value": "2", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 2. Checking loop condition (2 <= 3): true."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "sum": {"value": "3", "type": "int", "changed": True},
                        "i": {"value": "2", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Added i (2) to sum. sum is now 3."
                },
                {
                    "lineNumber": 4,
                    "variables": {
                        "sum": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "3", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 3. Checking loop condition (3 <= 3): true."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "sum": {"value": "6", "type": "int", "changed": True},
                        "i": {"value": "3", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Added i (3) to sum. sum is now 6."
                },
                {
                    "lineNumber": 4,
                    "variables": {
                        "sum": {"value": "6", "type": "int", "changed": False},
                        "i": {"value": "4", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 4. Checking loop condition (4 <= 3): false. Exiting loop."
                },
                {
                    "lineNumber": 7,
                    "variables": {
                        "sum": {"value": "6", "type": "int", "changed": False}
                    },
                    "output": "6\n",
                    "narration": "Prints the final value of sum: 6."
                }
            ]

            trace_data1 = Trace(
                question_id=trace_q1.id,
                code=trace_code1,
                steps=steps1,
                final_output="6\n"
            )
            db.add(trace_data1)
            db.commit()

            # Trace Question 2: Factorial Trace
            trace_q2 = Question(
                track=track,
                chapter_title="Chapter 4: Decision Making (Selection)",
                type="trace-visualizer",
                content={
                    "title": "Factorial Calculation Trace",
                    "description": "Step through a for-loop calculating the factorial of 3."
                },
                correct_answer="6",
                explanation="The factorial of 3 (3!) is 1 * 2 * 3 = 6."
            )
            db.add(trace_q2)
            db.commit()

            trace_code2 = """public class Factorial {
    public static void main(String[] args) {
        int fact = 1;
        int n = 3;
        for (int i = 1; i <= n; i++) {
            fact = fact * i;
        }
        System.out.println(fact);
    }
}"""

            steps2 = [
                {
                    "lineNumber": 3,
                    "variables": {
                        "fact": {"value": "1", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Initialized variable fact to 1."
                },
                {
                    "lineNumber": 4,
                    "variables": {
                        "fact": {"value": "1", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Initialized target limit n to 3."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "fact": {"value": "1", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "1", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Loop starts. Initialized counter i to 1."
                },
                {
                    "lineNumber": 6,
                    "variables": {
                        "fact": {"value": "1", "type": "int", "changed": True},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "1", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Multiplied fact by i. fact is now 1 * 1 = 1."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "fact": {"value": "1", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "2", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 2. Loop condition (2 <= 3) is true."
                },
                {
                    "lineNumber": 6,
                    "variables": {
                        "fact": {"value": "2", "type": "int", "changed": True},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "2", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Multiplied fact by i. fact is now 1 * 2 = 2."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "fact": {"value": "2", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "3", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 3. Loop condition (3 <= 3) is true."
                },
                {
                    "lineNumber": 6,
                    "variables": {
                        "fact": {"value": "6", "type": "int", "changed": True},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "3", "type": "int", "changed": False}
                    },
                    "output": "",
                    "narration": "Multiplied fact by i. fact is now 2 * 3 = 6."
                },
                {
                    "lineNumber": 5,
                    "variables": {
                        "fact": {"value": "6", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": False},
                        "i": {"value": "4", "type": "int", "changed": True}
                    },
                    "output": "",
                    "narration": "Incremented i to 4. Loop condition (4 <= 3) is false. Exited loop."
                },
                {
                    "lineNumber": 8,
                    "variables": {
                        "fact": {"value": "6", "type": "int", "changed": False},
                        "n": {"value": "3", "type": "int", "changed": False}
                    },
                    "output": "6\n",
                    "narration": "Prints the final value of fact: 6."
                }
            ]

            trace_data2 = Trace(
                question_id=trace_q2.id,
                code=trace_code2,
                steps=steps2,
                final_output="6\n"
            )
            db.add(trace_data2)
            db.commit()

        print("Database seeded successfully with rich, track-scoped questions and debugger traces!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
