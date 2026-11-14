import {
  addDays,
  buildDailyCountSeries,
  formatChartDateLabel,
  getChartXLabelAnchor,
  getChartXLabelIndexes,
  getChartYMax,
} from '@/lib/habitCountChart';
import { HabitCompletion } from '@/db/types';

describe('habitCountChart', () => {
  describe('addDays', () => {
    it('adds days across month boundaries', () => {
      expect(addDays('2024-01-30', 2)).toBe('2024-02-01');
    });

    it('subtracts days', () => {
      expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    });
  });

  describe('buildDailyCountSeries', () => {
    it('fills missing days with zero and uses completion counts', () => {
      const completions: HabitCompletion[] = [
        { id: 1, habitId: 1, completionDate: '2024-01-01', count: 3 },
        { id: 2, habitId: 1, completionDate: '2024-01-03', count: 5 },
      ];

      const series = buildDailyCountSeries(completions, {
        endDate: '2024-01-03',
        dayCount: 3,
      });

      expect(series).toEqual([
        { date: '2024-01-01', count: 3 },
        { date: '2024-01-02', count: 0 },
        { date: '2024-01-03', count: 5 },
      ]);
    });

    it('sums multiple completions on the same day', () => {
      const completions: HabitCompletion[] = [
        { id: 1, habitId: 1, completionDate: '2024-01-02', count: 2 },
        { id: 2, habitId: 1, completionDate: '2024-01-02', count: 4 },
      ];

      const series = buildDailyCountSeries(completions, {
        endDate: '2024-01-02',
        dayCount: 1,
      });

      expect(series).toEqual([{ date: '2024-01-02', count: 6 }]);
    });

    it('treats missing count as zero', () => {
      const completions: HabitCompletion[] = [
        { id: 1, habitId: 1, completionDate: '2024-01-01' },
      ];

      const series = buildDailyCountSeries(completions, {
        endDate: '2024-01-01',
        dayCount: 1,
      });

      expect(series[0].count).toBe(0);
    });
  });

  describe('getChartYMax', () => {
    it('uses the greater of peak count and target', () => {
      expect(getChartYMax([{ date: '2024-01-01', count: 8 }], 5)).toBe(8);
      expect(getChartYMax([{ date: '2024-01-01', count: 2 }], 10)).toBe(10);
    });

    it('never returns less than 1', () => {
      expect(getChartYMax([], null)).toBe(1);
    });
  });

  describe('formatChartDateLabel', () => {
    it('returns a short month/day label from the local calendar date', () => {
      expect(formatChartDateLabel('2024-03-02')).toBe('Mar 2');
      expect(formatChartDateLabel('2024-12-31')).toBe('Dec 31');
    });
  });

  describe('getChartXLabelIndexes', () => {
    it('includes first and last indexes for a 15-day series', () => {
      expect(getChartXLabelIndexes(15)).toEqual([0, 5, 9, 14]);
    });

    it('handles a single point', () => {
      expect(getChartXLabelIndexes(1)).toEqual([0]);
    });
  });

  describe('getChartXLabelAnchor', () => {
    it('anchors edge labels so they are not clipped', () => {
      expect(getChartXLabelAnchor(0, 15)).toBe('start');
      expect(getChartXLabelAnchor(7, 15)).toBe('middle');
      expect(getChartXLabelAnchor(14, 15)).toBe('end');
    });
  });
});
