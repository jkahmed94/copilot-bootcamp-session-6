# Tasks: Overdue Todo Items Visual Indicator

**Feature Branch**: `001-overdue-todos`  
**Date**: 2025-11-13  
**Input**: Design documents from `/specs/001-overdue-todos/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- All file paths are absolute from repository root

---

## Project Context

**Technology Stack**: JavaScript (ES6+), React 18.2.0, Node.js (via react-scripts 5.0.1)  
**Testing**: Jest with React Testing Library, 80%+ coverage target  
**Structure**: Monorepo (`packages/frontend/`, `packages/backend/`)  
**Scope**: Frontend-only changes, no backend modifications

**Key Decision**: This is a frontend-only feature. All overdue calculation happens client-side using existing todo data. No database changes, no API changes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and verify existing infrastructure

**Duration**: 10 minutes

- [x] T001 Create `packages/frontend/src/utils/` directory for date utility functions
- [x] T002 Create `packages/frontend/src/utils/__tests__/` directory for utility tests
- [x] T003 Verify CSS variables `--danger-color` exist in `packages/frontend/src/styles/theme.css` (or `packages/frontend/src/App.css`)

**Checkpoint**: ✅ Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core date utility that ALL user stories depend on

**Duration**: 45 minutes

**⚠️ CRITICAL**: This phase MUST be complete before ANY user story implementation can begin. The `isOverdue()` function is used by all visual indicator functionality.

### Unit Tests for Date Utility (Test-First)

> **TEST-FIRST**: Write these tests FIRST, ensure they FAIL, then implement the function

- [x] T004 [P] [FOUNDATION] Write unit test: returns false when dueDate is null in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T005 [P] [FOUNDATION] Write unit test: returns false when dueDate is undefined in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T006 [P] [FOUNDATION] Write unit test: returns false when todo is completed (regardless of due date) in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T007 [P] [FOUNDATION] Write unit test: returns false when dueDate is today in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T008 [P] [FOUNDATION] Write unit test: returns false when dueDate is in future in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T009 [P] [FOUNDATION] Write unit test: returns true when dueDate is in past and not completed in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T010 [P] [FOUNDATION] Write unit test: handles invalid date strings gracefully in `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- [x] T011 [P] [FOUNDATION] Write unit test: ignores time component (date-only comparison) in `packages/frontend/src/utils/__tests__/dateUtils.test.js`

### Implementation of Date Utility

- [x] T012 [FOUNDATION] Implement `isOverdue(dueDateString, completed)` function in `packages/frontend/src/utils/dateUtils.js` following research.md specifications (date normalization to midnight, strict <100ms performance)
- [x] T013 [FOUNDATION] Add JSDoc documentation to `isOverdue()` function with examples in `packages/frontend/src/utils/dateUtils.js`
- [x] T014 [FOUNDATION] Run unit tests and verify 100% code coverage for `dateUtils.js` ✅ 12 tests pass, 100% coverage

**Checkpoint**: ✅ Foundation ready - `isOverdue()` function fully tested and working. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Visual Identification of Overdue Todos (Priority: P1) 🎯 MVP

**Goal**: Users can instantly identify which todo items are overdue by visual indicators (danger-colored text/border + clock icon) applied to todos whose due date has passed and are not yet completed.

**Independent Test**: Create todos with past due dates and verify that overdue items display distinct visual styling (red text, red border, clock icon) that clearly differentiates them from non-overdue items.

**Duration**: 90 minutes

**Acceptance Criteria**:
1. Todo with past due date + incomplete → shows overdue indicator
2. Todo with today's date + incomplete → does NOT show overdue indicator
3. Todo with past due date + completed → does NOT show overdue indicator
4. Todo with future due date → does NOT show overdue indicator
5. Todo with no due date → does NOT show overdue indicator

### Component Tests for User Story 1 (Test-First)

> **TEST-FIRST**: Write these tests FIRST, ensure they FAIL, then implement the component changes

- [x] T015 [P] [US1] Write component test: overdue todo displays danger-colored text and border in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [x] T016 [P] [US1] Write component test: overdue todo displays clock icon (⏰) in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [x] T017 [P] [US1] Write component test: future due date todo does NOT display overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [x] T018 [P] [US1] Write component test: no due date todo does NOT display overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [x] T019 [P] [US1] Write component test: completed overdue todo does NOT display overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [x] T020 [P] [US1] Write component test: overdue styling includes accessible aria-label on clock icon in `packages/frontend/src/components/__tests__/TodoCard.test.js`

### CSS Styling for User Story 1

- [x] T021 [P] [US1] CSS variables already exist: `--danger-color: #c62828` (light mode) and `--danger-color: #ef5350` (dark mode) in `packages/frontend/src/styles/theme.css`
- [x] T022 [P] [US1] Add `.todo-card.overdue` CSS class with red left border (4px solid) and light red background tint in `packages/frontend/src/App.css`
- [x] T023 [P] [US1] Add `.todo-card.overdue .todo-title` CSS class with danger color text and font-weight 600 in `packages/frontend/src/App.css`
- [x] T024 [P] [US1] Add `.todo-card.overdue .todo-due-date` CSS class with danger color text and font-weight 600 in `packages/frontend/src/App.css`
- [x] T025 [P] [US1] Add `.overdue-icon` CSS class for 20px font-size, 8px margin-right in `packages/frontend/src/App.css`
- [x] T026 [P] [US1] Add dark mode overrides for `.todo-card.overdue` with adjusted background tint in `packages/frontend/src/App.css`

### TodoCard Component Implementation for User Story 1

- [x] T027 [US1] Import `isOverdue` utility and `useMemo` hook in `packages/frontend/src/components/TodoCard.js`
- [x] T028 [US1] Add `useMemo` to calculate `todoIsOverdue` with dependencies `[todo.dueDate, todo.completed]` in `packages/frontend/src/components/TodoCard.js`
- [x] T029 [US1] Update `cardClassName` to include `overdue` class when `todoIsOverdue` is true in `packages/frontend/src/components/TodoCard.js`
- [x] T030 [US1] Add conditional rendering of clock icon (⏰) with `role="img"` and `aria-label="Overdue"` when `todoIsOverdue` is true in `packages/frontend/src/components/TodoCard.js`
- [x] T031 [US1] Position clock icon next to due date text in `packages/frontend/src/components/TodoCard.js`

### Verification for User Story 1

- [ ] T032 [US1] Run component tests and verify all TodoCard overdue tests pass
- [ ] T033 [US1] Verify ESLint passes with no errors or warnings for modified files
- [ ] T034 [US1] Manually test: Create todo with yesterday's date → verify overdue indicator shows (red text, border, icon)
- [ ] T035 [US1] Manually test: Create todo with today's date → verify NO overdue indicator
- [ ] T036 [US1] Manually test: Create todo with tomorrow's date → verify NO overdue indicator
- [ ] T037 [US1] Manually test: Mark overdue todo complete → verify overdue indicator disappears immediately
- [ ] T038 [US1] Manually test: Verify overdue styling in both light and dark themes
- [ ] T039 [US1] Manually test: Use screen reader to verify clock icon announces "Overdue"
- [ ] T040 [US1] Run code coverage and verify 80%+ coverage maintained

**Checkpoint**: User Story 1 (MVP) is fully functional - users can visually identify overdue todos

---

## Phase 4: User Story 2 - Overdue Status Persists Across Sessions (Priority: P2)

**Goal**: When users close and reopen the application, overdue visual indicators remain consistent and automatically update based on the current date.

**Independent Test**: Create todos with various due dates, close the application, advance system time or wait, then reopen to verify indicators update correctly based on new current date.

**Duration**: 45 minutes

**Acceptance Criteria**:
1. Todo with future due date → close app → reopen next day → now shows overdue
2. Multiple overdue todos → close app → reopen → all retain overdue indicators
3. Complete overdue todo → close app → reopen → completed todo does NOT show overdue

**Note**: Based on research.md, React's mount behavior automatically handles this - no additional code needed beyond User Story 1. This phase focuses on verification and integration testing.

### Integration Tests for User Story 2 (Test-First)

> **TEST-FIRST**: Write these tests FIRST to verify cross-session persistence

- [ ] T041 [P] [US2] Write integration test: multiple overdue todos render correctly in TodoList in `packages/frontend/src/components/__tests__/TodoList.test.js`
- [ ] T042 [P] [US2] Write integration test: verify overdue todos have `.overdue` class in list context in `packages/frontend/src/components/__tests__/TodoList.test.js`
- [ ] T043 [P] [US2] Write integration test: verify non-overdue todos do NOT have `.overdue` class in list in `packages/frontend/src/components/__tests__/TodoList.test.js`
- [ ] T044 [P] [US2] Write integration test: completed overdue todo does NOT show overdue styling in list in `packages/frontend/src/components/__tests__/TodoList.test.js`

### TodoList Component Verification for User Story 2

- [ ] T045 [US2] Verify TodoList component passes all todo props to TodoCard unchanged in `packages/frontend/src/components/TodoList.js` (no code changes expected)
- [ ] T046 [US2] Verify TodoList re-renders when parent state updates (todos array changes) (no code changes expected)

### Dynamic Update Tests for User Story 2

- [ ] T047 [P] [US2] Write component test: marking overdue todo complete removes overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T048 [P] [US2] Write component test: changing overdue todo's due date to future removes overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T049 [P] [US2] Write component test: removing due date from overdue todo removes overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T050 [P] [US2] Write component test: changing future todo's due date to past adds overdue styling in `packages/frontend/src/components/__tests__/TodoCard.test.js`

### Verification for User Story 2

- [ ] T051 [US2] Run integration tests and verify all TodoList overdue tests pass
- [ ] T052 [US2] Manually test: Create todo with tomorrow's date → close browser tab → reopen next day → verify now shows as overdue
- [ ] T053 [US2] Manually test: Create 5 overdue todos → close app → reopen → verify all 5 retain overdue indicators
- [ ] T054 [US2] Manually test: Mark overdue todo complete → close app → reopen → verify completed todo does NOT show overdue
- [ ] T055 [US2] Manually test: Change overdue todo's due date to next month → verify overdue indicator disappears immediately (FR-008)
- [ ] T056 [US2] Manually test: Remove due date from overdue todo → verify overdue indicator disappears immediately (FR-008)
- [ ] T057 [US2] Run full test suite and verify 80%+ code coverage maintained

**Checkpoint**: User Story 2 is complete - overdue status persists correctly across sessions and updates dynamically

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, edge case handling, and production readiness

**Duration**: 30 minutes

- [ ] T058 [P] Verify all edge cases from spec.md are handled correctly (no due date, midnight edge, completed overdue, etc.)
- [ ] T059 [P] Run full test suite with coverage report and verify 80%+ coverage
- [ ] T060 [P] Run ESLint on all modified files and fix any warnings
- [ ] T061 [P] Test performance: Verify overdue calculation takes <100ms for 100 todos using browser DevTools Performance tab
- [ ] T062 [P] Accessibility audit: Run Lighthouse accessibility check and verify 100 score
- [ ] T063 [P] Verify color contrast meets WCAG AA standards using browser DevTools (danger colors on light/dark backgrounds)
- [ ] T064 Manual cross-browser testing: Chrome, Firefox, Safari (verify clock icon renders correctly)
- [ ] T065 Manual testing: Test all acceptance scenarios from spec.md User Story 1
- [ ] T066 Manual testing: Test all acceptance scenarios from spec.md User Story 2
- [ ] T067 Review quickstart.md and verify all implementation steps were followed
- [ ] T068 Update documentation if any implementation decisions differ from plan
- [ ] T069 Create pull request with clear description referencing spec.md and tasks.md
- [ ] T070 Request code review and address feedback

**Final Checkpoint**: Feature is production-ready, all tests pass, coverage ≥80%, accessibility compliant

---

## Task Summary

**Total Tasks**: 70  
**Setup & Foundation**: 14 tasks (T001-T014)  
**User Story 1 (MVP)**: 26 tasks (T015-T040)  
**User Story 2**: 17 tasks (T041-T057)  
**Polish**: 13 tasks (T058-T070)

---

## Parallel Execution Opportunities

### Phase 1: Setup (All Parallel)
- T001, T002, T003 can all run in parallel (different directories)

### Phase 2: Foundation Tests (All Parallel)
- T004-T011 can all run in parallel (independent test cases in same file)

### Phase 2: Foundation Implementation (Sequential)
- T012 must complete before T013, T014 (tests depend on function existing)

### Phase 3: User Story 1 Tests (All Parallel)
- T015-T020 can all run in parallel (independent test cases)

### Phase 3: User Story 1 CSS (All Parallel)
- T021-T026 can all run in parallel (independent CSS rules)

### Phase 3: User Story 1 Component (Sequential)
- T027-T031 must run in order (each builds on previous changes)

### Phase 3: User Story 1 Verification (Some Parallel)
- T032-T033 can run in parallel
- T034-T040 must run sequentially (manual testing steps)

### Phase 4: User Story 2 Tests (All Parallel)
- T041-T044, T047-T050 can all run in parallel (independent test cases)

### Phase 5: Polish (Mostly Parallel)
- T058-T063 can all run in parallel
- T064-T070 should run sequentially (manual review steps)

---

## Dependencies & Story Completion Order

### Critical Path

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation: dateUtils.js + tests) ← BLOCKING
    ↓
    ├── Phase 3 (User Story 1) 🎯 MVP - Can start after Phase 2
    │   └── Delivers: Visual overdue indicators
    │
    └── Phase 4 (User Story 2) - Can start after Phase 3
        └── Delivers: Persistence across sessions
    ↓
Phase 5 (Polish) - Requires both US1 and US2 complete
```

### Story Dependencies

- **User Story 1** (P1): Depends ONLY on Foundation (Phase 2)
  - Can be delivered as standalone MVP
  - Independently testable
  - No dependency on User Story 2

- **User Story 2** (P2): Depends on User Story 1 implementation
  - Builds on existing TodoCard overdue logic
  - Adds integration testing and verification
  - Can be delivered as enhancement after MVP

### Recommended Delivery Strategy

**Sprint 1 - MVP** (Phase 1 + 2 + 3):
- Deliver User Story 1 only
- Users can identify overdue todos visually
- ~4 hours total work

**Sprint 2 - Enhancement** (Phase 4 + 5):
- Add User Story 2 (persistence verification)
- Polish and production readiness
- ~2 hours total work

---

## Independent Test Criteria

### User Story 1: Visual Identification
**How to verify independently**:
1. Create todo with dueDate = yesterday, completed = false
2. View todo list
3. **PASS IF**: Todo displays with red text, red border, clock icon (⏰)
4. **FAIL IF**: Todo looks like normal todo (no danger colors or icon)

### User Story 2: Persistence Across Sessions
**How to verify independently**:
1. Create todo with dueDate = tomorrow, completed = false
2. Close browser tab
3. Change system date to day after tomorrow (or wait 2 days)
4. Reopen app
5. **PASS IF**: Todo now displays with overdue indicator
6. **FAIL IF**: Todo shows no overdue indicator despite being past due

---

## Implementation Notes

### Test-First Approach
Per Constitution Principle II, all test tasks are marked with ⚠️ and should be written BEFORE implementation. Each test should FAIL initially, then PASS after implementation.

### Performance Considerations
- Task T061 verifies <100ms constraint per SC-004
- `useMemo` is critical for performance (Task T028)
- Date normalization is O(1), no optimization needed

### Accessibility Requirements
- Tasks T039, T062, T063 verify WCAG AA compliance
- Clock icon MUST have `aria-label="Overdue"` (Task T030)
- Color contrast tested in both themes (Task T038)

### No Backend Changes
This feature is **frontend-only**. No tasks modify:
- `packages/backend/` directory
- API endpoints or contracts
- Database schema or migrations

### Atomic Commits
Follow Git best practices from Constitution:
- Commit after each phase completion
- Clear commit messages explaining "why"
- Example: "feat(US1): Add overdue visual indicators to TodoCard"

---

## Troubleshooting Guide

| Issue | Likely Cause | Related Tasks |
|-------|--------------|---------------|
| `isOverdue is not defined` | Missing import in TodoCard | T027 |
| Overdue styling not applying | Incorrect className logic | T029 |
| Tests failing "Cannot find module" | Wrong relative path in import | T027 |
| Overdue status not updating | Missing dependency in useMemo | T028 |
| Clock icon not visible | Emoji rendering issue | T030, T064 |
| Coverage below 80% | Missing test cases | T014, T040, T059 |

---

## Success Criteria Verification

Before marking feature complete, verify ALL success criteria from spec.md:

- [ ] **SC-001**: Users can identify overdue todos within 2 seconds without reading due dates
- [ ] **SC-002**: 100% of overdue todos display indicator correctly
- [ ] **SC-003**: 0% false positives (no non-overdue todos show indicator)
- [ ] **SC-004**: Overdue status updates within 100ms on status/date changes
- [ ] **SC-005**: Users can distinguish overdue items in both light and dark modes

---

**Status**: Ready for implementation  
**Next Step**: Begin with Phase 1 Setup (T001-T003), then Foundation (T004-T014)
