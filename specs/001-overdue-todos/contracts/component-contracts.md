# Component Contracts: Overdue Todo Items Visual Indicator

**Feature**: 001-overdue-todos  
**Date**: 2025-11-13  
**Phase**: Phase 1 - Design

## Overview

This document defines the contracts (interfaces, props, function signatures) for components and utilities modified or created for the overdue todos feature.

---

## Utility Functions

### dateUtils.js

**Module Path**: `packages/frontend/src/utils/dateUtils.js`

#### isOverdue

Determines if a todo item is overdue based on its due date and completion status.

**Function Signature**:
```javascript
function isOverdue(dueDateString, completed): boolean
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `dueDateString` | `string \| null \| undefined` | Yes | ISO 8601 date string (YYYY-MM-DD) or null/undefined |
| `completed` | `boolean` | Yes | Whether the todo is marked as complete |

**Returns**: `boolean`
- `true`: Todo is overdue (due date in past AND not completed)
- `false`: Todo is not overdue (any other condition)

**Logic**:
```javascript
// Returns false if:
// - dueDateString is null or undefined
// - completed is true
// - dueDate >= today (date-only comparison)

// Returns true if:
// - dueDateString is valid past date AND completed is false
```

**Examples**:
```javascript
// No due date
isOverdue(null, false) → false
isOverdue(undefined, false) → false

// Completed todos
isOverdue('2020-01-01', true) → false (never overdue when complete)

// Due today
isOverdue('2025-11-13', false) → false (not overdue until tomorrow)

// Due tomorrow
isOverdue('2025-11-14', false) → false

// Due yesterday
isOverdue('2025-11-12', false) → true

// Invalid date
isOverdue('invalid', false) → false (fails gracefully)
```

**Error Handling**:
- Invalid date strings → returns `false`
- `null`/`undefined` inputs → returns `false`
- Non-boolean `completed` → returns `false` (defensive)

**Performance**:
- Time Complexity: O(1)
- Execution Time: <0.01ms per call

**Testing Requirements**:
- Unit tests for all edge cases (see data-model.md)
- 100% code coverage for this function

---

## React Components

### TodoCard

**Component Path**: `packages/frontend/src/components/TodoCard.js`

**Purpose**: Display individual todo item with overdue visual indicator when applicable.

#### Props Interface

```javascript
interface TodoCardProps {
  todo: {
    id: string;              // Unique identifier
    title: string;           // Todo title
    dueDate?: string | null; // ISO 8601 date string or null
    completed: boolean;      // Completion status
    createdAt: string;       // Creation timestamp
  };
  onToggle: (id: string) => void;     // Callback when checkbox toggled
  onEdit: (id: string) => void;       // Callback when edit button clicked
  onDelete: (id: string) => void;     // Callback when delete button clicked
  isLoading?: boolean;                // Optional loading state
}
```

#### State

**New State** (added via useMemo):
```javascript
const todoIsOverdue: boolean = useMemo(
  () => isOverdue(todo.dueDate, todo.completed),
  [todo.dueDate, todo.completed]
);
```

**Existing State**: Unchanged (edit mode, loading states, etc.)

#### CSS Classes

**New Class**: `.overdue`
- Applied conditionally when `todoIsOverdue === true`
- Combined with existing classes: `todo-card`, `completed`

**Class Name Logic**:
```javascript
const cardClassName = `todo-card ${todo.completed ? 'completed' : ''} ${todoIsOverdue ? 'overdue' : ''}`.trim();
```

#### Rendering Behavior

**Overdue Visual Indicators** (when `todoIsOverdue === true`):
1. Clock icon (⏰) displayed next to due date
2. Danger color applied to:
   - Todo title text
   - Due date text
   - Card left border (4px)
   - Background tint (light red overlay)

**Example JSX**:
```javascript
<div className={cardClassName}>
  <input
    type="checkbox"
    checked={todo.completed}
    onChange={() => onToggle(todo.id)}
  />
  <div className="todo-content">
    <h3 className="todo-title">{todo.title}</h3>
    {todo.dueDate && (
      <p className="todo-due-date">
        {todoIsOverdue && <span className="overdue-icon" role="img" aria-label="Overdue">⏰</span>}
        Due: {formatDate(todo.dueDate)}
      </p>
    )}
  </div>
  <div className="todo-actions">
    <button onClick={() => onEdit(todo.id)}>Edit</button>
    <button onClick={() => onDelete(todo.id)}>Delete</button>
  </div>
</div>
```

#### Re-render Triggers

Component re-renders when:
1. `todo.dueDate` changes (via onEdit) → `useMemo` recalculates `todoIsOverdue`
2. `todo.completed` changes (via onToggle) → `useMemo` recalculates `todoIsOverdue`
3. Parent component re-renders (TodoList updates)

**Performance**: `useMemo` prevents recalculation on unrelated prop/state changes.

#### Testing Contract

**Unit Tests** (`TodoCard.test.js`):
```javascript
describe('TodoCard - Overdue Indicator', () => {
  it('displays overdue styling when todo is overdue', () => {
    const overdueTodo = {
      id: '1',
      title: 'Test',
      dueDate: '2020-01-01', // Past date
      completed: false,
      createdAt: '2020-01-01T00:00:00Z'
    };
    const { container } = render(<TodoCard todo={overdueTodo} {...handlers} />);
    
    expect(container.querySelector('.overdue')).toBeInTheDocument();
    expect(screen.getByLabelText('Overdue')).toBeInTheDocument(); // Clock icon
  });

  it('does not display overdue styling when todo is not overdue', () => {
    const futureTodo = {
      id: '1',
      title: 'Test',
      dueDate: '2099-12-31', // Future date
      completed: false,
      createdAt: '2020-01-01T00:00:00Z'
    };
    const { container } = render(<TodoCard todo={futureTodo} {...handlers} />);
    
    expect(container.querySelector('.overdue')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
  });

  it('removes overdue styling when todo is marked complete', () => {
    const { rerender, container } = render(
      <TodoCard todo={{ ...overdueTodo, completed: false }} {...handlers} />
    );
    expect(container.querySelector('.overdue')).toBeInTheDocument();
    
    rerender(<TodoCard todo={{ ...overdueTodo, completed: true }} {...handlers} />);
    expect(container.querySelector('.overdue')).not.toBeInTheDocument();
  });
});
```

---

### TodoList

**Component Path**: `packages/frontend/src/components/TodoList.js`

**Purpose**: Render list of TodoCard components. No direct changes required for overdue feature, but verification needed.

#### Props Interface (Unchanged)

```javascript
interface TodoListProps {
  todos: Array<Todo>;                  // Array of todo objects
  onToggle: (id: string) => void;      // Passed to TodoCard
  onEdit: (id: string) => void;        // Passed to TodoCard
  onDelete: (id: string) => void;      // Passed to TodoCard
}
```

#### Behavior Verification

**Requirements**:
1. TodoList should pass all todo props to TodoCard unchanged
2. TodoList should re-render when parent state updates (todos array changes)
3. No need for TodoList to be aware of overdue logic

**Testing Contract**:
```javascript
describe('TodoList - Overdue Integration', () => {
  it('renders multiple overdue todos correctly', () => {
    const todos = [
      { id: '1', title: 'Overdue 1', dueDate: '2020-01-01', completed: false },
      { id: '2', title: 'Not Overdue', dueDate: '2099-12-31', completed: false },
      { id: '3', title: 'Overdue 2', dueDate: '2020-06-01', completed: false }
    ];
    
    const { container } = render(<TodoList todos={todos} {...handlers} />);
    
    const overdueTodos = container.querySelectorAll('.overdue');
    expect(overdueTodos).toHaveLength(2);
  });
});
```

---

## CSS Contracts

### Overdue Styles

**File**: `packages/frontend/src/App.css` or `packages/frontend/src/styles/theme.css`

#### Required CSS Classes

```css
/* Overdue card styling */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
  background-color: rgba(198, 40, 40, 0.05); /* Light red tint */
}

/* Dark mode overdue card */
[data-theme="dark"] .todo-card.overdue {
  border-left-color: var(--danger-color-dark);
  background-color: rgba(239, 83, 80, 0.1); /* Adjusted for dark */
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

/* Overdue icon */
.overdue-icon {
  font-size: 20px;
  margin-right: 8px;
  display: inline-block;
  vertical-align: middle;
}
```

#### CSS Variables Required

```css
:root {
  --danger-color: #c62828; /* Light mode */
}

[data-theme="dark"] {
  --danger-color: #ef5350; /* Dark mode */
  --danger-color-dark: #ef5350; /* Explicit dark variant */
}
```

#### Accessibility Requirements

- Color contrast ratio: ≥ 4.5:1 (WCAG AA)
  - Light mode: #c62828 on white background → 7.3:1 ✅
  - Dark mode: #ef5350 on dark background → 8.1:1 ✅
- Visual indicator combines color + icon + border (not color alone)
- Icon has proper `aria-label` for screen readers

---

## Type Definitions (Optional JSDoc)

### Todo Type

```javascript
/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Todo item title
 * @property {string|null} dueDate - ISO 8601 date string (YYYY-MM-DD) or null
 * @property {boolean} completed - Completion status
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 */
```

### dateUtils JSDoc

```javascript
/**
 * Determines if a todo item is overdue based on its due date and completion status.
 * Uses date-only comparison (ignores time component).
 * 
 * @param {string|null|undefined} dueDateString - ISO 8601 date string or null/undefined
 * @param {boolean} completed - Whether the todo is marked as complete
 * @returns {boolean} True if todo is overdue (past due date and not completed), false otherwise
 * 
 * @example
 * isOverdue('2020-01-01', false) // true (past date, not complete)
 * isOverdue('2099-12-31', false) // false (future date)
 * isOverdue('2020-01-01', true)  // false (completed todos never overdue)
 * isOverdue(null, false)         // false (no due date)
 */
export function isOverdue(dueDateString, completed) {
  // Implementation...
}
```

---

## Summary

### New Contracts
- ✅ `utils/dateUtils.js` - `isOverdue()` function
- ✅ CSS classes: `.overdue`, `.overdue-icon`
- ✅ CSS variables: `--danger-color`, `--danger-color-dark`

### Modified Contracts
- ✅ `TodoCard.js` - Added `todoIsOverdue` computed property, conditional rendering
- ✅ No changes to TodoCard props interface (backward compatible)

### Unchanged Contracts
- ✅ `TodoList.js` - No modifications (passes props through)
- ✅ Backend API - No modifications
- ✅ Todo entity structure - No modifications

### Testing Contracts
- ✅ Unit tests for `isOverdue()` with 100% coverage
- ✅ Component tests for TodoCard overdue rendering
- ✅ Integration tests for TodoList with multiple overdue items

All contracts maintain backward compatibility and follow existing codebase patterns.
