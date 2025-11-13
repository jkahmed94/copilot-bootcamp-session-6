/**
 * Determines if a todo item is overdue based on its due date and completion status.
 * 
 * An item is considered overdue if:
 * - It has a valid due date
 * - The due date is before today (date-only comparison, ignoring time)
 * - The item is not completed
 * 
 * @param {string|null|undefined} dueDate - The due date in ISO format (YYYY-MM-DD or ISO 8601 with time)
 * @param {boolean} completed - Whether the todo item is completed
 * @returns {boolean} true if the item is overdue, false otherwise
 * 
 * @example
 * // Past date, not completed - overdue
 * isOverdue('2020-01-01', false); // true
 * 
 * @example
 * // Past date, completed - not overdue
 * isOverdue('2020-01-01', true); // false
 * 
 * @example
 * // No due date - not overdue
 * isOverdue(null, false); // false
 * 
 * @example
 * // Future date - not overdue
 * isOverdue('2099-12-31', false); // false
 */
export function isOverdue(dueDate, completed) {
  // If completed, never overdue
  if (completed) {
    return false;
  }

  // If no due date, not overdue
  if (!dueDate) {
    return false;
  }

  // Parse the due date
  const dueDateObj = new Date(dueDate);

  // If invalid date, not overdue
  if (isNaN(dueDateObj.getTime())) {
    return false;
  }

  // Get today's date at midnight (date-only comparison)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize due date to midnight for date-only comparison
  const normalizedDueDate = new Date(dueDateObj);
  normalizedDueDate.setHours(0, 0, 0, 0);

  // Overdue if due date is before today
  return normalizedDueDate < today;
}
