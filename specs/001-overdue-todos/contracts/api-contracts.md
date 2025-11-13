# API Contracts: Overdue Todo Items Visual Indicator

**Feature**: 001-overdue-todos  
**Date**: 2025-11-13  
**Phase**: Phase 1 - Design

## Overview

This feature **does not require any backend API changes**. The overdue status is calculated entirely on the frontend using existing API responses. This document confirms the existing API contracts remain unchanged.

---

## Existing API Endpoints (No Modifications)

### GET /api/todos

**Purpose**: Retrieve all todo items for the user

**Request**:
```http
GET /api/todos HTTP/1.1
Host: localhost:3030
```

**Response** (200 OK):
```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "dueDate": "2025-11-15",
      "completed": false,
      "createdAt": "2025-11-13T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Finish project report",
      "dueDate": "2025-11-10",
      "completed": false,
      "createdAt": "2025-11-12T14:20:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Call dentist",
      "dueDate": null,
      "completed": true,
      "createdAt": "2025-11-11T09:15:00.000Z"
    }
  ]
}
```

**Notes**:
- Frontend will calculate `isOverdue` for each todo client-side
- No `isOverdue` field in response (derived property)
- Response format unchanged

---

### POST /api/todos

**Purpose**: Create a new todo item

**Request**:
```http
POST /api/todos HTTP/1.1
Host: localhost:3030
Content-Type: application/json

{
  "title": "New todo item",
  "dueDate": "2025-11-20"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "New todo item",
  "dueDate": "2025-11-20",
  "completed": false,
  "createdAt": "2025-11-13T16:45:00.000Z"
}
```

**Notes**:
- `completed` defaults to `false` (backend behavior)
- `dueDate` is optional (can be `null`)
- No API changes needed for overdue feature

---

### PUT /api/todos/:id

**Purpose**: Update an existing todo item

**Request**:
```http
PUT /api/todos/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3030
Content-Type: application/json

{
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "dueDate": "2025-11-15",
  "completed": true,
  "createdAt": "2025-11-13T10:30:00.000Z"
}
```

**Update Examples**:

1. **Mark as complete** (removes overdue indicator):
```json
{ "completed": true }
```

2. **Change due date to future** (removes overdue indicator):
```json
{ "dueDate": "2025-12-01" }
```

3. **Remove due date** (removes overdue indicator):
```json
{ "dueDate": null }
```

4. **Change due date to past** (adds overdue indicator if not complete):
```json
{ "dueDate": "2025-11-10" }
```

**Notes**:
- Partial updates supported (only send changed fields)
- Frontend recalculates `isOverdue` upon receiving response
- No backend validation for overdue logic needed

---

### DELETE /api/todos/:id

**Purpose**: Delete a todo item

**Request**:
```http
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3030
```

**Response** (204 No Content):
```
(Empty response body)
```

**Notes**:
- No changes needed for overdue feature
- Frontend removes todo from state (overdue calculation no longer relevant)

---

## Frontend-Backend Data Flow

### Scenario 1: Loading Todos on App Start

```
1. Frontend → GET /api/todos
2. Backend → Returns todos[] (with dueDate, completed fields)
3. Frontend → For each todo:
   - Calculate isOverdue(todo.dueDate, todo.completed)
   - Render TodoCard with/without overdue styling
```

**No API Changes**: ✅

---

### Scenario 2: Marking Overdue Todo as Complete

```
1. User clicks checkbox on overdue todo
2. Frontend → PUT /api/todos/:id { completed: true }
3. Backend → Returns updated todo (completed: true)
4. Frontend → Receives response
   - Recalculates isOverdue(todo.dueDate, true) → false
   - TodoCard removes overdue styling (FR-007)
```

**No API Changes**: ✅

---

### Scenario 3: Changing Due Date of Overdue Todo

```
1. User edits overdue todo, changes dueDate to future
2. Frontend → PUT /api/todos/:id { dueDate: "2025-12-01" }
3. Backend → Returns updated todo (dueDate: "2025-12-01")
4. Frontend → Receives response
   - Recalculates isOverdue("2025-12-01", false) → false
   - TodoCard removes overdue styling (FR-008)
```

**No API Changes**: ✅

---

### Scenario 4: Creating Todo with Past Due Date

```
1. User creates todo with past dueDate (edge case)
2. Frontend → POST /api/todos { title: "...", dueDate: "2020-01-01" }
3. Backend → Returns new todo (dueDate: "2020-01-01", completed: false)
4. Frontend → Receives response
   - Calculates isOverdue("2020-01-01", false) → true
   - TodoCard renders with overdue styling
```

**No API Changes**: ✅

---

## Error Handling (Unchanged)

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Title is required"
}
```

**Frontend Handling**: Display error, do not calculate overdue status

---

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Todo not found"
}
```

**Frontend Handling**: Display error, remove todo from state

---

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

**Frontend Handling**: Display error, retry or inform user

**Notes**: Error responses do not affect overdue calculation (frontend gracefully handles missing/invalid data)

---

## Performance Characteristics

### Network Impact

| Operation | Network Calls | Additional Overhead |
|-----------|---------------|---------------------|
| Load todos | 1 GET | **0 bytes** (no new fields) |
| Toggle complete | 1 PUT | **0 bytes** (existing field) |
| Update due date | 1 PUT | **0 bytes** (existing field) |
| Create todo | 1 POST | **0 bytes** (existing fields) |

**Total Network Impact**: **Zero** ✅

### Backend Impact

| Operation | Backend Logic Changes | Performance Impact |
|-----------|----------------------|---------------------|
| GET /api/todos | **None** | **Zero** |
| POST /api/todos | **None** | **Zero** |
| PUT /api/todos/:id | **None** | **Zero** |
| DELETE /api/todos/:id | **None** | **Zero** |

**Total Backend Impact**: **Zero** ✅

---

## Versioning & Backward Compatibility

### API Version
- **Current**: v1 (implicit, no versioning in URLs)
- **Changes**: None
- **Backward Compatibility**: Full ✅

### Client Compatibility
- **Old clients** (before overdue feature): Continue working unchanged ✅
- **New clients** (with overdue feature): Backward compatible with existing API ✅

### Migration Path
- **Required**: None
- **Rollback**: Frontend-only rollback (revert component changes, no backend changes to undo)

---

## Testing Requirements

### API Contract Tests (No New Tests Needed)

**Existing tests remain valid**:
- GET /api/todos returns correct structure ✅
- POST /api/todos creates todo with defaults ✅
- PUT /api/todos/:id updates fields ✅
- DELETE /api/todos/:id removes todo ✅

**No new API tests needed** because:
- Backend behavior unchanged
- `isOverdue` is frontend-only calculation
- Existing tests already validate dueDate and completed fields

### Integration Tests (Frontend Only)

**New tests in frontend**:
```javascript
describe('Todo API Integration - Overdue Feature', () => {
  it('calculates overdue status after fetching todos', async () => {
    mockAPI.getTodos.mockResolvedValue([
      { id: '1', title: 'Test', dueDate: '2020-01-01', completed: false }
    ]);
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByLabelText('Overdue')).toBeInTheDocument();
    });
  });

  it('removes overdue styling after marking complete via API', async () => {
    // Setup overdue todo
    mockAPI.updateTodo.mockResolvedValue({
      id: '1', title: 'Test', dueDate: '2020-01-01', completed: true
    });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });
  });
});
```

---

## Summary

### API Changes Required: **ZERO** ✅

| Endpoint | Changes | Reason |
|----------|---------|--------|
| GET /api/todos | None | Overdue calculated client-side |
| POST /api/todos | None | Overdue calculated client-side |
| PUT /api/todos/:id | None | Overdue calculated client-side |
| DELETE /api/todos/:id | None | Overdue irrelevant after deletion |

### Benefits of Client-Side Calculation

1. **Zero backend changes** → Faster implementation, no deployment coordination
2. **No database changes** → Zero migration risk
3. **Reduced server load** → Calculation offloaded to client
4. **Real-time updates** → Immediate UI response without server round-trip
5. **Offline capability** → Overdue status computes even if backend temporarily unavailable

### Constraints Met

- ✅ No new API endpoints
- ✅ No new response fields
- ✅ No backend logic changes
- ✅ Full backward compatibility
- ✅ Zero network overhead

This design aligns with **Constitution Principle V: Simplicity** by minimizing changes and leveraging existing infrastructure.
