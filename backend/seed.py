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
            tc_q1 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "\"Score: \" + 3 + 4",
                    "options": [
                        "String: \"Score: 7\"",
                        "String: \"Score: 34\"",
                        "int: 7",
                        "Compilation Error"
                    ],
                    "question": "What is the result type and value of this expression in Java?"
                },
                correct_answer="String: \"Score: 34\"",
                explanation="String concatenation is evaluated from left to right. First 'Score: ' + 3 results in 'Score: 3', and then 'Score: 3' + 4 results in 'Score: 34'."
            )

            tc_q2 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "5 / 2",
                    "options": [
                        "double: 2.5",
                        "int: 2",
                        "int: 3",
                        "Compilation Error"
                    ],
                    "question": "What is the evaluated type and value of this division?"
                },
                correct_answer="int: 2",
                explanation="Both operands are integers, so integer division is performed, truncating the fractional part. The result is 2."
            )

            tc_q3 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "(double) (5 / 2)",
                    "options": [
                        "double: 2.5",
                        "double: 2.0",
                        "int: 2",
                        "double: 0.0"
                    ],
                    "question": "What is the value after type casting the expression?"
                },
                correct_answer="double: 2.0",
                explanation="The integer division (5 / 2) is evaluated first resulting in 2. Casting that integer to double yields 2.0."
            )

            tc_q4 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "'A' + 1",
                    "options": [
                        "char: 'B'",
                        "int: 66",
                        "String: \"A1\"",
                        "Compilation Error"
                    ],
                    "question": "What is the result of char arithmetic in Java?"
                },
                correct_answer="int: 66",
                explanation="Chars promote to integers when mixed with numeric operators. The ASCII value of 'A' is 65, so 65 + 1 evaluates to integer 66."
            )

            tc_q5 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "4 + 5 + \" = sum\"",
                    "options": [
                        "String: \"9 = sum\"",
                        "String: \"45 = sum\"",
                        "int: 9",
                        "Compilation Error"
                    ],
                    "question": "What is the result type and value of this expression?"
                },
                correct_answer="String: \"9 = sum\"",
                explanation="Evaluated left-to-right. 4 + 5 is numeric addition (9), which is then concatenated with the string ' = sum' resulting in '9 = sum'."
            )

            tc_q6 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "(int) 7.9",
                    "options": [
                        "int: 7",
                        "int: 8",
                        "double: 7.0",
                        "Compilation Error"
                    ],
                    "question": "What is the evaluated value of casting a double literal to an int?"
                },
                correct_answer="int: 7",
                explanation="Casting a double to an int truncates the fractional part (does not round), yielding the integer value 7."
            )

            tc_q7 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="type_confusion",
                content={
                    "expression": "1.5 + 3 / 2",
                    "options": [
                        "double: 3.0",
                        "double: 2.5",
                        "int: 2",
                        "double: 2.0"
                    ],
                    "question": "Evaluate this expression respecting operator precedence."
                },
                correct_answer="double: 2.5",
                explanation="Division has higher precedence than addition. 3 / 2 is integer division evaluating to 1. Then, 1.5 + 1 is promoted to double addition, yielding 2.5."
            )

            db.add_all([tc_q1, tc_q2, tc_q3, tc_q4, tc_q5, tc_q6, tc_q7])

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
            p1 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="predict_output",
                content={
                    "code": """public class DivisionTest {
    public static void main(String[] args) {
        int a = 5;
        int b = 2;
        double c = a / b;
        System.out.println(c);
    }
}""",
                    "question": "Predict the exact printed output of this program."
                },
                correct_answer="2.0",
                explanation="c is calculated by integer division 5 / 2 = 2. When stored in double c, it is promoted to 2.0."
            )

            p2 = Question(
                track=track,
                chapter_title="Chapter 4: Decision Making (Selection)",
                type="predict_output",
                content={
                    "code": """public class ModuloTest {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            System.out.print((i % 2) + " ");
        }
    }
}""",
                    "question": "Predict the print outputs (watch spacing)."
                },
                correct_answer="1 0 1 ",
                explanation="i=1: 1%2=1 -> '1 '. i=2: 2%2=0 -> '0 '. i=3: 3%2=1 -> '1 '. Total output: '1 0 1 '."
            )

            p3 = Question(
                track=track,
                chapter_title="Chapter 4: Decision Making (Selection)",
                type="predict_output",
                content={
                    "code": """public class NestedLoopTest {
    public static void main(String[] args) {
        for (int i = 1; i <= 2; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
        }
    }
}""",
                    "question": "Predict the exact printed output of this nested loop program."
                },
                correct_answer="112",
                explanation="i=1: inner loop runs for j=1, prints '1'. i=2: inner loop runs for j=1, 2, prints '12'. Total output combined: '112'."
            )

            p4 = Question(
                track=track,
                chapter_title="Chapter 3: Operators & Expressions",
                type="predict_output",
                content={
                    "code": """public class PrecedenceTest {
    public static void main(String[] args) {
        int x = 2;
        System.out.println(x++ * 3 + ++x);
    }
}""",
                    "question": "Predict the exact output of this program."
                },
                correct_answer="10",
                explanation="x++ returns 2 (x becomes 3). Then ++x increments x to 4 and returns 4. 2 * 3 + 4 = 10."
            )

            db.add_all([p1, p2, p3, p4])
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
