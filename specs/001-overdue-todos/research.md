# Research: Overdue Todo Items Visual Indicator

**Feature**: 001-overdue-todos  
**Date**: 2025-11-13  
**Phase**: Phase 0 - Technical Research

## Overview

This document captures technical research and decisions for implementing visual indicators for overdue todo items in the React frontend.

## Research Questions & Decisions

### 1. Date-Only Comparison Approach

**Question**: What is the best practice for date-only comparison in JavaScript (ignoring time)?

**Decision**: Use vanilla JavaScript Date objects with normalization to midnight via `setHours(0,0,0,0)`

**Rationale**:
- Performance: Normalizing dates to midnight is extremely fast (<1ms for thousands of operations)
- Reliability: Native Date object is well-tested and handles edge cases (leap years, DST, month boundaries)
- No Dependencies: Aligns with project preference to avoid new dependencies unless justified
- Browser Support: Excellent support across all modern browsers (Chrome, Firefox, Safari)
- Simplicity: Implementation is 5 lines of clear, understandable code

**Alternatives Considered**:
- **date-fns library**: Adds ~15KB (tree-shaken) to bundle, overkill for simple date comparison
- **String comparison (YYYY-MM-DD)**: Error-prone with timezone conversions, less maintainable, harder to test
- **getTime() without normalization**: Includes time component, would fail for dates with different times on same day

**Code Example**:
```javascript
// utils/dateUtils.js
export function isOverdue(dueDateString, completed) {
  if (!dueDateString || completed) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today; // Strictly less than (yesterday and before)
}
```

---

### 2. Library vs Vanilla JavaScript

**Question**: Should we use a date library (like date-fns) or vanilla JavaScript?

**Decision**: Vanilla JavaScript only—no external date libraries

**Rationale**:
- **Constitution Alignment**: Project explicitly prefers avoiding new dependencies unless justified (Principle V: Simplicity)
- **Sufficient Complexity**: Date-only comparison is a 5-line pure function—doesn't warrant a library
- **Performance**: Meets <100ms requirement (native operations are ~0.01ms per comparison)
- **Maintenance**: One simple utility function vs managing external dependency updates and security patches
- **Bundle Size**: Zero impact vs 15-70KB for date libraries

**Alternatives Considered**:
- **date-fns**: Popular and lightweight but unnecessary for our simple use case
- **Moment.js**: Deprecated and large bundle size (~300KB)
- **Luxon**: Modern but still adds 66KB for features we don't need

**When to Reconsider**:
- If future requirements include complex date arithmetic (e.g., "overdue by X days", "due in Y hours")
- If timezone complexity increases beyond basic local time comparison
- If multiple date formatting/parsing operations emerge across the application

---

### 3. Overdue Calculation Location in React

**Question**: Where should the overdue calculation happen in the React component tree?

**Decision**: Utility function (`utils/dateUtils.js`) called in TodoCard component with `useMemo` for optimization

**Rationale**:
- **Separation of Concerns**: Business logic (isOverdue) separated from presentation (TodoCard)
- **Testability**: Pure function can be unit tested independently from React components
- **Reusability**: Can be imported anywhere (future sorting, filtering, dashboard badges, etc.)
- **Performance**: `useMemo` prevents recalculation on every render when todo props don't change
- **Single Responsibility**: TodoCard remains focused on rendering; date logic extracted

**Alternatives Considered**:
- **In TodoList component**: Breaks single responsibility; TodoList should only orchestrate rendering of child components
- **Inline in TodoCard**: Harder to unit test, not reusable, couples date logic to component implementation
- **Without useMemo**: Recalculates on every render (parent re-renders trigger child re-renders), violates <100ms constraint for large lists

**Implementation Pattern**:
```javascript
// In TodoCard.js
import React, { useMemo } from 'react';
import { isOverdue } from '../utils/dateUtils';

function TodoCard({ todo, onToggle, onEdit, onDelete, isLoading }) {
  const todoIsOverdue = useMemo(
    () => isOverdue(todo.dueDate, todo.completed),
    [todo.dueDate, todo.completed]
  );

  const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`;
  
  // ... rest of component
}
```

**Performance Analysis**:
- Date comparison: ~0.01ms per todo
- `useMemo` prevents recalculation on unrelated re-renders (e.g., hover states, other todos changing)
- For 100 todos: <2ms total for all overdue checks
- ✅ Easily meets <100ms constraint from success criteria

---

### 4. Recalculation When System Date Changes

**Question**: How to ensure recalculation when system date changes (user opens app the next day)?

**Decision**: React automatically handles this—no special logic, intervals, or useEffect needed

**Rationale**:
- **React Mounting Behavior**: When the app loads/refreshes, all components mount fresh and `new Date()` returns current date
- **Parent Re-renders**: TodoCard receives fresh props from parent (TodoList/App), triggering `useMemo` re-evaluation
- **Session Boundary**: When user closes/reopens app, it's a full remount—all calculations reset to current system date
- **No Performance Cost**: Using intervals would cause unnecessary re-renders every minute/hour and drain battery

**Why useEffect + setInterval is NOT needed**:
```javascript
// ❌ DON'T DO THIS (unnecessary complexity, performance cost)
useEffect(() => {
  const interval = setInterval(() => setForceUpdate({}), 60000); // Force re-render every minute
  return () => clearInterval(interval);
}, []);
```

**Edge Cases Handled**:
- User opens app on Nov 13, todo due Nov 13 → `dueDate === today` → Not overdue ✅
- User closes app, opens on Nov 14 → App remounts, `new Date()` is Nov 14, todo now overdue ✅
- User changes system timezone → Next render uses correct timezone from `new Date()` ✅
- User leaves app open overnight → Todo shows as "not overdue" until next render (acceptable per requirements: "recalculate on app load/refresh")

**Requirements Alignment**:
- FR-006: "System MUST recalculate overdue status when the application loads or refreshes" ✅
- SC-004: "Overdue status updates immediately (within 100ms) when user actions change todo completion status or due date" ✅

**When to Reconsider**:
- If requirement changes to show "live" overdue status in a long-running session (e.g., user leaves app open overnight and todos should automatically become overdue at midnight)
- Current requirement: "recalculate on app load/refresh" is already satisfied by React's mount behavior

---

### 5. Conditional CSS Classes for Overdue Styling

**Question**: What is the best practice for applying conditional CSS classes for overdue styling?

**Decision**: Dynamic className with template literals, CSS variables in `theme.css` for colors

**Rationale**:
- **Existing Pattern**: TodoCard already uses conditional classes for completed state (e.g., `className="todo-card completed"`)
- **Theme Compatibility**: Project uses CSS variables for theming (light/dark modes)—adding `--danger-color` fits perfectly
- **Maintainability**: Theme-aware colors centralized in `theme.css`, not scattered across components
- **Performance**: String concatenation is negligible performance cost vs CSS Modules bundler overhead
- **Consistency**: Matches existing codebase patterns in TodoCard.js

**Alternatives Considered**:
- **CSS Modules**: Adds build complexity, generates hashed classnames, overkill for single conditional class
- **Inline styles**: Breaks theme system, harder to maintain, no pseudo-selectors or hover states, not accessible
- **classnames library**: Unnecessary dependency for simple ternary operators

**Implementation Example**:
```javascript
// TodoCard.js
const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`.trim();

return (
  <div className={cardClassName}>
    {todoIsOverdue && <span className="overdue-icon" role="img" aria-label="Overdue">⏰</span>}
    <div className="todo-content">
      <h3 className="todo-title">{todo.title}</h3>
      {todo.dueDate && <p className="todo-due-date">Due: {formatDate(todo.dueDate)}</p>}
    </div>
  </div>
);
```

```css
/* App.css or theme.css */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
  background-color: rgba(198, 40, 40, 0.05); /* Light red tint for light mode */
}

[data-theme="dark"] .todo-card.overdue {
  background-color: rgba(239, 83, 80, 0.1); /* Adjusted tint for dark mode */
}

.todo-card.overdue .todo-title {
  color: var(--danger-color);
  font-weight: 600;
}

.todo-card.overdue .todo-due-date {
  color: var(--danger-color);
  font-weight: 600;
}

.overdue-icon {
  font-size: 20px;
  margin-right: 8px;
}
```

**Accessibility Considerations**:
- Use `role="img"` and `aria-label` for icon to ensure screen readers announce "Overdue"
- Danger colors (#c62828 light, #ef5350 dark) meet WCAG AA contrast requirements
- Visual indicator combines color + icon + text styling (not relying on color alone)

---

## Performance Summary

**Expected Performance** (worst case: 100 todos):
- Date comparison per todo: ~0.01ms
- `useMemo` prevents recalculation on unrelated re-renders
- Total overhead: <2ms for all overdue checks across 100 todos
- **Result**: ✅ Easily meets <100ms constraint from SC-004

**Memory Impact**:
- One utility function: ~200 bytes
- No additional state, intervals, or listeners
- Negligible memory footprint

---

## Implementation Checklist

Based on research findings, implementation will proceed as follows:

### Phase 1: Core Implementation
1. ✅ Create `src/utils/dateUtils.js` with `isOverdue(dueDateString, completed)` function
2. ✅ Add unit tests for `isOverdue` covering edge cases:
   - No due date → not overdue
   - Completed todo → not overdue (regardless of date)
   - Due date is today → not overdue
   - Due date is tomorrow → not overdue
   - Due date is yesterday → overdue
   - Due date is far past → overdue

### Phase 2: Component Integration
3. ✅ Update `TodoCard.js`:
   - Import `isOverdue` utility
   - Add `useMemo` for `todoIsOverdue` calculation
   - Update `className` to include `overdue` class when applicable
   - Add clock icon (⏰) when overdue

4. ✅ Add `.overdue` styles to `App.css` or `theme.css`:
   - Use `--danger-color` CSS variable for theme compatibility
   - Border, background tint, text color styling
   - Dark mode adjustments

### Phase 3: Testing & Validation
5. ✅ Add integration tests to `TodoCard.test.js`:
   - Verify overdue todos display danger-colored text and border
   - Verify non-overdue todos do not have overdue styling
   - Verify completed overdue todos do not show overdue indicator

6. ✅ Update `TodoList.test.js`:
   - Verify multiple overdue todos render correctly in list
   - Verify overdue status updates when due date changes
   - Verify overdue status disappears when todo marked complete

7. ✅ Manual testing:
   - Test in light and dark themes
   - Verify accessibility (screen reader, keyboard navigation)
   - Test with todos having various due dates (past, today, future, none)

---

## Constitution Alignment

This implementation aligns with all constitutional principles:

- ✅ **I. Code Quality & Maintainability**: 
  - DRY: Single utility function, no repeated date logic
  - KISS: Simple 5-line function, no complex libraries
  - SOLID: Single responsibility (date utility), pure function for testability

- ✅ **II. Test-First Development**: 
  - Unit tests for utility function
  - Integration tests for component behavior
  - Target: 80%+ coverage maintained

- ✅ **III. Monorepo Structure**: 
  - Changes isolated to `packages/frontend/src/`
  - Follows existing file organization patterns
  - No backend modifications needed

- ✅ **IV. UI/UX Consistency**: 
  - Uses danger colors from UI guidelines (#c62828/#ef5350)
  - Follows Material Design principles (color + icon)
  - 8px spacing maintained
  - WCAG AA accessibility compliance

- ✅ **V. Simplicity & Single Responsibility**: 
  - Focused feature: visual indicator only
  - No new data storage or backend changes
  - Leverages existing todo entity
  - No unnecessary abstractions or libraries

---

## Open Questions (None)

All technical questions resolved during research phase.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** to document:
- Data model (confirm no changes to Todo entity)
- API contracts (confirm no new endpoints needed)
- Component contracts (TodoCard, TodoList interfaces)
- Quickstart guide for developers
