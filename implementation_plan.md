# Implementation Plan: Interactive Database-Backed Arena Drills

We will build **four core drills** in the Practice Arena end-to-end. Clicking a drill card on the Arena board will open an interactive view that pulls content from the SQLite database and logs student achievements back to the backend database to earn XP and update streaks.

## User Review Required

> [!IMPORTANT]
> - **Kid-Friendly UI/UX:** We will design interactive components with a gamified feel: clear success/fail animations (like confetti pops, card flips, and button scale micro-animations), large readable fonts, and step-by-step explanations.
> - **End-to-End Database Sync:** Question decks, code snippets, and loop traces will load dynamically from the backend `/questions` and `/traces/{question_id}` endpoints. Completed sessions will write to the database using the `/activity/log` endpoint.
> - **Interactive Drills Planned:**
>   1. **Type Confusion Drill:** An expressions card showing Java statements, offering 4 styled multiple-choice options, and rendering color-coded evaluation paths.
>   2. **Theory Drill Deck (Flashcards):** FSRS-scheduled cards that flip with 3D rotation animations.
>   3. **Predict The Output:** Displays code in a read-only Monaco editor, maps predicted output, and highlights line-by-line differences.
>   4. **Trace Visualizer (Flagship):** A three-panel stepping debugger displaying code highlights, memory boxes with slide-in variables, and a trace table.

## Proposed Changes

### 1. Database Content Seeding

#### [MODIFY] [seed.py](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/backend/seed.py)
- Expand the database questions with rich, track-scoped content:
  - Flashcard questions (e.g. variables, constructors, `.equals()` vs `==`)
  - Predict the Output code snippets (e.g. nested loop patterns, division arithmetic)
  - Type Confusion expressions
  - Detailed variables trace steps for the visualizer.

### 2. Frontend Views & Sub-pages

#### [NEW] [TypeConfusionView.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/frontend/src/pages/drills/TypeConfusionView.tsx)
- Create a dedicated view for casting and evaluation questions.
- Display a card with progress tracking (e.g. "Question 2 of 5").
- Render options as large clickable buttons with instant check logic and detailed explanations.

#### [NEW] [FlashcardsView.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/frontend/src/pages/drills/FlashcardsView.tsx)
- Create a flashcard deck view with 3D card-flip animations using Framer Motion.
- Display front-of-card prompt, flip button, and feedback ratings (Again, Hard, Good, Easy) which trigger logging API calls.

#### [NEW] [PredictOutputView.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/frontend/src/pages/drills/PredictOutputView.tsx)
- Render the code inside a read-only Monaco editor.
- Provide a text field for prediction.
- Show a side-by-side comparison on submit, highlighting differences.

#### [NEW] [TraceVisualizerView.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/frontend/src/pages/drills/TraceVisualizerView.tsx)
- The flagship visualizer featuring the three-panel layout:
  - Left: Monaco Editor highlighting the active line of execution.
  - Middle: Memory box containing variables that pulse and slide in as they are updated or initialized.
  - Right: Auto-scrolling dry-run trace table.
  - Bottom: Control bar with Play/Pause, Step Next/Prev, Speed slider, and template-based Narration logs.

#### [MODIFY] [ArenaPage.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/vscProgram/JavaBloom/frontend/src/pages/ArenaPage.tsx)
- Add state to track the active drill (e.g., `activeDrillId`).
- Render the selected drill view component or display the main card dashboard.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run build` to confirm bundler passes cleanly.

### Manual Verification
- Access the Arena, click "Start Drill" on the Type Confusion, Flashcard, Predict Output, and Trace Visualizer cards.
- Verify that questions load from the database API, check functions process correctly, and completed drills save XP records to SQLite.
- Test responsive layout behavior on tablet and mobile viewports.
