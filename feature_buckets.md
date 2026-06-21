# JavaBloom — Feature Buckets by Track
## What's Shared · What's ICSE 9 Only · What's ICSE 10 Only · What's AP CSA Only

---

## Syllabus Context (Drives Every Decision Below)

| | ICSE 9 | ICSE 10 | AP CSA (2025-26 redesign) |
|---|---|---|---|
| **Student profile** | Potentially **first line of code ever written** | Has 1 year of Java; preparing for **board exam (paper)** | Typically has prior coding exposure; **college-level rigor** |
| **Topics** | Data types, operators, Scanner input, if/else, switch, for/while/do-while, Math class, basic patterns | Everything from Class 9 + methods, constructors, String/StringBuffer, wrapper classes, arrays (1D/2D), sorting/searching, OOP | Objects & methods, selection & iteration, class creation, arrays, ArrayList, 2D arrays, recursion tracing, file/Scanner processing, data sets |
| **What's NOT covered** | Methods, constructors, arrays, String library, OOP depth | Recursion, ArrayList, inheritance, polymorphism | Inheritance & polymorphism **removed** as of 2025-26; no writing recursive methods (tracing only) |
| **Exam format** | School-level written paper (handwritten Java) | Board exam: Section A (40 marks short answer) + Section B (60 marks programs) — **handwritten** | 42 MCQs (90 min) + 4 FRQs (90 min) — MCQs digital, **FRQs handwritten** |
| **Primary bottleneck** | "What does this code even mean?" — the boilerplate is alien | "I understand the concept but can't write a correct program under time pressure on paper" | "The spec is long and I misread it" + "I can trace simple code but not recursive/collection code" |

---

## Bucket 1: Common to ALL 3 Tracks

These features use the **same engine** with **track-specific content**. Every student gets them; only the questions, snippets, and chapters inside them differ.

| # | Feature | What It Does | Why It's Common |
|---|---|---|---|
| 1 | **Trace Visualizer** (3-panel: Code + Memory Box + Trace Table) | Step through code line by line; see variables change, conditions evaluate, loops jump back | Every track has "predict the output" / "dry run" questions. The *snippets* differ; the *visualization engine* is identical. |
| 2 | **Predict-the-Output Drill** | Student types predicted output → diffed against real cached output → divergence row highlighted | Same engine, different snippets per track |
| 3 | **Syntax-Slip Spotter** ("Find the Bug") | Snippet with one planted realistic bug; student must spot and fix it | All 3 tracks lose marks to small syntax/logic mistakes |
| 4 | **Theory Drill Deck** (FSRS + anti-rote layer) | Flashcards with spaced repetition; reworded variants detect memorized-but-not-understood | ICSE 9: `=` vs `==`, `while` vs `do-while`, `int` vs `float`; ICSE 10: constructor vs method, String vs StringBuffer; AP CSA: `==` vs `.equals()`, array vs ArrayList |
| 5 | **Chapter-wise Timed MCQ + Weak-Area Analysis** | Timed quiz from tagged question bank → per-topic breakdown | All 3 tracks have MCQ-style questions; content differs by chapter/unit |
| 6 | **Type Confusion Drill** *(NEW)* | "What is the type and value of `5/2`?" — isolates single-expression type evaluation | Integer division, char arithmetic, String concatenation with `+` — all 3 tracks trip on this |
| 7 | **Error Message Decoder** *(NEW)* | Show code + runtime error → student identifies the line, explains why, fixes it | `NullPointerException`, `ArrayIndexOutOfBounds`, `StringIndexOutOfBounds` hit all 3 tracks; beginners especially panic at red text |
| 8 | **Exam Writing Simulator** *(NEW)* | Monaco editor with autocomplete/error-highlighting **disabled** — write complete programs from memory | ICSE 9 & 10: handwritten board/school exams; AP CSA: FRQs are handwritten. All tracks need "write correct code without IDE crutches" training |
| 9 | **Question Bank + Notes Bank** | Tagged content infrastructure; teacher-uploaded PDFs per chapter | Backend shared; content filtered by `track` field |
| 10 | **Student Progress Dashboard** | Accuracy by topic, quiz history, flashcard mastery % | Same dashboard engine, track-scoped data |
| 11 | **Teacher Analytics Dashboard** | Batch-level weak-area aggregation ("60% weak in Arrays") | Same engine, track-scoped |

> [!NOTE]
> **"Common" means same feature engine, not same content.** An ICSE 9 student's Type Confusion Drill asks about `5/2` and `'A' + 1`. An AP CSA student's asks about `(double)(3/4)` and `"Score:" + 3 + 4`. The engine is identical; the question bank entries carry different `track` tags.

---

## Bucket 2: ICSE 9 Extras — For Students Who Are Completely New to Code

These features **only exist in the ICSE 9 track**. They address a unique bottleneck: the student has never written a line of code, doesn't know what `public static void main(String args[])` means, and finds Java's verbosity actively hostile.

### 2A. Code Order Puzzle *(NEW)*

**The problem:** A Class 9 student doesn't yet have the mental model of "what order does a Java program go in." They see `import`, `class`, `main`, `System.out.println` and don't know which comes first.

**What it does:** Given 5–7 lines of a simple program in **scrambled order**, the student drags/taps them into the correct sequence. The program then "runs" (cached output appears) to confirm the order is right.

**Examples (progressive difficulty):**
1. Level 1: Arrange `import`, `class declaration`, `main method`, `println`, closing braces — a "Hello World" in 5 pieces
2. Level 2: Same but with `Scanner` input + a variable declaration
3. Level 3: Include an `if-else` block (now order *within* the block matters)
4. Level 4: Include a `for` loop

**Why ICSE 9 only:** ICSE 10 and AP CSA students already know program structure from a year+ of experience. This is pure beginner scaffolding.

**Cost:** $0 — 100% client-side drag-and-drop.

---

### 2B. Java ↔ English Translator *(NEW)*

**The problem:** Beginners can describe what they want in English ("store the number 5 in a variable called x") but can't translate that to Java (`int x = 5;`). The gap between intent and syntax is the #1 frustration for first-time coders.

**What it does:** Two modes:

**Mode 1 — English → Java:** Show a plain-English instruction, student types the Java equivalent.
| English | Expected Java |
|---|---|
| "Store the number 5 in a variable called x" | `int x = 5;` |
| "Print the value of x" | `System.out.println(x);` |
| "If x is greater than 10, print 'big'" | `if(x > 10) { System.out.println("big"); }` |
| "Repeat 5 times, printing the counter" | `for(int i = 0; i < 5; i++) { System.out.println(i); }` |

**Mode 2 — Java → English:** Show a line of Java, student writes what it does in plain English. This tests comprehension (can you *read* code, not just *write* it?).

**Why ICSE 9 only:** This is a **translation training wheel**. By ICSE 10, students read and write Java fluently enough that this is unnecessary.

**Cost:** $0 — pre-authored content, client-side string comparison (with tolerance for minor syntax variations like spacing).

---

### 2C. Boilerplate Autopilot *(NEW)*

**The problem:** In ICSE 9, every program requires the same boilerplate:
```java
import java.util.Scanner;
class ProgramName {
    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        // ACTUAL LOGIC GOES HERE
    }
}
```
Beginners spend half their mental energy remembering this wrapper and make mistakes in it (`String args[]` vs `String[] args`, missing `import`, typos in `System`). This **actively distracts** from learning the actual logic (loops, if-else, expressions) which is what the syllabus is testing.

**What it does:** A toggle in the code editor and the Pattern Game:
- **ON (default for ICSE 9):** Boilerplate is pre-filled and locked (greyed out, non-editable). The student only writes the logic inside `main()`. A subtle label says "This part is the same every time — focus on the logic below."
- **OFF (student can disable anytime):** Full blank editor, student writes everything. The Exam Writing Simulator (Bucket 1) always has this OFF, since the exam tests boilerplate recall.

**Why ICSE 9 only:** ICSE 10 students are expected to write the full program. AP CSA FRQs only ask for methods/classes, not full `main` programs. This scaffolding is specifically for the "I don't know what `public static void main` means yet" phase.

**Cost:** $0 — a UI toggle that prefills and locks the editor's first/last few lines.

---

### 2D. Pattern Game (Single-Loop Entry Tier) *(ICSE 9 version)*

The Pattern Game exists in Bucket 1 (common), but **ICSE 9 gets an extra simpler entry tier** before the standard game:

| Tier | What's Blank | Example Pattern | Track |
|---|---|---|---|
| **0 (ICSE 9 only)** | Only the print expression | Single row: `* * * * *` | ICSE 9 only |
| **0.5 (ICSE 9 only)** | Loop bound + print expression | Simple column or diagonal | ICSE 9 only |
| 1 | Outer loop bound | Standard triangle | All tracks |
| 2 | Both loop bounds | Inverted/right-aligned | ICSE 9 + 10 |
| 3 | Print expression + bounds | Hollow, mirrored | ICSE 9 + 10 |
| 4 | Full blank canvas | Floyd's, Pascal's, diamond | ICSE 10 mainly |

**Why:** ICSE 9 students encounter single `for` loops first, then nested loops. They need a gentler ramp than jumping straight into nested-loop patterns. ICSE 10 students start at Tier 1.

---

### Summary: ICSE 9 Extras

| Feature | What It Solves | Cost |
|---|---|---|
| **Code Order Puzzle** | "I don't know what order a Java program goes in" | $0 |
| **Java ↔ English Translator** | "I can say what I want in English but can't write it in Java" | $0 |
| **Boilerplate Autopilot** | "I spend all my energy on `public static void main` instead of learning loops" | $0 |
| **Pattern Game Tier 0** | "Nested loops are too hard — I need single-loop patterns first" | $0 |

> [!TIP]
> **These 4 features together create a "soft onramp" for students who have never coded before.** They progressively remove scaffolding: Code Order Puzzle → Java-English Translator → Boilerplate Autopilot ON → Boilerplate Autopilot OFF → full Exam Writing Simulator. By the end of ICSE 9, the student is writing complete programs from memory.

---

## Bucket 3: ICSE 10 Extras — For Board Exam Readiness

ICSE 10 students know Java basics. Their bottleneck isn't "what does code mean?" — it's **"can I write a correct, complete program on paper under time pressure?"** and **"do I know the library methods cold?"**

### 3A. Method Call Sequence Trainer *(NEW)*

**The problem:** ICSE 10 introduces a massive number of library methods across String, Math, and Wrapper classes. Students constantly confuse:

| Confusion | Example |
|---|---|
| Return type | Does `toUpperCase()` modify the string or return a new one? |
| Method name | `indexOf()` vs `charAt()` vs `substring()` — which takes what arguments? |
| Class membership | Is `pow()` in `Math` or `Integer`? Is `parseInt()` in `String` or `Integer`? |
| Syntax | `Math.pow(2,3)` returns `double`, not `int` — students write `int x = Math.pow(2,3);` and get a compiler error |

**What it does:** Rapid-fire drill:
1. Show a **data type + task** (e.g., `String s = "Hello"` → "Get the character at index 2")
2. Student types or selects the correct method call (`s.charAt(2)`)
3. Show the **return type** and **actual result** (`char → 'l'`)
4. Common wrong answers are tracked as specific misconception signals

**Content scope (ICSE 10):**
- `String`: `length()`, `charAt()`, `indexOf()`, `lastIndexOf()`, `substring()`, `toUpperCase()`, `toLowerCase()`, `trim()`, `equals()`, `equalsIgnoreCase()`, `compareTo()`, `concat()`, `replace()`, `startsWith()`, `endsWith()`, `contains()`
- `Math`: `abs()`, `sqrt()`, `pow()`, `ceil()`, `floor()`, `round()`, `min()`, `max()`, `random()`
- `Wrapper`: `parseInt()`, `parseFloat()`, `toString()`, `isLetter()`, `isDigit()`, `isUpperCase()`, `isLowerCase()`, `toUpperCase()`, `toLowerCase()`

**Why ICSE 10 only:** ICSE 9 doesn't cover most of these methods. AP CSA has its own method set (covered in Bucket 4).

**Cost:** $0 — pre-authored content, client-side logic.

---

### 3B. Pattern Game (Full Complexity Tiers)

ICSE 10 gets the **advanced tiers** of the Pattern Game that ICSE 9 doesn't:

- **Hollow patterns** (only border characters print, interior is spaces)
- **Mirrored/symmetric patterns** (require calculating spaces + characters)
- **Number/alphabet patterns** (Floyd's triangle, Pascal's triangle structure, character pyramids)
- **Matrix-output patterns** (2D array-based, since ICSE 10 covers 2D arrays)

These map directly to ICSE 10 Section B programming questions.

---

### 3C. Array Operation Visualizer *(Enhancement to Trace Visualizer)*

**The problem:** ICSE 10 introduces arrays, sorting (bubble, selection), and searching (linear, binary). Students struggle to visualize what happens to array elements during a sort — which elements swap, which are already sorted, what the "sorted portion" boundary is.

**What it does:** When the Trace Visualizer encounters an array:
- The **Memory Box** renders the array as a horizontal row of cells (not a single card)
- During sorting, **swapping elements** animate with a visible arc/swap motion
- The **"sorted portion"** is shaded in a different color, growing with each pass
- For binary search: the **search window** visually narrows with each iteration, highlighting `mid`, `low`, `high`

**Why ICSE 10 extra (not common):** ICSE 9 doesn't cover arrays. AP CSA covers arrays but focuses more on ArrayList and 2D arrays — the sorting/searching algorithm visualization is most critical for ICSE 10's specific syllabus weight.

**Cost:** $0 — frontend enhancement to the existing Trace Visualizer's Memory Box panel.

---

### Summary: ICSE 10 Extras

| Feature | What It Solves | Cost |
|---|---|---|
| **Method Call Sequence Trainer** | "I confuse `indexOf()` with `charAt()` and forget return types" | $0 |
| **Pattern Game Advanced Tiers** | "Hollow/mirrored/number patterns are the hardest board exam questions" | $0 |
| **Array Operation Visualizer** | "I can't follow what happens during bubble sort step-by-step" | $0 |

---

## Bucket 4: AP CSA Extras — For College Board Exam Format

AP CSA students have a fundamentally different exam format (MCQ + FRQ, not handwritten full programs) and different content emphasis (ArrayList, 2D arrays, recursion tracing, data sets). These features only exist in the AP CSA track.

### 4A. FRQ Spec-Reading Drill (from original PRD, Section 3.4)

**Already detailed in your PRD.** Student reads a real released FRQ prompt → extracts requirements into a structured checklist (inputs, outputs, preconditions, edge cases) → compares against teacher-annotated breakdown → sees what they missed, with the relevant sentence in the prompt highlighted.

**Why AP CSA only:** ICSE doesn't have FRQ-style long-prompt questions. ICSE programs are described in 1–2 sentences; AP FRQs are 1–2 *pages*.

---

### 4B. Recursion Call Stack Visualizer *(NEW)*

**The problem:** The 2025-26 AP CSA curriculum specifically includes **recursion tracing** (tracing recursive calls, not writing recursive methods). Students can't see the call stack — each recursive call has its own copy of variables, and the LIFO unwind is invisible.

**What it does:** An extension of the Trace Visualizer that, when the code contains recursion:
- Shows a **visual call stack** as a vertical stack of cards
- Each recursive call **pushes** a new card (animated slide-in) with that call's local variables
- As calls return, cards **pop off** (animated slide-out) and the return value flows into the parent frame
- The current active frame is highlighted; parent frames are dimmed but visible

**Why AP CSA only:** ICSE 9 doesn't cover recursion at all. ICSE 10 mentions "basic recursion" but it's a minor topic, not a heavy exam-weight item. AP CSA 2025-26 explicitly tests recursion *tracing* — this visualizer directly trains that skill.

**Cost:** $0 — frontend work on top of existing trace data (JDI already captures stack frames per step).

---

### 4C. AP CSA Method Reference Trainer *(AP-specific version of Method Call Trainer)*

Similar to ICSE 10's Method Call Sequence Trainer, but with **AP CSA's specific method set**:

| Class | Key Methods |
|---|---|
| `String` | `length()`, `substring()`, `indexOf()`, `equals()`, `compareTo()` |
| `ArrayList` | `add()`, `get()`, `set()`, `remove()`, `size()` |
| `Math` | `abs()`, `pow()`, `sqrt()`, `random()` |
| `Integer` | `parseInt()`, `MAX_VALUE`, `MIN_VALUE` |
| Arrays (2D) | `arr.length`, `arr[0].length` — row count vs column count |

**Key AP-specific confusions to drill:**
- `array.length` (no parentheses, it's a field) vs `str.length()` vs `list.size()`
- `array[i]` vs `list.get(i)` — bracket vs method call
- `list.remove(index)` shifts elements — students forget this and get index bugs
- `substring(start, end)` is inclusive-exclusive — the #1 off-by-one error source

**Why AP CSA only:** Different method set than ICSE 10. The ArrayList / 2D array methods don't exist in ICSE syllabi.

---

### 4D. AP CSA Mock Examination (from original PRD, Section 4.2)

- **Section 1 — MCQ:** 42 questions, 90-minute timer, auto-graded
- **Section 2 — FRQ:** 4 questions, 90-minute timer, self/peer-grading against official rubric
- FRQs sourced from College Board's released past exams
- Score prediction against published historical cutoff ranges
- Session integrity (Fullscreen API, blur detection, audit trail — Section 6.1 of your PRD)

**Why AP CSA only:** ICSE doesn't have this exam format. The session integrity features are proportionate for AP mock exam stakes, not for a casual ICSE chapter quiz.

---

### 4E. Data Set Processing Drill *(NEW)*

**The problem:** The 2025-26 AP CSA redesign **added** file/Scanner text processing and "working with data sets" as new topics. This is brand new — no established practice material exists yet.

**What it does:** Give students a small data set (CSV-style or text file content displayed in the UI) and ask them to:
1. Write code to read/process it (using Scanner)
2. Predict the output of given processing code
3. Identify bugs in data-processing code (missing `hasNext()` check, wrong delimiter, etc.)

**Why AP CSA only:** ICSE doesn't cover file I/O or data set processing. This is a 2025-26 curriculum addition specific to AP CSA.

**Cost:** $0 — pre-authored content with cached traces.

---

### Summary: AP CSA Extras

| Feature | What It Solves | Cost |
|---|---|---|
| **FRQ Spec-Reading Drill** | "I misread the FRQ prompt and lose marks before writing any code" | $0 |
| **Recursion Call Stack Visualizer** | "I can't trace recursive calls — the stack is invisible" | $0 |
| **AP Method Reference Trainer** | "I confuse `.length` vs `.length()` vs `.size()` and `[i]` vs `.get(i)`" | $0 |
| **AP CSA Mock Examination** | "I need full-length timed practice in the real exam format" | $0 |
| **Data Set Processing Drill** | "File/Scanner processing is new to the 2025-26 syllabus — no practice material exists" | $0 |

---

## Master Feature Map — At a Glance

| Feature | ICSE 9 | ICSE 10 | AP CSA | Notes |
|:---|:---:|:---:|:---:|:---|
| **COMMON** | | | | |
| Trace Visualizer | ✅ | ✅ | ✅ | Different snippets per track |
| Predict-the-Output | ✅ | ✅ | ✅ | |
| Syntax-Slip Spotter | ✅ | ✅ | ✅ | |
| Theory Drill Deck (FSRS) | ✅ | ✅ | ✅ | Different comparison pairs per track |
| Chapter MCQ + Weak Areas | ✅ | ✅ | ✅ | |
| Type Confusion Drill | ✅ | ✅ | ✅ | Simpler expressions for ICSE 9 |
| Error Message Decoder | ✅ | ✅ | ✅ | Errors get more complex per track |
| Exam Writing Simulator | ✅ | ✅ | ✅ | All exams are handwritten |
| Question Bank + Notes | ✅ | ✅ | ✅ | Infrastructure |
| Student Dashboard | ✅ | ✅ | ✅ | |
| Teacher Dashboard | ✅ | ✅ | ✅ | |
| **ICSE 9 ONLY** | | | | |
| Code Order Puzzle | ✅ | — | — | Beginner program structure |
| Java ↔ English Translator | ✅ | — | — | Intent-to-syntax bridge |
| Boilerplate Autopilot | ✅ | — | — | Remove boilerplate burden |
| Pattern Game Tier 0 | ✅ | — | — | Single-loop patterns |
| **ICSE 10 ONLY** | | | | |
| Method Call Sequence Trainer | — | ✅ | — | String/Math/Wrapper methods |
| Pattern Game Advanced Tiers | — | ✅ | — | Hollow/mirrored/number patterns |
| Array Operation Visualizer | — | ✅ | — | Sorting/searching animation |
| **AP CSA ONLY** | | | | |
| FRQ Spec-Reading Drill | — | — | ✅ | Long-prompt requirement extraction |
| Recursion Call Stack Visualizer | — | — | ✅ | Visual stack push/pop |
| AP Method Reference Trainer | — | — | ✅ | ArrayList/2D array methods |
| AP CSA Mock Examination | — | — | ✅ | Full exam simulation |
| Data Set Processing Drill | — | — | ✅ | New 2025-26 curriculum topic |

---

## The Scaffolding Gradient

One way to think about the 3 tracks is as a **scaffolding gradient** — ICSE 9 has the most training wheels, AP CSA has the fewest:

```
ICSE 9                    ICSE 10                   AP CSA
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│ Code Order Puzzle    │   │                     │   │                     │
│ Java ↔ English       │   │                     │   │                     │
│ Boilerplate Autopilot│   │                     │   │                     │
│ Pattern Tier 0       │   │                     │   │                     │
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
│                     │   │ Method Call Trainer  │   │ FRQ Spec Drill      │
│                     │   │ Pattern Adv. Tiers   │   │ Recursion Visualizer│
│                     │   │ Array Visualizer     │   │ AP Method Trainer   │
│                     │   │                     │   │ Mock Exam + Integrity│
│                     │   │                     │   │ Data Set Drill       │
├─────────────────────┴───┴─────────────────────┴───┴─────────────────────┤
│              COMMON: Trace Viz · Predict Output · Bug Spotter           │
│              Theory Deck · MCQ Tests · Type Drill · Error Decoder       │
│              Exam Sim · Question Bank · Dashboards                      │
└─────────────────────────────────────────────────────────────────────────┘
  Most scaffolding ──────────────────────────────────── Least scaffolding
  "What does code mean?"  "Can I write it fast?"   "Can I solve novel problems?"
```

---

## Pattern Game — A Note on Track Allocation

The Pattern Game is a special case. Star/number patterns are a **massive part of ICSE exams** (both 9 and 10) but **not part of AP CSA at all**. AP CSA tests loop mastery through array traversal and algorithm questions, not star patterns.

**Recommendation:** The Pattern Game feature is **ICSE 9 + ICSE 10 only**, not AP CSA. If you want AP CSA students to practice loop mastery, build an **Array Traversal Puzzle** instead (same split-screen concept but with arrays instead of star grids) — but that's a Tier 2/3 consideration, not MVP.

---

*Total feature count: 11 common + 4 ICSE 9 extras + 3 ICSE 10 extras + 5 AP CSA extras = **23 features**, all at $0/month.*
