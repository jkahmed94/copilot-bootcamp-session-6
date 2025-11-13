# Quickstart Guide: Overdue Todo Items Visual Indicator

**Feature**: 001-overdue-todos  
**Date**: 2025-11-13  
**Target Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions to implement visual indicators for overdue todo items. The feature is **frontend-only** and requires no backend changes.

**Estimated Time**: 2-3 hours (including testing)

---

## Prerequisites

- Node.js 16+ installed
- npm 7+ installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with React hooks (`useMemo`)
- Understanding of the existing TodoCard component

---

## Quick Summary

**What's Being Built**:
- A utility function that determines if a todo is overdue
- Visual styling (red text, border, icon) for overdue todos
- Automatic recalculation when todo status or due date changes

**Files to Modify**:
- ✅ Create: `packages/frontend/src/utils/dateUtils.js`
- ✅ Create: `packages/frontend/src/utils/__tests__/dateUtils.test.js`
- ✅ Modify: `packages/frontend/src/components/TodoCard.js`
- ✅ Modify: `packages/frontend/src/components/__tests__/TodoCard.test.js`
- ✅ Modify: `packages/frontend/src/App.css` (or `src/styles/theme.css`)
- ✅ Extend: `packages/frontend/src/components/__tests__/TodoList.test.js`

**Files NOT Modified**:
- ❌ Backend files (no changes needed)
- ❌ TodoList.js (verification only, no code changes)
- ❌ Todo data model (overdue is derived)

---

## Step-by-Step Implementation

### Step 1: Create Date Utility Function (15 minutes)

**File**: `packages/frontend/src/utils/dateUtils.js`

```javascript
/**
 * Determines if a todo item is overdue based on its due date and completion status.
 * Uses date-only comparison (ignores time component).
 * 
 * @param {string|null|undefined} dueDateString - ISO 8601 date string (YYYY-MM-DD) or null/undefined
 * @param {boolean} completed - Whether the todo is marked as complete
 * @returns {boolean} True if todo is overdue (past due date and not completed), false otherwise
 */
export function isOverdue(dueDateString, completed) {
  // Rule 1: If no due date, never overdue
  if (!dueDateString) {
    return false;
  }
  
  // Rule 2: If completed, never overdue (regardless of due date)
  if (completed) {
    return false;
  }
  
  // Rule 3: Date-only comparison (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  
  const dueDate = new Date(dueDateString);
  
  // Validate date is parseable
  if (isNaN(dueDate.getTime())) {
    return false; // Invalid date, fail gracefully
  }
  
  dueDate.setHours(0, 0, 0, 0); // Normalize to midnight
  
  // Rule 4: Overdue if due date is strictly before today
  return dueDate < today;
}
```

**Verification**:
- Function is pure (no side effects)
- Handles all edge cases (null, completed, invalid dates)
- Returns boolean consistently

---

### Step 2: Write Unit Tests for Date Utility (30 minutes)

**File**: `packages/frontend/src/utils/__tests__/dateUtils.test.js`

```javascript
import { isOverdue } from '../dateUtils';

describe('isOverdue', () => {
  describe('Edge Cases - Returns False', () => {
    it('returns false when dueDate is null', () => {
      expect(isOverdue(null, false)).toBe(false);
    });

    it('returns false when dueDate is undefined', () => {
      expect(isOverdue(undefined, false)).toBe(false);
    });

    it('returns false when todo is completed, regardless of due date', () => {
      expect(isOverdue('2020-01-01', true)).toBe(false);
      expect(isOverdue('1990-01-01', true)).toBe(false);
    });

    it('returns false for invalid date strings', () => {
      expect(isOverdue('invalid-date', false)).toBe(false);
      expect(isOverdue('2025-13-45', false)).toBe(false);
      expect(isOverdue('not-a-date', false)).toBe(false);
    });
  });

  describe('Date Comparisons', () => {
    it('returns false when dueDate is today', () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      expect(isOverdue(today, false)).toBe(false);
    });

    it('returns false when dueDate is in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(isOverdue(tomorrowStr, false)).toBe(false);

      const farFuture = '2099-12-31';
      expect(isOverdue(farFuture, false)).toBe(false);
    });

    it('returns true when dueDate is in the past and not completed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(isOverdue(yesterdayStr, false)).toBe(true);

      const farPast = '2020-01-01';
      expect(isOverdue(farPast, false)).toBe(true);
    });
  });

  describe('Date-Only Comparison (Ignore Time)', () => {
    it('ignores time component when comparing dates', () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Add various times - should still not be overdue (today's date)
      expect(isOverdue(today + 'T00:00:00Z', false)).toBe(false);
      expect(isOverdue(today + 'T12:30:45Z', false)).toBe(false);
      expect(isOverdue(today + 'T23:59:59Z', false)).toBe(false);
    });

    it('treats dates as overdue starting at midnight the next day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Any time on yesterday's date should be overdue today
      expect(isOverdue(yesterdayStr + 'T00:00:00Z', false)).toBe(true);
      expect(isOverdue(yesterdayStr + 'T23:59:59Z', false)).toBe(true);
    });
  });

  describe('Combined Conditions', () => {
    it('returns false for past due date when completed', () => {
      expect(isOverdue('2020-01-01', true)).toBe(false);
    });

    it('returns false for future due date when not completed', () => {
      expect(isOverdue('2099-12-31', false)).toBe(false);
    });

    it('returns true for past due date when not completed', () => {
      expect(isOverdue('2020-01-01', false)).toBe(true);
    });
  });
});
```

**Run Tests**:
```bash
npm test -- dateUtils.test.js
```

**Expected Result**: All tests pass ✅

---

### Step 3: Update TodoCard Component (30 minutes)

**File**: `packages/frontend/src/components/TodoCard.js`

**Changes**:

1. **Import the utility and useMemo**:
```javascript
import React, { useMemo } from 'react';
import { isOverdue } from '../utils/dateUtils';
```

2. **Add useMemo for overdue calculation** (inside component, before return):
```javascript
function TodoCard({ todo, onToggle, onEdit, onDelete, isLoading }) {
  // Calculate overdue status (memoized for performance)
  const todoIsOverdue = useMemo(
    () => isOverdue(todo.dueDate, todo.completed),
    [todo.dueDate, todo.completed]
  );
  
  // Update className to include overdue class
  const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`.trim();
  
  // ... rest of component
}
```

3. **Add clock icon to due date display** (within JSX):
```javascript
{todo.dueDate && (
  <p className="todo-due-date">
    {todoIsOverdue && (
      <span className="overdue-icon" role="img" aria-label="Overdue">
        ⏰
      </span>
    )}
    Due: {formatDate(todo.dueDate)}
  </p>
)}
```

**Complete Example** (key sections):
```javascript
import React, { useMemo } from 'react';
import { isOverdue } from '../utils/dateUtils';

function TodoCard({ todo, onToggle, onEdit, onDelete, isLoading }) {
  // Calculate overdue status
  const todoIsOverdue = useMemo(
    () => isOverdue(todo.dueDate, todo.completed),
    [todo.dueDate, todo.completed]
  );
  
  const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`.trim();
  
  return (
    <div className={cardClassName}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        disabled={isLoading}
      />
      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>
        {todo.dueDate && (
          <p className="todo-due-date">
            {todoIsOverdue && (
              <span className="overdue-icon" role="img" aria-label="Overdue">
                ⏰
              </span>
            )}
            Due: {todo.dueDate}
          </p>
        )}
      </div>
      <div className="todo-actions">
        <button onClick={() => onEdit(todo.id)} disabled={isLoading}>
          Edit
        </button>
        <button onClick={() => onDelete(todo.id)} disabled={isLoading}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TodoCard;
```

---

### Step 4: Add Overdue Styles (15 minutes)

**File**: `packages/frontend/src/App.css` (or `src/styles/theme.css`)

**Add CSS Variables** (if not already defined):
```css
:root {
  --danger-color: #c62828; /* Light mode red */
}

[data-theme="dark"] {
  --danger-color: #ef5350; /* Dark mode red */
}
```

**Add Overdue Styles**:
```css
/* Overdue todo card styling */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
  background-color: rgba(198, 40, 40, 0.05); /* Light red tint */
}

/* Dark mode adjustments */
[data-theme="dark"] .todo-card.overdue {
  background-color: rgba(239, 83, 80, 0.1); /* Darker red tint */
}

/* Overdue text styling */
.todo-card.overdue .todo-title {
  color: var(--danger-color);
  font-weight: 600;
}

.todo-card.overdue .todo-due-date {
  color: var(--danger-color);
  font-weight: 600;
}

/* Overdue icon styling */
.overdue-icon {
  font-size: 20px;
  margin-right: 8px;
  display: inline-block;
  vertical-align: middle;
}

/* Ensure completed overdue todos don't show styling conflict */
.todo-card.completed.overdue .todo-title {
  text-decoration: line-through;
  opacity: 0.6;
  color: var(--text-secondary); /* Override danger color for completed */
}
```

**Verification**:
- Check contrast ratios meet WCAG AA (use browser DevTools)
- Test in both light and dark modes

---

### Step 5: Write Component Tests (45 minutes)

**File**: `packages/frontend/src/components/__tests__/TodoCard.test.js`

**Add Tests**:
```javascript
import { render, screen } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard - Overdue Indicator', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Overdue Styling', () => {
    it('displays overdue styling when todo is overdue', () => {
      const overdueTodo = {
        id: '1',
        title: 'Overdue Task',
        dueDate: '2020-01-01', // Past date
        completed: false,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container } = render(<TodoCard todo={overdueTodo} {...mockHandlers} />);
      
      // Check overdue class applied
      expect(container.querySelector('.todo-card.overdue')).toBeInTheDocument();
      
      // Check clock icon present
      expect(screen.getByLabelText('Overdue')).toBeInTheDocument();
      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('does not display overdue styling for future due date', () => {
      const futureTodo = {
        id: '2',
        title: 'Future Task',
        dueDate: '2099-12-31',
        completed: false,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container } = render(<TodoCard todo={futureTodo} {...mockHandlers} />);
      
      expect(container.querySelector('.overdue')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('does not display overdue styling for todos without due date', () => {
      const noDueDateTodo = {
        id: '3',
        title: 'No Due Date Task',
        dueDate: null,
        completed: false,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container } = render(<TodoCard todo={noDueDateTodo} {...mockHandlers} />);
      
      expect(container.querySelector('.overdue')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('does not display overdue styling for completed todos with past due date', () => {
      const completedOverdueTodo = {
        id: '4',
        title: 'Completed Overdue Task',
        dueDate: '2020-01-01',
        completed: true,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container } = render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} />);
      
      expect(container.querySelector('.overdue')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('removes overdue styling when todo is marked complete', () => {
      const overdueTodo = {
        id: '5',
        title: 'Task',
        dueDate: '2020-01-01',
        completed: false,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container, rerender } = render(<TodoCard todo={overdueTodo} {...mockHandlers} />);
      
      // Initially overdue
      expect(container.querySelector('.overdue')).toBeInTheDocument();
      
      // Mark as complete
      rerender(<TodoCard todo={{ ...overdueTodo, completed: true }} {...mockHandlers} />);
      
      // Overdue styling removed
      expect(container.querySelector('.overdue')).not.toBeInTheDocument();
    });

    it('adds overdue styling when due date changed to past', () => {
      const futureTodo = {
        id: '6',
        title: 'Task',
        dueDate: '2099-12-31',
        completed: false,
        createdAt: '2020-01-01T00:00:00Z'
      };

      const { container, rerender } = render(<TodoCard todo={futureTodo} {...mockHandlers} />);
      
      // Initially not overdue
      expect(container.querySelector('.overdue')).not.toBeInTheDocument();
      
      // Change due date to past
      rerender(<TodoCard todo={{ ...futureTodo, dueDate: '2020-01-01' }} {...mockHandlers} />);
      
      // Overdue styling added
      expect(container.querySelector('.overdue')).toBeInTheDocument();
    });
  });
});
```

**Run Tests**:
```bash
npm test -- TodoCard.test.js
```

---

### Step 6: Add Integration Tests (20 minutes)

**File**: `packages/frontend/src/components/__tests__/TodoList.test.js`

**Add Tests**:
```javascript
describe('TodoList - Overdue Integration', () => {
  it('renders multiple overdue and non-overdue todos correctly', () => {
    const todos = [
      { id: '1', title: 'Overdue 1', dueDate: '2020-01-01', completed: false, createdAt: '2020-01-01T00:00:00Z' },
      { id: '2', title: 'Not Overdue', dueDate: '2099-12-31', completed: false, createdAt: '2020-01-01T00:00:00Z' },
      { id: '3', title: 'Overdue 2', dueDate: '2020-06-01', completed: false, createdAt: '2020-01-01T00:00:00Z' },
      { id: '4', title: 'Completed Overdue', dueDate: '2020-01-01', completed: true, createdAt: '2020-01-01T00:00:00Z' }
    ];

    const mockHandlers = {
      onToggle: jest.fn(),
      onEdit: jest.fn(),
      onDelete: jest.fn()
    };

    const { container } = render(<TodoList todos={todos} {...mockHandlers} />);
    
    // Should have exactly 2 overdue todos (ids 1 and 3)
    const overdueTodos = container.querySelectorAll('.todo-card.overdue');
    expect(overdueTodos).toHaveLength(2);
    
    // Verify specific overdue todos
    expect(screen.getByText('Overdue 1').closest('.todo-card')).toHaveClass('overdue');
    expect(screen.getByText('Overdue 2').closest('.todo-card')).toHaveClass('overdue');
    
    // Verify non-overdue todos
    expect(screen.getByText('Not Overdue').closest('.todo-card')).not.toHaveClass('overdue');
    expect(screen.getByText('Completed Overdue').closest('.todo-card')).not.toHaveClass('overdue');
  });
});
```

---

### Step 7: Manual Testing (20 minutes)

**Test Scenarios**:

1. **Create todos with various due dates**:
   - Past date (should show overdue)
   - Today (should NOT show overdue)
   - Future date (should NOT show overdue)
   - No due date (should NOT show overdue)

2. **Test completion toggle**:
   - Mark overdue todo complete → overdue indicator disappears
   - Mark completed overdue todo incomplete → overdue indicator reappears

3. **Test date editing**:
   - Change overdue todo date to future → indicator disappears
   - Change future todo date to past → indicator appears
   - Remove due date from overdue todo → indicator disappears

4. **Test theme switching**:
   - Switch to dark mode → danger colors adjust correctly
   - Switch to light mode → danger colors adjust correctly

5. **Test accessibility**:
   - Use screen reader → clock icon announces "Overdue"
   - Tab navigation → all interactive elements accessible
   - Check color contrast → meets WCAG AA

**Manual Test Checklist**:
```
[ ] Overdue todos show red text, red border, clock icon
[ ] Non-overdue todos show normal styling
[ ] Completed overdue todos don't show overdue indicator
[ ] Marking overdue todo complete removes indicator immediately
[ ] Changing due date updates indicator immediately
[ ] App reopened next day shows correct overdue status
[ ] Dark mode danger colors are visible and accessible
[ ] Light mode danger colors are visible and accessible
[ ] Screen reader announces overdue status
[ ] No console errors or warnings
```

---

## Running the Feature

### Development Mode

```bash
# Start both frontend and backend
npm start

# Or start frontend only
npm run start:frontend
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- dateUtils.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Verification Checklist

**Before Committing**:

- [ ] All unit tests pass (`dateUtils.test.js`)
- [ ] All component tests pass (`TodoCard.test.js`, `TodoList.test.js`)
- [ ] Code coverage ≥80% for new code
- [ ] No ESLint errors or warnings
- [ ] Manual testing completed (see checklist above)
- [ ] Visual styling matches UI guidelines (danger colors)
- [ ] Accessibility requirements met (WCAG AA, screen reader)
- [ ] Both light and dark modes tested
- [ ] No console errors in browser DevTools
- [ ] Performance: Overdue calculation <100ms (verify in DevTools)

---

## Troubleshooting

### Issue: "isOverdue is not defined"

**Solution**: Ensure import statement is correct:
```javascript
import { isOverdue } from '../utils/dateUtils';
```

### Issue: Overdue styling not applying

**Solution**: Check className logic and CSS specificity:
```javascript
// Correct:
const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`.trim();

// Incorrect (missing spaces):
const cardClassName = `todo-card${todo.completed ? 'completed' : ''}${todoIsOverdue ? 'overdue' : ''}`;
```

### Issue: Tests failing with "Cannot find module 'utils/dateUtils'"

**Solution**: Check relative path in import (use `../utils/dateUtils` from components folder)

### Issue: Overdue status not updating after marking complete

**Solution**: Ensure `useMemo` dependencies include both `dueDate` and `completed`:
```javascript
const todoIsOverdue = useMemo(
  () => isOverdue(todo.dueDate, todo.completed),
  [todo.dueDate, todo.completed] // Must include both!
);
```

### Issue: Clock icon not visible

**Solution**: Check emoji rendering and add fallback:
```javascript
{todoIsOverdue && (
  <span className="overdue-icon" role="img" aria-label="Overdue">
    ⏰ {/* If emoji doesn't render, use SVG or icon library */}
  </span>
)}
```

---

## Performance Notes

**Expected Performance** (100 todos):
- Date comparison per todo: ~0.01ms
- `useMemo` prevents recalculation on unrelated re-renders
- Total: <2ms for all overdue checks
- ✅ Meets <100ms requirement

**Optimization Tips**:
- `useMemo` is critical for large todo lists
- Don't remove dependencies from `useMemo` array (will cause stale data)
- Date normalization is fast, no need for further optimization

---

## Next Steps

After implementation:

1. ✅ Create pull request with clear description
2. ✅ Request code review from team
3. ✅ Address review feedback
4. ✅ Merge to main branch after approval
5. ✅ Monitor for any production issues

---

## Support & Resources

- **Feature Spec**: `/specs/001-overdue-todos/spec.md`
- **Research**: `/specs/001-overdue-todos/research.md`
- **Data Model**: `/specs/001-overdue-todos/data-model.md`
- **Contracts**: `/specs/001-overdue-todos/contracts/`
- **UI Guidelines**: `/docs/ui-guidelines.md`
- **Testing Guidelines**: `/docs/testing-guidelines.md`
- **Coding Guidelines**: `/docs/coding-guidelines.md`

**Questions?** Refer to the feature spec or reach out to the team.
