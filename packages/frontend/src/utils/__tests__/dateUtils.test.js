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
