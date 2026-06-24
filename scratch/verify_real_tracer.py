import sys
sys.path.append(r'c:\Users\ASUS\OneDrive\Desktop\vscProgram\JavaBloom\backend')

from java_tracer import JavaTracer

codes = {
    "basic": """public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println(sum);
    }
}""",
    "nested": """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}""",
    "branching": """public class Main {
    public static void main(String[] args) {
        int evens = 0;
        int odds = 0;
        for (int i = 1; i <= 6; i++) {
            if (i % 2 == 0) {
                evens++;
            } else {
                odds++;
            }
        }
        System.out.println("Evens: " + evens);
    }
}""",
    "else_if": """public class Main {
    public static void main(String[] args) {
        int x = 3;
        if (x == 1) {
            System.out.println("one");
        } else if (x == 2) {
            System.out.println("two");
        } else {
            System.out.println("other");
        }
    }
}"""
}

for name, code in codes.items():
    print(f"=== TESTING {name} ===")
    tracer = JavaTracer(code)
    res = tracer.trace()
    if 'error' in res:
        print("Error:", res['error'])
    else:
        for idx, s in enumerate(res['steps']):
            print(f"L{s['lineNumber']}: {s['narration']} | vars: {s['variables']} | output: {repr(s['output'])}")
    print()
