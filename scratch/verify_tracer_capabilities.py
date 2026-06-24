import sys
sys.path.append(r'c:\Users\ASUS\OneDrive\Desktop\vscProgram\JavaBloom\backend')

from java_tracer import JavaTracer

codes = {
    "do_while": """public class Main {
    public static void main(String[] args) {
        int i = 5;
        do {
            System.out.println(i);
            i--;
        } while (i > 0);
    }
}""",
    "arrays": """public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30};
        arr[1] = 99;
        System.out.println(arr[1]);
        System.out.println(arr.length);
    }
}""",
    "strings": """public class Main {
    public static void main(String[] args) {
        String str = "abc";
        int len = str.length();
        char first = str.charAt(0);
        System.out.println(first);
        System.out.println(len);
    }
}""",
    "switch_case": """public class Main {
    public static void main(String[] args) {
        int x = 2;
        switch (x) {
            case 1:
                System.out.println("one");
                break;
            case 2:
                System.out.println("two");
                // check fall-through without break!
            case 3:
                System.out.println("three");
                break;
            default:
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
