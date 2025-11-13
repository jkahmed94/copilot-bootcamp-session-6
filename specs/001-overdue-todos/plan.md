# Implementation Plan: Overdue Todo Items Visual Indicator

**Branch**: `001-overdue-todos` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add visual indicators (danger-colored text/border + clock icon) to todo items that have passed their due date and remain incomplete. The overdue status is calculated client-side using date-only comparison (ignoring time), recalculates on app load/refresh, and updates immediately when todo status or due date changes. No backend changes required - this is purely a frontend display enhancement using existing todo data.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 18.2.0, Node.js (via react-scripts 5.0.1)  
**Primary Dependencies**: React, React DOM, React Testing Library, Jest, Axios  
**Storage**: N/A (uses existing backend API for todo persistence)  
**Testing**: Jest with React Testing Library, 80%+ coverage target  
**Target Platform**: Web browser (desktop-focused, Chrome/Firefox/Safari)  
**Project Type**: Web application (monorepo: packages/frontend + packages/backend)  
**Performance Goals**: <100ms UI update on status/date changes, <2 seconds visual identification  
**Constraints**: Date-only comparison (no time), local system time (no timezone conversion), Material Design + Halloween theme compliance  
**Scale/Scope**: Single-user application, frontend-only changes, ~3 components affected (TodoCard, TodoList, utility function)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality & Maintainability** | ✅ PASS | Feature follows DRY (date comparison utility extracted), KISS (simple date logic), SOLID (single responsibility for overdue calculation) |
| **II. Test-First Development** | ✅ PASS | 80%+ coverage required; unit tests for utility function, integration tests for TodoCard/TodoList with overdue scenarios |
| **III. Monorepo Structure** | ✅ PASS | Changes isolated to `packages/frontend/src/` - no backend modifications needed |
| **IV. UI/UX Consistency** | ✅ PASS | Uses danger colors from UI guidelines (#c62828/#ef5350), Material Design principles, 8px spacing, accessibility compliant |
| **V. Simplicity & Single Responsibility** | ✅ PASS | Focused feature: visual indicator only, no new data storage, leverages existing todo entity |

### Technical Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| **Technology Stack** | ✅ PASS | React frontend, Jest testing - no new dependencies |
| **Code Style** | ✅ PASS | 2-space indent, camelCase functions, PascalCase components, ESLint enforced |
| **Error Handling** | ✅ PASS | Graceful handling of missing due dates, invalid dates |
| **Performance** | ✅ PASS | Uses useMemo for date calculations, <100ms constraint specified |

### Development Workflow Compliance

| Practice | Status | Notes |
|----------|--------|-------|
| **Git Practices** | ✅ PASS | Feature branch `001-overdue-todos`, atomic commits planned |
| **Code Review Checklist** | ✅ PASS | All checkpoints applicable and will be verified |
| **Testing Workflow** | ✅ PASS | Tests written per component/utility, run before commit |
| **Specification Workflow** | ✅ PASS | Spec has P1/P2 priorities, requirements use MUST, independently testable stories |

### Gate Decision: ✅ **PROCEED TO PHASE 0**

No violations detected. Feature aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/frontend/
├── src/
│   ├── components/
│   │   ├── TodoCard.js           # [MODIFY] Add overdue styling + icon
│   │   ├── TodoList.js            # [VERIFY] Ensure re-renders on date changes
│   │   └── __tests__/
│   │       ├── TodoCard.test.js   # [EXTEND] Add overdue scenarios
│   │       └── TodoList.test.js   # [EXTEND] Add overdue integration tests
│   ├── utils/                     # [NEW DIRECTORY]
│   │   ├── dateUtils.js           # [NEW] isOverdue() function
│   │   └── __tests__/
│   │       └── dateUtils.test.js  # [NEW] Unit tests for date logic
│   ├── styles/
│   │   └── theme.css              # [VERIFY] Danger colors already defined
│   └── App.css                    # [OPTIONAL] Global overdue styles if needed
└── public/
    └── index.html                 # No changes

packages/backend/                  # No changes for this feature
```

**Structure Decision**: Web application monorepo. Frontend-only changes in `packages/frontend/src/`. New `utils/` directory for date calculation logic following DRY principle. Backend remains unchanged as overdue calculation is client-side.

## Complexity Tracking

No constitutional violations detected. This section intentionally left empty.

---

## Phase 0: Research - ✅ COMPLETED

**Output**: `research.md`

**Summary**: Comprehensive technical research completed covering:
- Date-only comparison approach (vanilla JS with setHours normalization)
- Library evaluation (decided against date-fns for simplicity)
- React component architecture (utility function + useMemo in TodoCard)
- Automatic recalculation strategy (React mount behavior sufficient)
- CSS conditional class patterns (template literals + CSS variables)

**Key Decisions**:
1. Vanilla JavaScript for date comparison (no external libraries)
2. `useMemo` in TodoCard for performance optimization
3. Pure function in `utils/dateUtils.js` for testability
4. CSS variables for theme-aware danger colors
5. No intervals/timers needed (React mount handles recalculation)

**Alignment**: All decisions align with Constitution Principles I, II, III, IV, V

---

## Phase 1: Design & Contracts - ✅ COMPLETED

**Outputs**: 
- `data-model.md` - Confirmed no entity changes, documented derived property logic
- `contracts/component-contracts.md` - TodoCard, TodoList, dateUtils contracts
- `contracts/api-contracts.md` - Confirmed zero backend API changes
- `quickstart.md` - Step-by-step implementation guide with code examples

**Key Findings**:
1. **No database changes** - Overdue is derived from existing `dueDate` and `completed` fields
2. **No API changes** - Backend remains completely unchanged
3. **Frontend-only feature** - All logic in React components and utilities
4. **Performance validated** - <2ms for 100 todos, meets <100ms constraint

**Agent Context Updated**: ✅ Copilot instructions updated with:
- Language: JavaScript (ES6+), React 18.2.0, Node.js
- Framework: React, React DOM, React Testing Library, Jest, Axios
- Database: N/A (uses existing backend API)

**Constitution Re-Check**: ✅ All principles remain satisfied post-design

---

## Phase 2: Task Breakdown - ⏸️ PENDING

**Command**: `/speckit.tasks` (to be run separately)

This phase will generate `tasks.md` with granular implementation tasks based on the research and design artifacts created in Phases 0 and 1.

---

## Summary of Artifacts Created

### Phase 0 - Research
- ✅ `/specs/001-overdue-todos/research.md` (8 sections, 5 key decisions)

### Phase 1 - Design & Contracts  
- ✅ `/specs/001-overdue-todos/data-model.md` (confirms no entity changes)
- ✅ `/specs/001-overdue-todos/contracts/component-contracts.md` (3 contracts)
- ✅ `/specs/001-overdue-todos/contracts/api-contracts.md` (zero API changes)
- ✅ `/specs/001-overdue-todos/quickstart.md` (7-step implementation guide)
- ✅ Updated `.github/copilot-instructions.md` (agent context)

### Phase 2 - Tasks (Not Yet Created)
- ⏸️ `/specs/001-overdue-todos/tasks.md` (run `/speckit.tasks` to generate)

---

## Implementation Readiness: ✅ READY

All planning artifacts complete. Developers can begin implementation using:
1. **Research findings** for technical approach
2. **Component contracts** for interfaces and signatures  
3. **Quickstart guide** for step-by-step implementation
4. **Spec document** for requirements and acceptance criteria

**Next Command**: `/speckit.tasks` to generate granular task breakdown
