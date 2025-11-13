# Feature Specification: Overdue Todo Items Visual Indicator

**Feature Branch**: `001-overdue-todos`  
**Created**: 2025-11-13  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items - Users need a clear, visual way to identify which todos have not been completed by their due date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Identification of Overdue Todos (Priority: P1)

Users can instantly identify which todo items are overdue by visual indicators (color, icon, or styling) applied to todos whose due date has passed and are not yet completed.

**Why this priority**: This is the core value proposition of the feature. Without visual identification, users cannot quickly distinguish overdue items from current or future tasks, defeating the entire purpose of the feature.

**Independent Test**: Can be fully tested by creating todos with past due dates and verifying that overdue items display distinct visual styling that clearly differentiates them from non-overdue items.

**Acceptance Scenarios**:

1. **Given** I have a todo with a due date of yesterday and status is incomplete, **When** I view my todo list, **Then** the todo item displays with overdue visual indicator (distinct color/styling)
2. **Given** I have a todo with a due date of today and status is incomplete, **When** I view my todo list, **Then** the todo item does NOT display as overdue
3. **Given** I have a todo with a due date of yesterday but status is completed, **When** I view my todo list, **Then** the todo item does NOT display as overdue (completed items are never overdue)
4. **Given** I have a todo with a due date in the future, **When** I view my todo list, **Then** the todo item does NOT display as overdue
5. **Given** I have a todo with no due date set, **When** I view my todo list, **Then** the todo item does NOT display as overdue

---

### User Story 2 - Overdue Status Persists Across Sessions (Priority: P2)

When users close and reopen the application, overdue visual indicators remain consistent and automatically update based on the current date.

**Why this priority**: Users expect the overdue status to be dynamic and reflect the current date. This ensures reliability but is secondary to the core visual indicator functionality.

**Independent Test**: Can be tested by creating todos with various due dates, closing the application, advancing system time or waiting, then reopening to verify indicators update correctly.

**Acceptance Scenarios**:

1. **Given** I have a todo with a due date of tomorrow, **When** I close the app, advance to day after tomorrow, and reopen, **Then** the todo now displays as overdue
2. **Given** I have multiple overdue todos, **When** I close and reopen the application, **Then** all overdue todos retain their overdue visual indicators
3. **Given** I complete an overdue todo, **When** I close and reopen the application, **Then** the completed todo does NOT display as overdue

---

### Edge Cases

- What happens when a todo has no due date? (Should never be marked overdue)
- What happens when system date/time changes (timezone changes, manual clock adjustment)? (Should recalculate overdue status on app load)
- What happens when a todo's due date is exactly at midnight? (Should be considered overdue starting the next day at 00:00:01)
- What happens when the user completes an overdue todo? (Overdue indicator should disappear immediately)
- What happens when the user changes an overdue todo's due date to a future date? (Overdue indicator should disappear immediately)
- What happens when the user removes the due date from an overdue todo? (Overdue indicator should disappear immediately)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate overdue status by comparing the current date with the todo's due date
- **FR-002**: System MUST mark a todo as overdue when the current date is after the due date AND the todo status is incomplete
- **FR-003**: System MUST NOT mark a todo as overdue if it has been completed, regardless of due date
- **FR-004**: System MUST NOT mark a todo as overdue if it has no due date assigned
- **FR-005**: System MUST display a distinct visual indicator for overdue todos that differentiates them from non-overdue items
- **FR-006**: System MUST recalculate overdue status when the application loads or refreshes
- **FR-007**: System MUST immediately remove overdue indicator when a todo is marked as completed
- **FR-008**: System MUST immediately remove overdue indicator when a todo's due date is changed to a future date or removed
- **FR-009**: System MUST immediately add overdue indicator when a todo's due date is changed to a past date (and todo is incomplete)
- **FR-010**: System MUST use date-only comparison (ignore time of day) when determining if a todo is overdue

### Key Entities

- **Todo Item**: Existing entity with attributes: id, title, dueDate (optional), completed (boolean), createdAt
  - No new attributes required for this feature
  - Overdue status is derived/calculated, not stored

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify overdue todos within 2 seconds of viewing the todo list without reading due dates
- **SC-002**: 100% of overdue todos (due date in past, status incomplete) display the visual indicator correctly
- **SC-003**: 0% false positives - no todos without past due dates display as overdue
- **SC-004**: Overdue status updates immediately (within 100ms) when user actions change todo completion status or due date
- **SC-005**: Users can distinguish overdue items from non-overdue items in both light and dark modes with clear visual contrast

## Assumptions

- The application already has a functioning todo list with due date support
- Due dates are stored in a format that allows date comparison
- The application has access to the current system date/time
- Visual styling (colors, icons) will follow the existing Halloween theme and Material Design principles from the UI guidelines
- Overdue calculation uses local system time (no timezone conversion needed for single-user application)
