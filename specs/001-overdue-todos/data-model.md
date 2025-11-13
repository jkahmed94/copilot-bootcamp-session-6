# Data Model: Overdue Todo Items Visual Indicator

**Feature**: 001-overdue-todos  
**Date**: 2025-11-13  
**Phase**: Phase 1 - Design

## Overview

This feature does **not introduce any new data entities or modify existing data structures**. The overdue status is a **derived/calculated property** based on existing Todo entity fields. This document confirms the existing data model and clarifies how overdue status is computed.

## Existing Entities

### Todo Item

**Entity Name**: Todo  
**Storage**: Backend API (`packages/backend/src/services/todoService.js`)  
**No Modifications Required**: ✅

#### Attributes

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `id` | String | Yes | Unique identifier for the todo | Auto-generated UUID |
| `title` | String | Yes | Todo item title/description | Max 255 characters, non-empty |
| `dueDate` | String (ISO 8601) | No | Due date in YYYY-MM-DD format | Valid date string or null |
| `completed` | Boolean | Yes | Completion status | true or false, defaults to false |
| `createdAt` | String (ISO 8601) | Yes | Creation timestamp | Auto-generated on creation |

#### Relationships

None. Todo is a standalone entity in this single-user application.

#### State Transitions

```
[New Todo] → completed: false, dueDate: null or future date
           ↓
[Edit Due Date] → dueDate can be set/changed/removed
           ↓
[Mark Complete] → completed: true (overdue indicator disappears)
           ↓
[Mark Incomplete] → completed: false (overdue indicator may reappear if dueDate < today)
```

---

## Derived Properties

### Overdue Status

**Property Name**: `isOverdue` (computed, not stored)  
**Computation Location**: Frontend only (`packages/frontend/src/utils/dateUtils.js`)  
**Type**: Boolean

#### Calculation Logic

```javascript
function isOverdue(dueDateString, completed) {
  // Rule 1: If no due date, never overdue
  if (!dueDateString) return false;
  
  // Rule 2: If completed, never overdue (regardless of due date)
  if (completed) return false;
  
  // Rule 3: Date-only comparison (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);
  
  // Rule 4: Overdue if due date is strictly before today
  return dueDate < today;
}
```

#### Validation Rules

| Rule | Condition | Result |
|------|-----------|--------|
| FR-001 | `dueDate` is valid date string | Calculate comparison |
| FR-002 | `dueDate < today` AND `completed === false` | `isOverdue = true` |
| FR-003 | `completed === true` | `isOverdue = false` (always) |
| FR-004 | `dueDate === null` or `dueDate === undefined` | `isOverdue = false` |
| FR-010 | Date comparison | Ignore time, compare dates only at midnight |

#### Edge Cases Handled

| Scenario | Due Date | Completed | Current Date | Result | Rationale |
|----------|----------|-----------|--------------|--------|-----------|
| No due date | `null` | `false` | Any | `false` | Cannot be overdue without a due date (FR-004) |
| Completed overdue | `2025-11-10` | `true` | `2025-11-13` | `false` | Completed todos never show as overdue (FR-003) |
| Due today | `2025-11-13` | `false` | `2025-11-13` | `false` | Not overdue until tomorrow (date-only comparison) |
| Due tomorrow | `2025-11-14` | `false` | `2025-11-13` | `false` | Future date, not overdue |
| Due yesterday | `2025-11-12` | `false` | `2025-11-13` | `true` | Past date and incomplete, overdue |
| Midnight edge | `2025-11-13` | `false` | `2025-11-14 00:00:00` | `true` | Overdue as of midnight (FR-010) |

---

## Data Flow

### Read Operations (Existing, No Changes)

```
1. User loads app
   └─> Frontend: GET /api/todos
       └─> Backend: todoService.getTodos()
           └─> Returns: Array<Todo>
               └─> Frontend: Receives todos[]
```

### Overdue Calculation (New, Client-Side Only)

```
2. Frontend renders TodoList
   └─> For each todo in todos[]
       └─> TodoCard component receives todo prop
           └─> useMemo(() => isOverdue(todo.dueDate, todo.completed))
               └─> Returns: boolean (true if overdue)
                   └─> Renders with/without overdue styling
```

### Update Operations (Existing, No Changes to API)

```
3. User marks todo complete
   └─> Frontend: PUT /api/todos/:id { completed: true }
       └─> Backend: todoService.updateTodo(id, updates)
           └─> Returns: Updated Todo
               └─> Frontend: Re-renders TodoCard
                   └─> isOverdue(todo.dueDate, true) → false
                       └─> Overdue styling removed (FR-007)

4. User changes due date
   └─> Frontend: PUT /api/todos/:id { dueDate: "2025-11-20" }
       └─> Backend: todoService.updateTodo(id, updates)
           └─> Returns: Updated Todo
               └─> Frontend: Re-renders TodoCard
                   └─> isOverdue("2025-11-20", false) → false
                       └─> Overdue styling removed (FR-008)
```

---

## Performance Characteristics

### Computation Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `isOverdue()` | O(1) | Constant time, 2 date normalizations + 1 comparison |
| Per todo render | O(1) | `useMemo` caches result, only recalculates when `dueDate` or `completed` changes |
| Full list (100 todos) | O(n) | Linear with todo count, but each operation is <0.01ms |

### Memory Impact

| Component | Size | Notes |
|-----------|------|-------|
| `dateUtils.js` | ~200 bytes | Single pure function |
| Memoized results | ~8 bytes per todo | Boolean cached by `useMemo` |
| Total for 100 todos | ~1KB | Negligible memory footprint |

---

## Backend API (No Changes)

### Existing Endpoints Used

#### GET /api/todos
- **Response**: Array of Todo objects with all fields
- **No Changes**: Overdue calculation happens client-side

#### PUT /api/todos/:id
- **Request Body**: `{ title?, dueDate?, completed? }`
- **Response**: Updated Todo object
- **No Changes**: Backend remains unaware of overdue status

---

## Data Validation

### Frontend Validation (New)

```javascript
// In dateUtils.js
function isOverdue(dueDateString, completed) {
  // Validate inputs before calculation
  if (!dueDateString || typeof dueDateString !== 'string') return false;
  if (typeof completed !== 'boolean') return false;
  
  // Validate date is parseable
  const dueDate = new Date(dueDateString);
  if (isNaN(dueDate.getTime())) return false; // Invalid date
  
  // Proceed with calculation...
}
```

### Error Handling

| Error Scenario | Handling | Result |
|----------------|----------|--------|
| Invalid date string | Return `false` | Todo not marked as overdue, fails gracefully |
| `null`/`undefined` dueDate | Return `false` immediately | Expected behavior per FR-004 |
| Non-boolean `completed` | Return `false` | Defensive programming |
| Corrupted todo object | Return `false` | Prevents render crashes |

---

## Schema Diagram

```
┌─────────────────────────────────────┐
│          Todo Entity                │
│  (Backend: todoService.js)          │
├─────────────────────────────────────┤
│ id: String (UUID)                   │
│ title: String (required)            │
│ dueDate: String | null (ISO 8601)   │
│ completed: Boolean (default: false) │
│ createdAt: String (ISO 8601)        │
└─────────────────────────────────────┘
            │
            │ (No modifications)
            │
            ▼
┌─────────────────────────────────────┐
│   Derived Property (Frontend)       │
│  (utils/dateUtils.js)               │
├─────────────────────────────────────┤
│ isOverdue(dueDate, completed)       │
│ → Returns: Boolean                  │
│                                     │
│ Calculated on every render via:    │
│ useMemo in TodoCard component       │
└─────────────────────────────────────┘
```

---

## Migration & Compatibility

### Database Schema
- **Changes Required**: None ✅
- **Backward Compatibility**: Full ✅ (no schema changes)

### API Versioning
- **Changes Required**: None ✅
- **Backward Compatibility**: Full ✅ (no API changes)

### Frontend State
- **Changes Required**: Add `utils/dateUtils.js`, modify `TodoCard.js`
- **Backward Compatibility**: Full ✅ (existing todos work without changes)

---

## Testing Requirements

### Data Model Tests

#### Unit Tests (utils/dateUtils.test.js)
```javascript
describe('isOverdue', () => {
  it('returns false when dueDate is null', () => {
    expect(isOverdue(null, false)).toBe(false);
  });

  it('returns false when dueDate is undefined', () => {
    expect(isOverdue(undefined, false)).toBe(false);
  });

  it('returns false when todo is completed, regardless of due date', () => {
    expect(isOverdue('2020-01-01', true)).toBe(false);
  });

  it('returns false when dueDate is today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isOverdue(today, false)).toBe(false);
  });

  it('returns false when dueDate is in the future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    expect(isOverdue(tomorrowStr, false)).toBe(false);
  });

  it('returns true when dueDate is in the past and not completed', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    expect(isOverdue(yesterdayStr, false)).toBe(true);
  });

  it('handles invalid date strings gracefully', () => {
    expect(isOverdue('invalid-date', false)).toBe(false);
    expect(isOverdue('2025-13-45', false)).toBe(false);
  });

  it('ignores time component (date-only comparison)', () => {
    const today = new Date().toISOString().split('T')[0];
    // Add time to date string - should still not be overdue
    expect(isOverdue(today + 'T23:59:59Z', false)).toBe(false);
  });
});
```

#### Integration Tests (TodoCard.test.js)
- Verify overdue styling applied when `isOverdue` returns true
- Verify no overdue styling when `isOverdue` returns false
- Verify styling updates when `dueDate` or `completed` props change

---

## Summary

- **No new entities or database changes** ✅
- **No API modifications** ✅
- **Overdue status is derived** client-side from existing `dueDate` and `completed` fields ✅
- **Pure function** for calculation ensures testability and maintainability ✅
- **Performance optimized** with `useMemo` to prevent unnecessary recalculations ✅

This approach aligns with **Constitution Principle V: Simplicity** by avoiding unnecessary data storage and keeping the feature implementation minimal and focused.
