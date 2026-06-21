# Product Requirements Document
## Computer Applications Learning Platform
### ICSE Class 9 · ICSE Class 10 · AP Computer Science A

**Product philosophy:** every feature must make a concept *visible*, *interactive*, or *instantly checkable* — never just digitize a worksheet. And visualization means showing the change, not writing a paragraph about the change. If a feature needs a caption to explain itself, it has failed at being a visualization.

**Cost philosophy:** the platform should run free indefinitely for normal tuition-batch scale. The only feature with real recurring cost is live, on-demand code execution — every other feature listed below is either pure client-side logic or a one-time, cached, content-authoring-time cost.

---

## 1. Core Design Principle

Computer Applications is examined as a written, theory-heavy subject, but it is fundamentally procedural and visual underneath: loops trace a shape, recursion traces a call stack, a dry run traces a sequence of memory states. Research on novice programmers backs this up directly — students are far more likely to correctly understand *what a problem is asking* than to correctly trace *what given code actually does*, and this comprehension gap persists even when the problem statement itself is understood fine. Separately, controlled study of AP-style problems found that close to a third of students missed a question not because the underlying code was hard, but because the *specification* was long and easy to misparse under time pressure.

This gives two distinct, real bottlenecks — **code tracing** and **spec reading** — and the feature set below is built to isolate and drill each one separately, rather than bundling everything into generic "practice questions."

---

## 2. Target Users & Track Architecture

| User | Who | Primary Need |
|---|---|---|
| Student | Tuition students first, public ICSE/AP students later | Visual understanding, instant feedback, visible weak areas |
| Teacher (you) | Admin/content owner | Add content without redeploys, see class-wide weak topics, upload notes |
| Parent | Indirect, views progress | Visible proof of improvement — the trust/retention driver |

**One engine, three content packs.** Every content object (unit, question, flashcard, pattern level, note PDF, trace table) carries a `track` field (`ICSE9` / `ICSE10` / `APCSA`) from the first database migration. The UI, navigation, and chapter list are filtered server-side by track — never just hidden via CSS. An ICSE 9 student never sees AP CSA content.

- **Track selection**: required first step at signup, before anything else is shown.
- **Track change**: editable anytime from Profile → Settings (handles grade promotion or genuine track switches). Past progress is archived under the old track, never deleted.
- **AP CSA gets stronger, more exam-software-like features** than ICSE 9/10 by design (Section 6), since its audience is more used to polished digital tools and its content is more reliably, officially sourceable.

---

## 3. Feature List — Tier 1 (Build First)

### 3.1 The Trace Visualizer ("Dry Run," fully interactive, non-text-heavy)

**This is the flagship feature and the single highest-leverage build**, directly targeting the proven code-tracing gap. It replaces the old "AI explains the code" idea with a three-panel, synchronized, mostly-wordless animation, driven by a single Step control.

**The three synchronized panels:**

1. **Code panel** — the snippet, with the currently-executing line highlighted. No annotation text inline; the highlight alone shows position.
2. **Memory Box panel** — every variable rendered as a small live card. On each step, a variable that changes animates its old value sliding/fading out and the new value sliding in (a card-flip or odometer-style transition) — this is the digital upgrade of the "cross-out" notation, done as motion instead of text.
3. **Trace Table panel** — builds one row at a time as the student steps forward. Only the current row is fully bright; past rows fade. The cell that just changed pulses briefly. This is the digitized, animated version of the classic ICSE trace table — same pedagogical structure, zero static text wall.

**Control flow visualization:** when a loop jumps back to its update expression, a curved SVG arrow animates from the closing brace back up to the increment, synced to the same Step click. Condition evaluation (e.g. `n % 2 == 0`) is shown by briefly highlighting just the relevant tokens and dropping a small ✓/✗ result chip next to it — never a sentence.

**Optional, on-demand AI narration:** a single short line ("i was 4, now incremented to 5") available via tap/hover per step — never shown by default, never required to understand the visualization, and crucially **never asked to compute anything**. It only narrates values that have already been verified by real execution (see Technical Requirements) — this keeps hallucination risk near zero, because the AI's only job is language, never arithmetic.

**Content sourcing & cost model:** for the curated question bank, every trace is generated **once**, at content-authoring time, by actually compiling and running the real code (instrumented to snapshot variable state per line) inside a sandboxed container with a real JDK. The resulting trace JSON is cached and served free forever after — no live execution cost for students using bank content. Live, on-demand tracing of a student's own pasted code is a Phase 2 feature, gated separately, since that's the only path with recurring compute cost.

### 3.2 Predict-the-Output Drill (lightweight, reuses the Trace Visualizer backend)

Show a short snippet, hide the output, student types their prediction, then reveal the real cached trace side by side with their guess — visually flagging exactly which step their mental model diverged from reality (e.g. the table row where their predicted value and the real value first differ gets highlighted in a contrasting color). Cheaper than the full Visualizer (no stepping UI needed for this mode) and directly trains the proven weak point.

### 3.3 Syntax-Slip Spotter ("find the bug" mode, ICSE-specific)

Targets the well-documented pattern of small syntax/logic mistakes (missing brackets, wrong variable, off-by-one bound) silently changing an entire output, and of students not reviewing before submitting. Show a snippet with one deliberately planted, realistic bug; student must spot and fix it rather than write from scratch. Reuses the code-display component from the Visualizer.

### 3.4 FRQ Spec-Reading Drill (AP CSA-specific)

Targets the proven "spec is long, easy to misparse, costs marks before any code is written" failure mode. Student is given a real released FRQ prompt and must first extract requirements (inputs, outputs, edge cases, preconditions) into a structured checklist — **before** writing any code — then compares their extraction against a teacher-annotated "what this question is actually asking" breakdown. This isolates spec-comprehension failure from code-writing failure, so a student (and you) can see which one is actually the weak link.

### 3.5 Pattern Game (Loop Visualizer/Trainer)

Split-screen: target pattern (stars/numbers/characters) on the right, a loop skeleton with only specific blanks (loop bounds, print expression) on the left — boilerplate always pre-written and locked. As the student edits a blank, a live "ghost" preview re-renders instantly (pure client-side grid logic, zero server cost, zero security surface). Progressive difficulty: outer-bound-only blank → both-bounds blank → print-expression blank → full blank canvas across pattern categories (hollow, mirrored, Pascal's-triangle-style, Floyd's triangle).

### 3.6 Theory Drill Deck ("Differentiate Between X and Y," spaced-repetition-lite)

Flashcards for the closed, recurring set of ~25–30 canonical comparison pairs (Constructor vs Method, String vs StringBuffer, Call by Value vs Reference, etc., plus AP CSA's own pairs like `==` vs `.equals()`, ArrayList vs array, overloading vs overriding). Leitner-box-style scheduling: cards marked "didn't know" resurface sooner.

**Anti-rote-memorization layer:** occasionally present the *same* concept in unfamiliar or reversed phrasing rather than the canonical wording, and flag (to student and teacher analytics) when a student gets the standard phrasing right but the reworded version wrong — that gap is the signal of memorized-but-not-understood content, currently invisible to everyone.

### 3.7 Chapter-wise Timed MCQ Tests with Weak-Area Analysis

Student picks a chapter (scoped to track) → timed quiz assembled from the tagged question bank → auto-graded instantly → results screen shows score plus a per-topic-tag weak-area breakdown, not just an overall percentage. Output-prediction MCQs use the same verified cached traces from 3.1/3.2 as their answer key — never an AI guess.

---

## 4. Feature List — Tier 2 (After Tier 1 Is Live)

### 4.1 Question Bank & Notes Bank (content infrastructure)
- **Question Bank**: every question tagged by track, unit/chapter, topic, difficulty, type — the single source read by quizzes, drills, and the AP mock exam.
- **Notes Bank**: teacher-uploaded PDFs per chapter, with an explicit "general/no specific chapter" bucket for full-revision or exam-tips PDFs that don't belong to one chapter.
- **Upload flow**: simple drag-and-drop from Teacher login — select track + chapter (or "general") from a dropdown, optional title/description. No auto-classification needed; manual tagging by you is faster and more reliable at this content volume.

### 4.2 AP CSA Mock Examination
- Two timed sections matching the real exam: Multiple Choice (~40 Qs) and Free Response (4 FRQs).
- FRQs and scoring rubrics sourced directly from College Board's own publicly released past exams — the one content type on this entire platform that is genuinely, officially 100% verifiable.
- Self/peer-grading against the real rubric, shown side by side with the student's answer.
- Score prediction against College Board's published historical cutoff ranges (re-sourced yearly — this is a maintenance task, not a one-time build).
- Session-integrity features per Section 6.

### 4.3 Teacher Analytics Dashboard
Class/batch-level aggregation of the same per-topic accuracy data powering the student dashboard — "60% of this batch is weak in Arrays." Ties directly to the existing syllabus checklist taxonomy, closing the loop between "what I taught" and "what they actually know." Per-student drill-down for parent conversations.

### 4.4 Student Progress Dashboard
Chapters attempted, accuracy by topic, flashcard mastery %, quiz history over time — the single most likely screen to be screenshotted and shown to a parent or friend, and therefore the primary organic word-of-mouth driver.

---

## 5. Feature List — Tier 3 (Defer)

- Mock paper PDF generator (already deprioritized by teacher)
- Gamification layer (streaks/badges) — a thin layer on existing systems once they exist, not a standalone build
- Live, on-demand execution of arbitrary student-pasted code (Phase 2 of the Trace Visualizer — the only feature with real recurring compute cost)
- True OS-level exam lockdown (Section 6.2) — a separate native application project, not a website feature

---

## 6. AP CSA Mock Exam — Session Integrity (Honest Technical Scoping)

A plain website cannot force itself to stay on top of every other window or block OS-level Alt+Tab — that requires OS-level permissions browsers are deliberately sandboxed away from. True lockdown tools (Safe Exam Browser, Respondus) are separate native applications, not webpages. This section splits what's actually buildable from what isn't.

### 6.1 Tier A — Buildable Now, In Scope for MVP (browser-based)

| Mechanism | What it actually does |
|---|---|
| Fullscreen enforcement | Browser Fullscreen API forces fullscreen on exam start; exiting is detected and flagged |
| Tab/window blur detection | `document.visibilitychange` / `window.blur` fire the instant focus is lost; every occurrence timestamped and logged |
| Copy/paste & right-click blocking | Deterrent-level friction; raises effort, doesn't make cheating impossible |
| Enforcement policy (configurable) | Default = warn once on first violation, auto-submit on second — a single accidental notification shouldn't void a mock exam, but a second violation indicates real intent |
| Audit trail | Every violation, even non-ending warnings, is logged and visible to the teacher afterward regardless of policy setting |

### 6.2 Tier B — True OS-Level Lockdown (future phase, not MVP)

Genuinely preventing window-switching requires a separate native kiosk application (Electron-based, conceptually similar to Safe Exam Browser) — its own install/distribution story, not a feature on the existing site. Scoped as a future Phase 3 consideration once real usage data tells you whether your mock exams' stakes justify that friction. Tier A's logged, audited, warn-then-submit approach is the proportionate response for a tuition/practice context.

---

## 7. Content Sourcing Plan

### 7.1 ICSE 9 & 10 (flashcards, MCQs, notes)
1. **Teacher-authored seed content** — you write the initial 25–30 canonical comparison pairs and a first MCQ batch directly; a few evenings' work, not months, given you already know these cold.
2. **Textbook-aligned content** — Selina/Avichal chapter-end exercises, rephrased in your own words.
3. **AI-assisted volume generation** — once a style template exists from (1)/(2), AI drafts more at speed; every item is teacher-reviewed before publishing. Nothing goes live unverified.
4. **Trace/output content specifically** — generated as verified executions (Section 3.1's pipeline), never an AI guess and never hand-typed.

### 7.2 AP CSA
- FRQs and official rubrics — sourced directly from College Board's public past papers. Officially verified by construction.
- MCQ-style practice — College Board's own Course and Exam Description sample items, supplemented with teacher-authored/AI-assisted items under the same review discipline as 7.1.
- Score cutoffs — sourced fresh each year from College Board's published distributions.

### 7.3 Teacher-uploaded notes
100% sourced from you directly via the upload flow — no ambiguity, it's your own material.

---

## 8. Information Architecture

- **Public/landing layer** (track-agnostic): single homepage, track selection (ICSE 9 / ICSE 10 / AP CSA) as the first and only decision before signup.
- **Logged-in app shell** (track-scoped): navigation, chapters, drills, quizzes, and visualizer examples filtered server-side by track. ICSE 9 sidebar = 7 units; ICSE 10 = 8 units; AP CSA = College Board's own unit structure (Primitive Types, Objects, Boolean/if, Iteration, Classes, Array, ArrayList, 2D Array, Inheritance, Recursion) — deliberately not force-fit into the ICSE shape.
- **Engine vs. skin**: one Trace Visualizer, one Pattern Game, one Quiz engine, one Flashcard engine — each parametrized by `track`, not rebuilt per track. AP CSA may get a distinct landing/marketing skin later (more "exam prep," less "tuition" tone) as a theming layer on the same engine, not a separate codebase.

---

## 9. Prioritized Feature Summary

| Feature | Tier | One-line rationale |
|---|---|---|
| Trace Visualizer (dry run, animated, 3-panel) | 1 | Closes the proven code-tracing comprehension gap, visually, with near-zero hallucination risk |
| Predict-the-Output Drill | 1 | Same evidence base, lighter build, isolates exactly where a student's mental model breaks |
| Syntax-Slip Spotter | 1 | Trains the "review before submitting" habit that's currently nobody's explicit practice |
| FRQ Spec-Reading Drill | 1 | Targets the proven "spec misparsing costs marks before code is even written" failure mode |
| Pattern Game | 1 | Makes the loop-variable → shape mapping experimentable in real time |
| Theory Drill Deck (+ anti-rote layer) | 1 | Active recall for a closed, repetitive theory set, with a built-in memorization-vs-understanding check |
| Chapter-wise Timed MCQ + weak-area analysis | 1 | Instant, topic-specific feedback instead of class-only grading |
| Question Bank + Notes Bank infra | 2 | Necessary shared backbone for every content-driven feature |
| AP CSA Mock Exam (MCQ + FRQ + rubric) | 2 | Officially-sourced, rubric-transparent practice on the track with the most reliable PYQ data |
| Teacher Analytics Dashboard | 2 | Closes the loop between syllabus checklist and what students actually know |
| Student Progress Dashboard | 2 | Visible improvement — the primary parent-facing word-of-mouth driver |
| Mock paper PDF generator | 3 | Deprioritized by teacher; revisit later |
| Gamification layer | 3 | Thin layer once core systems exist |
| Live arbitrary-code execution | 3 / Phase 2 | Only feature with real recurring compute cost — gate separately |
| AP CSA OS-level lockdown | 3 / Future | Needs a separate native app; disproportionate for current stakes |

---

## 10. Technical Requirements (High-Level)

| Layer | Choice & rationale |
|---|---|
| Frontend | React (JSX) — fits the Pattern Game's live re-rendering and the Visualizer's step-sync UI naturally |
| Backend | FastAPI (Python) — async-friendly; pairs well with a Python-orchestrated execution sandbox |
| Database | PostgreSQL over MongoDB — the content model (track → unit → topic → question/flashcard/note/trace) is inherently relational, and analytics aggregation (Section 4.3/4.4) is far simpler via SQL than equivalent Mongo queries |
| Trace generation service | Sandboxed container with a real JDK, used only at content-authoring time (or rate-limited Phase 2 student use) — instruments code to snapshot variable state per line, output cached as JSON, never re-run for cached content |
| AI narration | Used only to narrate already-verified trace values, never to compute — this means even a small/free-tier or self-hosted model is sufficient, since the task is low-difficulty language generation conditioned on ground truth, not reasoning under uncertainty |
| File storage (notes/PDFs) | Object storage (S3-compatible), referenced by URL in Postgres — not stored as binaries in the DB |

### Cross-cutting requirements
- `track` as a first-class column on every content table from the first migration — retrofitting later is expensive, designing for it now is nearly free.
- Teacher content management (questions, flashcards, notes) must not require a code deployment — admin CRUD UI needed early, or content additions will stop happening within weeks.
- The trace-generation sandbox is isolated from the main API regardless of whether it's running curated-only content or (later) arbitrary student code — process isolation and resource limits are non-negotiable even for short bursts.
- All exam-integrity events (Section 6.1) logged to a durable audit table independent of whichever enforcement policy is active — the log is never the configurable part, only the auto-submit trigger is.

### Cost model summary
- **Free indefinitely**: Pattern Game, Theory Drill Deck, Question/Notes Bank infra, Trace Visualizer + Predict-the-Output + Syntax-Slip Spotter (all running on pre-cached traces), static frontend hosting, free-tier backend hosting at tuition-batch scale.
- **One-time, small cost**: AI-assisted bulk content drafting (a content-authoring tool for you, not a per-student-use cost).
- **Only real recurring cost**: live, on-demand execution of arbitrary student-pasted code — explicitly deferred to a gated Phase 2, not part of MVP.

### Explicitly out of scope for now
- Native mobile app — responsive web is sufficient.
- Building a custom Java interpreter/tracer from scratch — a sandboxed real-JDK container plus simple instrumentation is enough; no need for a full OnlinePythonTutor-style fork given the scope has narrowed to trace tables + memory boxes rather than full heap/object visualization.
- AI-generated questions or trace values as an unreviewed primary source — acceptable only as a drafting accelerant with mandatory human (or real-execution) verification.
- OS-level exam lockdown — separate native-app project, future phase.

---

*End of document.*