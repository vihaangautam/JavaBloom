# JavaBloom — Bucket 1 PRD & Technical Requirements
## Common Features Across All 3 Tracks (ICSE 9 · ICSE 10 · AP CSA)

---

## 1. Product Overview

**JavaBloom** is a visual, interactive learning platform for students studying Computer Applications (Java). Bucket 1 contains the **12 core features** shared by all 3 tracks, plus a cross-cutting **Activity Heatmap & XP system** inspired by GitHub/LeetCode/Codedex.

**Philosophy:** Every feature makes a concept *visible*, *interactive*, or *instantly checkable*. If it needs a caption, it has failed.

**Cost target:** $0/month at tuition-batch scale (≤100 students).

---

## 2. The Activity Heatmap & XP System (Cross-Cutting)

> [!IMPORTANT]
> This is NOT a standalone feature — it's a **cross-cutting system** that touches every feature. Every student action earns XP and lights up a cell on the heatmap. Build the tracking infrastructure *first*, then wire each feature into it.

### 2.1 Activity Heatmap (GitHub/LeetCode-style)

**Visual spec:**
- A 52-week × 7-day grid (365 cells), identical to GitHub's contribution graph
- Each cell represents one day; color intensity maps to activity count
- 5 intensity levels: no activity (dark/empty), 1–2 actions (lightest), 3–5, 6–10, 11+ (deepest)
- **Color palette:** Use the platform's brand accent (not GitHub green) — e.g., a purple/indigo gradient on dark mode
- **Tooltips on hover:** "June 15 — 7 activities (45 XP earned)"
- **Current streak counter** displayed prominently: "🔥 12-day streak"
- **Longest streak** shown alongside: "Best: 34 days"
- Placed on the **Student Dashboard** as the hero element (the first thing a student — or parent — sees)

**What counts as an "activity" (any of these lights up a cell):**

| Action | XP Awarded | Category |
|---|---|---|
| Complete a Trace Visualizer session (step through all steps) | 15 XP | Practice |
| Submit a Predict-the-Output answer | 10 XP (+5 bonus if correct) | Practice |
| Fix a bug in Syntax-Slip Spotter | 10 XP (+5 if first attempt) | Practice |
| Answer a flashcard (Theory Drill Deck) | 3 XP per card | Review |
| Complete a chapter MCQ test | 20 XP (+10 if score ≥ 80%) | Assessment |
| Correctly identify a type confusion expression | 5 XP | Practice |
| Decode an error message correctly | 10 XP | Practice |
| Submit a program in Exam Writing Simulator | 15 XP | Practice |
| View a teacher-uploaded note/PDF | 2 XP | Study |
| Log in for the first time today | 5 XP | Engagement |

**Grace mechanism (anti-burnout):**
- One "streak freeze" available per week — automatically applied if the student misses exactly 1 day after a 7+ day streak. No need to claim it manually.
- If streak breaks, a gentle message: "Streaks restart — your total XP never resets!" (prevent discouragement)

### 2.2 XP & Level System (Codedex-inspired)

**Leveling curve:**

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Novice |
| 2 | 100 | Apprentice |
| 3 | 300 | Coder |
| 4 | 600 | Debugger |
| 5 | 1000 | Tracer |
| 6 | 1500 | Analyst |
| 7 | 2200 | Architect |
| 8 | 3000 | Master |
| 9 | 4000 | Grandmaster |
| 10 | 5500 | Legend |

**UI elements:**
- **XP progress bar** in the sidebar/header — always visible, shows current level + XP toward next level
- **Level-up animation:** brief celebration when crossing a level boundary (confetti burst, 2 seconds max, not blocking)
- **Profile badge:** current level title shown on the Student Dashboard and visible to the teacher in analytics

**Design note:** This is *not* pay-to-win or content-gating. XP and levels are purely motivational. No content is locked behind levels.

### 2.3 npm Package

Use **`react-activity-calendar`** for the heatmap grid:
```bash
npm install react-activity-calendar
```

Data format:
```typescript
interface ActivityDay {
  date: string;      // "2026-06-20"
  count: number;     // total actions that day
  level: 0 | 1 | 2 | 3 | 4;  // intensity bucket
}
```

---

## 3. Feature Specifications

### Feature 1: Trace Visualizer (Flagship)

**What it does:** Three synchronized panels that step through Java code execution, driven by a single Step control.

**Panel 1 — Code Panel:**
- Uses `@monaco-editor/react` in read-only mode
- Java syntax highlighting
- Currently-executing line highlighted with a colored background band (e.g., `rgba(99, 102, 241, 0.2)`)
- Line numbers always visible
- On step: previous highlight fades, new line highlights (animated with Framer Motion, 200ms)

**Panel 2 — Memory Box:**
- Each variable rendered as a card: `name | value` with a subtle type badge (`int`, `String`, `char`, etc.)
- On variable change: old value does a card-flip/odometer animation (Framer Motion `AnimatePresence` with `exit` + `enter` variants) → new value slides in
- On variable creation: card fades in from below
- On variable going out of scope: card fades out with grey-out
- **Array rendering:** Horizontal row of indexed cells. Changed cell pulses briefly.
- **String rendering:** Character array view (like array but with quotes)
- Layout: CSS Flexbox wrapping cards, 2–4 per row depending on viewport

**Panel 3 — Trace Table:**
- Classic ICSE dry-run table format: columns = variable names, rows = steps
- Builds one row per step
- Current row: full opacity; past rows: 70% opacity
- Cell that just changed: brief pulse animation (background flash, 300ms)
- Scrolls to keep current row visible

**Control Flow Visualization:**
- **Loop jump-back:** Curved SVG arrow from closing `}` back to loop header. Animated with GSAP `drawSVG` on the step where the loop condition is re-evaluated
- **Condition evaluation:** Relevant tokens (`n % 2 == 0`) briefly highlighted → small ✓ (green) or ✗ (red) chip appears next to the condition for 1.5s, then fades
- **Step controls:** ◀ Previous | Step ▶ | ▶▶ Auto-play (1s interval) | Reset ⟲

**AI Narration (optional):**
- Toggle: "Show narration" (off by default)
- When ON: a single line appears below the Memory Box per step
- Content: template-string based for MVP → `"{var} changed from {old} to {new}"`, `"Loop condition {expr} is {true/false}"`, `"Entering iteration {n}"`
- Computed from the trace JSON, never from an LLM — zero hallucination risk

**Data model:**
```typescript
interface TraceStep {
  lineNumber: number;
  variables: Record<string, {
    value: string;
    type: string;
    changed: boolean;
  }>;
  output?: string;            // console output produced at this step
  condition?: {
    expression: string;
    result: boolean;
  };
  loopJump?: {
    fromLine: number;
    toLine: number;
  };
  narration?: string;         // template-generated narration
}

interface TraceData {
  code: string;
  language: "java";
  steps: TraceStep[];
  finalOutput: string;
  metadata: {
    track: "ICSE9" | "ICSE10" | "APCSA";
    chapter: string;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
  };
}
```

**Responsive layout:**
- Desktop (≥1024px): 3 panels side by side (Code | Memory Box | Trace Table)
- Tablet (768–1023px): Code panel full width on top, Memory Box + Trace Table in tabs below
- Mobile (<768px): All 3 panels as swipeable tabs. Step controls fixed at bottom.

**XP integration:** Completing all steps in a trace session → 15 XP

---

### Feature 2: Predict-the-Output Drill

**Flow:**
1. Show code snippet (Monaco, read-only)
2. Student types predicted output in a text area
3. Student clicks "Check"
4. Side-by-side comparison: student's prediction (left) | actual output (right)
5. **Divergence highlighting:** The first line where prediction differs from reality is highlighted red, with a label: "Your mental model diverged here ↑"
6. Option to "Step through trace" → opens the Trace Visualizer for this same snippet

**Whitespace handling:**
- Trailing whitespace is trimmed before comparison
- Leading whitespace IS significant (patterns!)
- Visual diff shows spaces as `·` dots for clarity

**XP integration:** 10 XP per submission, +5 bonus if output matches exactly

---

### Feature 3: Syntax-Slip Spotter

**Flow:**
1. Show a snippet with one deliberately planted bug (Monaco, editable)
2. Brief description of expected behavior: "This code should print the sum of numbers 1 to 10"
3. Student edits the code to fix the bug
4. On submit: diff student's fix against the correct version
5. Result: ✅ "Correct fix!" or ❌ "Not quite — here's the bug" with the correct line highlighted

**Bug categories (tagged for analytics):**
- Missing/extra semicolons
- `=` instead of `==` in conditions
- Off-by-one loop bounds (`<=` vs `<`)
- Wrong variable in an expression
- Missing brackets changing scope
- Wrong data type (int division when float needed)

**XP integration:** 10 XP, +5 if fixed on first attempt

---

### Feature 4: Theory Drill Deck (FSRS + Anti-Rote)

**Engine:** Uses `ts-fsrs` for scheduling

**Card types:**
1. **Standard comparison:** "What is the difference between `=` and `==`?" → Student reveals answer, rates: Again | Hard | Good | Easy
2. **Reworded variant (anti-rote):** Same concept, unfamiliar phrasing — "A student writes `if(x = 5)` expecting to check equality. What actually happens?" → Tests understanding, not memorization
3. **Quick-fire MCQ variant:** Same concept as a 4-option MCQ (for variety)

**UI:**
- Card flip animation (Framer Motion `rotateY` 180°)
- Front: question. Back: answer + rating buttons
- Session: 10–15 cards per review session
- Progress indicator: "Card 7 of 12"

**Anti-rote detection logic:**
- If student gets standard phrasing ✅ but reworded version ❌ → flag in analytics as "memorized, not understood"
- Teacher sees this gap per student per topic in the Teacher Dashboard

**Track-specific content examples:**

| Track | Comparison Pair |
|---|---|
| ICSE 9 | `=` vs `==`, `while` vs `do-while`, `int` vs `double`, `if` vs `switch` |
| ICSE 10 | Constructor vs Method, `String` vs `StringBuffer`, `static` vs `non-static`, `length()` vs `charAt()` |
| AP CSA | `==` vs `.equals()`, `array` vs `ArrayList`, `public` vs `private`, `.length` vs `.length()` vs `.size()` |

**XP integration:** 3 XP per card answered

---

### Feature 5: Chapter-wise Timed MCQ + Weak-Area Analysis

**Flow:**
1. Student selects a chapter (from track-scoped chapter list)
2. Quiz configuration: number of questions (10/15/20), time limit (10/15/20 min)
3. Timer starts. Questions served one at a time.
4. On completion (or timeout): auto-grade → results screen

**Results screen:**
- Score: `14/20 (70%)`
- **Per-topic-tag breakdown:** A horizontal stacked bar showing accuracy by tag
  - e.g., "Loops: 4/5 ✅ | Arrays: 2/5 ⚠️ | Strings: 3/5 ⚠️ | Operators: 5/5 ✅"
- Weak areas highlighted with a recommendation: "Focus on: Arrays, Strings"
- Option to review each question (show correct answer + explanation)

**Question selection algorithm:**
- Pull N questions from the bank, filtered by `track + chapter`
- Weighted toward tags the student has historically scored lowest on (from past quiz data)
- Ensure at least 1 question from each tag in the chapter
- Mix difficulty: 40% easy, 40% medium, 20% hard

**XP integration:** 20 XP per quiz, +10 bonus if score ≥ 80%

---

### Feature 6: Type Confusion Drill

**Flow:**
1. Show a Java expression: `"Score: " + 3 + 4`
2. Ask: "What is the **type** and **value** of this expression?"
3. 4 options (one correct):
   - A) `String "Score: 7"`
   - B) `String "Score: 34"` ✅
   - C) `int 7`
   - D) Compilation error
4. On answer: show step-by-step evaluation with type annotations

**Expression categories:**
- Integer division: `5/2`, `7/3`, `(double)5/2` vs `(double)(5/2)`
- String concatenation: `"a" + 1 + 2` vs `1 + 2 + "a"`
- Char arithmetic: `'A' + 1`, `(char)('A' + 1)`
- Casting: `(int)3.9`, `(int)(-3.9)`
- Boolean: `5 > 3 && 2 > 4`, `true || false && false`
- Operator precedence: `2 + 3 * 4`, `10 % 3 + 1`

**Track scaling:**
- ICSE 9: Basic expressions (integer division, char values, simple boolean)
- ICSE 10: String concatenation chains, `Math.pow()` return type, wrapper methods
- AP CSA: ArrayList `.get()` return type, `null` comparisons, autoboxing

**XP integration:** 5 XP per correct answer

---

### Feature 7: Error Message Decoder

**Flow:**
1. Show a code snippet + the exact Java error message it produces
2. Student must:
   - **Step 1:** Click the line that caused the error
   - **Step 2:** Select the reason from a list (e.g., "Array index 5 doesn't exist — array only has 5 elements (0–4)")
   - **Step 3:** Fix the code in an editable Monaco editor
3. After fixing: diff against correct version

**Error types covered:**

| Error | Typical Cause | Track |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | `arr[arr.length]` instead of `arr[arr.length-1]` | All |
| `StringIndexOutOfBoundsException` | `str.charAt(str.length())` | All |
| `NullPointerException` | Calling method on uninitialized variable | ICSE 10 + AP |
| `ArithmeticException: / by zero` | Division without checking divisor | All |
| `NumberFormatException` | `Integer.parseInt("abc")` | ICSE 10 + AP |
| `StackOverflowError` | Missing base case in recursion | AP CSA |
| Compilation: `incompatible types` | `int x = "hello";` | All |
| Compilation: `cannot find symbol` | Typo in variable name | All |

**XP integration:** 10 XP per correct full-flow (identify + explain + fix)

---

### Feature 8: Exam Writing Simulator

**What it does:** A Monaco editor with all "IDE crutches" disabled:
- ❌ No IntelliSense / autocomplete
- ❌ No syntax error highlighting (red squiggles)
- ❌ No auto-bracket completion
- ❌ No auto-indentation (student must indent manually)
- ✅ Syntax highlighting (colors) stays ON (exams don't have this, but pure monochrome is too hostile for digital use)
- ✅ Line numbers stay ON

**Flow:**
1. Student sees a problem statement: "Write a program to accept a number and check if it is a palindrome"
2. Timer starts (optional, student can toggle)
3. Student writes the complete program from memory
4. On submit, three-layer feedback:
   - **Structural check:** Are `import`, `class`, `main` present? Is basic syntax valid?
   - **Logic check:** Against cached expected output for test inputs
   - **Style feedback:** Proper indentation? Variable names readable? Comments present?

**Monaco configuration for "exam mode":**
```typescript
const examEditorOptions: monaco.editor.IEditorOptions = {
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  parameterHints: { enabled: false },
  autoClosingBrackets: 'never',
  autoClosingQuotes: 'never',
  autoIndent: 'none',
  formatOnPaste: false,
  formatOnType: false,
  wordBasedSuggestions: 'off',
  minimap: { enabled: false },
};
```

**XP integration:** 15 XP per submission

---

### Feature 9: Question Bank + Notes Bank (Infrastructure)

**Question Bank schema:**
- Every question tagged: `track`, `chapter`, `topic_tags[]`, `difficulty`, `question_type` (MCQ / predict-output / bug-fix / type-confusion / error-decode / flashcard)
- Questions are the single source of truth read by: MCQ tests, drills, visualizer examples

**Notes Bank:**
- Teacher-uploaded PDFs per chapter
- Fields: `track`, `chapter` (or "general"), `title`, `description`, `file_url`
- Stored in Supabase Storage, referenced by URL in Postgres

**Admin interface (MVP):** Use Supabase's built-in Dashboard for content entry. No custom admin UI for Bucket 1 — build that in Bucket 2.

---

### Feature 10: Student Progress Dashboard

**Layout (desktop):**
```
┌──────────────────────────────────────────────────────┐
│  🔥 Streak: 12 days    Level 4: Debugger    1,247 XP │  ← Header bar
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐    │
│  │         ACTIVITY HEATMAP (52 weeks)          │    │  ← Hero element
│  │  ░░▓▓░▓▓▓░░▓░░▓▓▓▓░░░▓▓░▓░▓▓▓▓▓░░░▓▓▓░░   │    │
│  └──────────────────────────────────────────────┘    │
├────────────────────────┬─────────────────────────────┤
│  Accuracy by Topic     │  Recent Activity            │
│  ┌─────────────────┐   │  · Trace: for-loop (15 XP)  │
│  │ ████████░░ 80%  │   │  · MCQ: Chapter 3 (20 XP)   │
│  │ ██████░░░░ 60%  │   │  · Flashcard: 10 cards (30)  │
│  │ ██████████ 100% │   │  · Bug fix: off-by-one (15)  │
│  └─────────────────┘   │                             │
├────────────────────────┴─────────────────────────────┤
│  Quiz History (line chart: score % over time)         │
│  Flashcard Mastery (% of cards at "mature" stage)     │
└──────────────────────────────────────────────────────┘
```

**Charts:** Recharts (`LineChart`, `BarChart`, `RadarChart`)

**"Screenshot-worthy" design:** This is the screen parents see. Design for:
- Dark mode with vibrant accent colors
- Large, clear numbers (streak, XP, level)
- Smooth animations on data load (Framer Motion `staggerChildren`)
- One-tap share: "Share my progress" → generates a card image (html2canvas)

---

### Feature 11: Teacher Analytics Dashboard

**Views:**
1. **Batch overview:** Aggregated accuracy by topic across all students in the batch
2. **Per-student drill-down:** Individual heatmap + accuracy + quiz history (for parent meetings)
3. **Weak-area alert:** Topics where >50% of the batch scores <60% → highlighted in red

**Data source:** Same `user_activities` + `quiz_results` tables, aggregated with SQL `GROUP BY`

---

### Feature 12: Auth + Track Selection

**Provider:** Supabase Auth

**Supported methods:**
1. Email + password (primary)
2. Google OAuth (one-click signup)

**Flow:**
1. Landing page → "Get Started" → Sign up with email or Google
2. **Immediately after first sign-up:** Track selection modal (required, cannot skip)
   - "Which course are you studying?"
   - 3 large cards: ICSE Class 9 | ICSE Class 10 | AP Computer Science A
3. Track stored in `profiles.track` — filters all subsequent content server-side
4. Track changeable from Profile → Settings (archives old progress, doesn't delete)

**Role system:**
- `student` (default)
- `teacher` (set manually in Supabase dashboard for now; no self-signup as teacher)

---

## 4. Database Schema (Supabase / PostgreSQL)

```sql
-- ============================================
-- CORE TABLES
-- ============================================

-- Extends Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  track TEXT NOT NULL CHECK (track IN ('ICSE9', 'ICSE10', 'APCSA')),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  total_xp BIGINT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_freeze_used_this_week BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT TABLES
-- ============================================

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track TEXT NOT NULL CHECK (track IN ('ICSE9', 'ICSE10', 'APCSA')),
  chapter_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  UNIQUE(track, chapter_number)
);

CREATE TABLE topic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  track TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id),
  UNIQUE(name, track)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track TEXT NOT NULL CHECK (track IN ('ICSE9', 'ICSE10', 'APCSA')),
  chapter_id UUID REFERENCES chapters(id),
  topic_tags UUID[] DEFAULT '{}',  -- array of topic_tag IDs
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'mcq', 'predict_output', 'bug_fix', 'type_confusion',
    'error_decode', 'flashcard', 'exam_writing'
  )),
  content JSONB NOT NULL,          -- flexible structure per question_type
  correct_answer JSONB NOT NULL,   -- answer key
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trace data for the Trace Visualizer
CREATE TABLE traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  track TEXT NOT NULL,
  code TEXT NOT NULL,
  steps JSONB NOT NULL,            -- array of TraceStep objects
  final_output TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcard-specific data (extends questions for FSRS scheduling)
CREATE TABLE flashcard_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),  -- the "standard" flashcard
  variant_type TEXT NOT NULL CHECK (variant_type IN ('standard', 'reworded', 'mcq')),
  content JSONB NOT NULL,
  correct_answer JSONB NOT NULL
);

-- Teacher-uploaded notes/PDFs
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track TEXT NOT NULL CHECK (track IN ('ICSE9', 'ICSE10', 'APCSA')),
  chapter_id UUID REFERENCES chapters(id),  -- NULL = "general"
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY & GAMIFICATION TABLES
-- ============================================

CREATE TABLE activity_types (
  id TEXT PRIMARY KEY,  -- e.g., 'trace_complete', 'mcq_submit', 'flashcard_answer'
  display_name TEXT NOT NULL,
  default_xp INT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('practice', 'review', 'assessment', 'study', 'engagement'))
);

CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL REFERENCES activity_types(id),
  xp_earned INT NOT NULL,
  metadata JSONB,  -- e.g., { question_id, score, time_taken_ms }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated daily activity for heatmap (materialized from user_activities)
CREATE TABLE daily_activity_summary (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  total_actions INT NOT NULL DEFAULT 0,
  total_xp INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

-- ============================================
-- QUIZ & PROGRESS TABLES
-- ============================================

CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id),
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  time_taken_seconds INT,
  score_percentage DECIMAL(5,2),
  weak_tags JSONB,  -- array of { tag_id, correct, total }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-question results within a quiz
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  student_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INT
);

-- FSRS card state per student per flashcard
CREATE TABLE flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  fsrs_state JSONB NOT NULL,  -- ts-fsrs Card object (due, stability, difficulty, etc.)
  reps INT DEFAULT 0,
  lapses INT DEFAULT 0,
  last_review TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  standard_correct INT DEFAULT 0,
  standard_total INT DEFAULT 0,
  reworded_correct INT DEFAULT 0,
  reworded_total INT DEFAULT 0,
  UNIQUE(user_id, question_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_questions_track ON questions(track);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_created ON user_activities(created_at);
CREATE INDEX idx_daily_summary_user_date ON daily_activity_summary(user_id, activity_date);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_flashcard_progress_user ON flashcard_progress(user_id);
CREATE INDEX idx_flashcard_progress_next ON flashcard_progress(next_review);
```

---

## 5. API Endpoints (FastAPI)

### Auth & Profile
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Supabase Auth (proxied) |
| POST | `/auth/login` | Supabase Auth (proxied) |
| GET | `/profile/me` | Get current user profile |
| PATCH | `/profile/me` | Update profile (track change, etc.) |

### Content
| Method | Endpoint | Description |
|---|---|---|
| GET | `/chapters?track={track}` | List chapters for track |
| GET | `/questions?track={track}&chapter={id}&type={type}` | Filtered question bank |
| GET | `/traces/{question_id}` | Get trace data for a question |
| GET | `/notes?track={track}&chapter={id}` | List notes/PDFs |

### Drills & Quizzes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/start` | Start a quiz session (returns questions) |
| POST | `/quiz/{session_id}/submit` | Submit quiz answers → returns results + weak areas |
| POST | `/drill/predict-output/check` | Compare prediction vs actual |
| POST | `/drill/bug-fix/check` | Compare fix vs correct version |
| POST | `/drill/type-confusion/check` | Check expression answer |
| POST | `/drill/error-decode/check` | Check error identification + fix |

### Flashcards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/flashcards/due?track={track}` | Get cards due for review (FSRS) |
| POST | `/flashcards/{card_id}/review` | Submit rating → update FSRS state |

### Activity & Gamification
| Method | Endpoint | Description |
|---|---|---|
| POST | `/activity/log` | Log an activity → earn XP → update streak |
| GET | `/activity/heatmap?user_id={id}` | Get 365-day activity data for heatmap |
| GET | `/activity/stats?user_id={id}` | Get XP, level, streak, longest streak |

### Dashboard (Analytics)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/student/{id}` | Full student dashboard data |
| GET | `/dashboard/teacher/batch` | Batch-level aggregated analytics |
| GET | `/dashboard/teacher/student/{id}` | Per-student drill-down |

---

## 6. Frontend Architecture

### Tech Stack
```
React 19 + TypeScript + Vite
├── @monaco-editor/react      (code panels)
├── framer-motion              (animations — card flip, fade, slide)
├── gsap + @gsap/react         (SVG arrow animations)
├── recharts                   (dashboard charts)
├── react-activity-calendar    (heatmap)
├── react-markdown             (notes rendering)
├── ts-fsrs                    (flashcard scheduling)
├── diff                       (output comparison)
├── @supabase/supabase-js      (DB + auth + storage client)
├── zustand                    (state management)
├── react-router-dom           (routing)
└── lucide-react               (icons)
```

### Component Tree
```
<App>
├── <AuthProvider>              (Supabase auth context)
├── <TrackProvider>             (current track context)
├── <XPProvider>                (XP, level, streak state)
│
├── <Layout>
│   ├── <Sidebar>
│   │   ├── <TrackBadge />      (ICSE 9 / ICSE 10 / AP CSA)
│   │   ├── <XPProgressBar />   (level + XP toward next)
│   │   ├── <StreakCounter />    (🔥 12 days)
│   │   └── <ChapterNav />      (track-scoped chapter list)
│   │
│   └── <MainContent>
│       ├── <DashboardPage>
│       │   ├── <ActivityHeatmap />
│       │   ├── <AccuracyByTopic />
│       │   ├── <RecentActivity />
│       │   └── <QuizHistory />
│       │
│       ├── <TraceVisualizerPage>
│       │   ├── <CodePanel />        (Monaco, read-only)
│       │   ├── <MemoryBoxPanel />   (variable cards)
│       │   ├── <TraceTablePanel />  (step table)
│       │   ├── <LoopArrow />       (SVG, GSAP-animated)
│       │   ├── <ConditionChip />   (✓/✗ chip)
│       │   └── <StepControls />    (prev/next/autoplay/reset)
│       │
│       ├── <PredictOutputPage>
│       │   ├── <CodePanel />
│       │   ├── <OutputInput />
│       │   └── <DiffView />
│       │
│       ├── <BugSpotterPage>
│       │   ├── <CodePanel />        (editable)
│       │   └── <DiffResult />
│       │
│       ├── <FlashcardPage>
│       │   ├── <FlashcardStack />
│       │   ├── <FlipCard />
│       │   └── <RatingButtons />
│       │
│       ├── <MCQTestPage>
│       │   ├── <QuizTimer />
│       │   ├── <QuestionCard />
│       │   └── <ResultsScreen />
│       │
│       ├── <TypeDrillPage />
│       ├── <ErrorDecoderPage />
│       ├── <ExamWriterPage />
│       ├── <NotesPage />
│       │
│       └── <TeacherDashboardPage>    (role-gated)
│           ├── <BatchOverview />
│           └── <StudentDrillDown />
```

### Routing
```
/                          → Landing / marketing page
/login                     → Auth page
/signup                    → Auth page + track selection
/dashboard                 → Student Dashboard (heatmap, stats)
/chapters                  → Chapter list
/chapters/:id              → Chapter detail (links to drills/quizzes)
/trace/:questionId         → Trace Visualizer
/drill/predict-output      → Predict-the-Output
/drill/bug-fix             → Syntax-Slip Spotter
/drill/type-confusion      → Type Confusion Drill
/drill/error-decode        → Error Message Decoder
/flashcards                → Theory Drill Deck
/quiz/:chapterId           → MCQ Quiz
/exam-writer               → Exam Writing Simulator
/notes                     → Notes Bank
/teacher/dashboard         → Teacher Analytics (role-gated)
/teacher/student/:id       → Per-student drill-down
/profile                   → Profile + settings + track change
```

---

## 7. Design System

### Color Palette (Dark Mode Primary)
```css
:root {
  --bg-primary: #0a0a0f;         /* near-black base */
  --bg-secondary: #12121a;       /* card/panel backgrounds */
  --bg-tertiary: #1a1a2e;        /* elevated surfaces */
  --border: #2a2a3e;             /* subtle borders */

  --text-primary: #e8e8ef;       /* main text */
  --text-secondary: #8888a0;     /* muted text */
  --text-tertiary: #555570;      /* disabled/hint text */

  --accent-primary: #6366f1;     /* indigo — primary actions */
  --accent-secondary: #8b5cf6;   /* violet — secondary elements */
  --accent-success: #22c55e;     /* green — correct/success */
  --accent-error: #ef4444;       /* red — incorrect/error */
  --accent-warning: #f59e0b;     /* amber — warnings */

  /* Heatmap intensity scale */
  --heatmap-0: #1a1a2e;
  --heatmap-1: #312e81;
  --heatmap-2: #4338ca;
  --heatmap-3: #6366f1;
  --heatmap-4: #818cf8;

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  --gradient-xp-bar: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Micro-Animations (Framer Motion defaults)
```typescript
const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const cardFlip = { rotateY: 180, transition: { duration: 0.5, ease: "easeInOut" } };
const pulse = { scale: [1, 1.05, 1], transition: { duration: 0.3 } };
const stagger = { staggerChildren: 0.05 };
```

---

## 8. Phased Build Order

### Phase 0 — Foundation (Week 1–2)
- [ ] Supabase project setup (Postgres + Auth + Storage)
- [ ] Database migration: all tables from Section 4
- [ ] Vite + React + TypeScript project scaffolding
- [ ] Design system (CSS variables, typography, component primitives)
- [ ] Auth flow (signup/login + track selection)
- [ ] App shell with sidebar, routing, track-scoped chapter nav
- [ ] Activity logging infrastructure (`user_activities`, XP calculation, streak logic)
- [ ] Seed `activity_types` table

### Phase 1A — Quick Wins (Week 3–4)
- [ ] Theory Drill Deck (flashcard UI + FSRS integration)
- [ ] Type Confusion Drill (client-side MCQ logic)
- [ ] Error Message Decoder (Monaco + error content)
- [ ] Activity Heatmap component on Student Dashboard
- [ ] XP progress bar + streak counter in sidebar

### Phase 1B — Trace Pipeline (Week 3–5, parallel)
- [ ] JDI-based trace generator (standalone Java program)
- [ ] Generate trace JSONs for 10–15 seed snippets per track
- [ ] Store traces in Supabase

### Phase 2 — Core Drills (Week 5–7)
- [ ] Trace Visualizer (3-panel, step controls, animations)
- [ ] Predict-the-Output Drill (text diff + divergence highlight)
- [ ] Syntax-Slip Spotter (editable Monaco + diff check)
- [ ] Exam Writing Simulator (stripped-down Monaco)

### Phase 3 — Assessment + Dashboard (Week 7–9)
- [ ] Chapter-wise Timed MCQ (quiz engine + weak-area analysis)
- [ ] Student Dashboard (full layout: heatmap + charts + recent activity)
- [ ] Teacher Dashboard (batch overview + per-student drill-down)
- [ ] Notes Bank (PDF upload via Supabase Storage + chapter linking)

### Phase 4 — Polish (Week 9–10)
- [ ] Responsive layouts (tablet + mobile)
- [ ] Level-up animation
- [ ] Share progress card (html2canvas)
- [ ] Seed content: minimum 20 questions per chapter across all 3 tracks
- [ ] End-to-end testing
- [ ] Deploy: Vercel (frontend) + Render (backend) + Supabase (DB)

---

## 9. Verification Plan

### Automated Tests
```bash
# Backend
pytest tests/ -v                  # FastAPI endpoint tests
pytest tests/test_xp.py           # XP calculation + streak logic
pytest tests/test_quiz.py         # Quiz selection algorithm + scoring

# Frontend
npm run test                       # Vitest unit tests
npx playwright test                # E2E tests for critical flows
```

### Manual Verification
- [ ] Sign up → track selection → chapter list is correct for selected track
- [ ] Complete a trace session → verify 15 XP earned + heatmap cell lights up
- [ ] Maintain a 7-day streak → break on day 8 → verify streak freeze applies
- [ ] Take a chapter quiz → verify weak-area breakdown matches actual answers
- [ ] Review 10 flashcards → verify FSRS schedules next review correctly
- [ ] Teacher views batch dashboard → verify aggregated data matches individual students
- [ ] Mobile responsive: all 3-panel views degrade gracefully to tabs

---

## 10. Open Questions

| # | Question | Impact |
|---|---|---|
| 1 | **Should the heatmap show on the landing page (pre-login) as a marketing element?** | Affects landing page design |
| 2 | **Should teachers see the heatmap + XP for each student, or is that too "surveillance-y"?** | Affects teacher dashboard scope |
| 3 | **Should XP values be configurable by the teacher, or fixed?** | Affects the `activity_types` table design (already supports it) |
| 4 | **Do you want a light mode option, or dark-mode-only?** | Affects CSS architecture (currently dark-only) |
| 5 | **For the Exam Writing Simulator, should the structural check be client-side (regex-based) or server-side (actual Java compilation via JDoodle free API)?** | Affects accuracy vs. cost tradeoff |

---

*Total: 12 features + Activity Heatmap/XP system · Estimated build: 10 weeks · Cost: $0/month*
