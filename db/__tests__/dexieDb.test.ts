// Import fake-indexeddb before Dexie to mock IndexedDB
import 'fake-indexeddb/auto';
import { DexieDb } from '../dexieDb';
import { Habit } from '../types';

describe('DexieDb - HabitDatabaseInterface Implementation', () => {
  let db: DexieDb;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    db = new DexieDb();
    await db.open();
  });

  afterEach(async () => {
    // Clean up: delete all data and close the database
    if (db && db.isOpen()) {
      await db.habits.clear();
      await db.habitCompletions.clear();
      await db.close();
      await db.delete(); // Delete the database completely
    }
  });

  describe('Habit CRUD Operations', () => {
    describe('createHabit', () => {
      it('should create a habit with auto-generated fields', async () => {
        const habit = await db.createHabit({ name: 'Morning Exercise' });

        expect(habit.id).toBeDefined();
        expect(habit.name).toBe('Morning Exercise');
        expect(habit.order).toBe(0); // First habit should have order 0
        expect(habit.created_at).toBeDefined();
        expect(habit.updated_at).toBeDefined();
        expect(typeof habit.created_at).toBe('string');
        expect(typeof habit.updated_at).toBe('string');
      });

      it('should assign incremental order values to new habits', async () => {
        const habit1 = await db.createHabit({ name: 'Habit 1' });
        const habit2 = await db.createHabit({ name: 'Habit 2' });
        const habit3 = await db.createHabit({ name: 'Habit 3' });

        expect(habit1.order).toBe(0);
        expect(habit2.order).toBe(1);
        expect(habit3.order).toBe(2);
      });

      it('should handle creating multiple habits', async () => {
        // Create habits sequentially to avoid race conditions in order assignment
        const habitA = await db.createHabit({ name: 'Habit A' });
        const habitB = await db.createHabit({ name: 'Habit B' });
        const habitC = await db.createHabit({ name: 'Habit C' });
        const habits = [habitA, habitB, habitC];

        expect(habits).toHaveLength(3);
        habits.forEach((habit, index) => {
          expect(habit.id).toBeDefined();
          expect(habit.order).toBe(index);
          expect(habit.name).toMatch(/Habit [ABC]/);
        });
      });
    });

    describe('getHabits', () => {
      it('should return empty array when no habits exist', async () => {
        const habits = await db.getHabits();
        expect(habits).toEqual([]);
      });

      it('should return all habits sorted by order', async () => {
        // Create habits in a specific order
        await db.createHabit({ name: 'First' });
        await db.createHabit({ name: 'Second' });
        await db.createHabit({ name: 'Third' });

        const habits = await db.getHabits();

        expect(habits).toHaveLength(3);
        expect(habits[0].name).toBe('First');
        expect(habits[1].name).toBe('Second');
        expect(habits[2].name).toBe('Third');
        expect(habits[0].order).toBe(0);
        expect(habits[1].order).toBe(1);
        expect(habits[2].order).toBe(2);
      });

      it('should maintain order after reordering', async () => {
        const habitA = await db.createHabit({ name: 'A' });
        const habitB = await db.createHabit({ name: 'B' });
        const habitC = await db.createHabit({ name: 'C' });

        // Reorder: C, A, B
        await db.reorderHabits([
          { ...habitC, order: 0 },
          { ...habitA, order: 1 },
          { ...habitB, order: 2 },
        ]);

        const habits = await db.getHabits();
        expect(habits[0].name).toBe('C');
        expect(habits[1].name).toBe('A');
        expect(habits[2].name).toBe('B');
      });

      it('should fallback to id sorting when order is missing', async () => {
        // Manually insert habits without order (simulating old data)
        await db.habits.bulkAdd([
          { id: 3, name: 'Third', order: undefined as any, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 1, name: 'First', order: undefined as any, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, name: 'Second', order: undefined as any, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ] as any);

        const habits = await db.getHabits();
        expect(habits[0].id).toBeLessThan(habits[1].id);
        expect(habits[1].id).toBeLessThan(habits[2].id);
      });
    });

    describe('updateHabit', () => {
      it('should update habit name', async () => {
        const habit = await db.createHabit({ name: 'Old Name' });
        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => setTimeout(resolve, 10));
        const updated = await db.updateHabit(habit.id, { name: 'New Name' });

        expect(updated.name).toBe('New Name');
        expect(updated.id).toBe(habit.id);
        expect(updated.updated_at).not.toBe(habit.updated_at);
      });

      it('should update habit countTarget', async () => {
        const habit = await db.createHabit({ name: 'Exercise' });
        const updated = await db.updateHabit(habit.id, { countTarget: 10 });

        expect(updated.countTarget).toBe(10);
        expect(updated.name).toBe('Exercise');
      });

      it('should update multiple fields at once', async () => {
        const habit = await db.createHabit({ name: 'Original' });
        const originalUpdatedAt = habit.updated_at;

        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => setTimeout(resolve, 10));

        const updated = await db.updateHabit(habit.id, {
          name: 'Updated',
          countTarget: 5,
        });

        expect(updated.name).toBe('Updated');
        expect(updated.countTarget).toBe(5);
        expect(updated.updated_at).not.toBe(originalUpdatedAt);
      });

      it('should throw error when updating non-existent habit', async () => {
        await expect(db.updateHabit(999, { name: 'Test' })).rejects.toThrow(
          'Habit with id 999 not found'
        );
      });

      it('should preserve existing fields when updating', async () => {
        const habit = await db.createHabit({ name: 'Test' });
        // First update to add countTarget
        await db.updateHabit(habit.id, { countTarget: 10 });
        // Then update name and verify countTarget is preserved
        const updated = await db.updateHabit(habit.id, { name: 'Updated' });

        expect(updated.name).toBe('Updated');
        expect(updated.countTarget).toBe(10);
        expect(updated.order).toBe(habit.order);
      });
    });

    describe('reorderHabits', () => {
      it('should reorder habits correctly', async () => {
        const habit1 = await db.createHabit({ name: 'A' });
        const habit2 = await db.createHabit({ name: 'B' });
        const habit3 = await db.createHabit({ name: 'C' });

        const reordered = await db.reorderHabits([
          { ...habit3, order: 0 },
          { ...habit1, order: 1 },
          { ...habit2, order: 2 },
        ]);

        expect(reordered).toHaveLength(3);
        expect(reordered[0].name).toBe('C');
        expect(reordered[1].name).toBe('A');
        expect(reordered[2].name).toBe('B');

        // Verify persistence
        const habits = await db.getHabits();
        expect(habits[0].name).toBe('C');
        expect(habits[1].name).toBe('A');
        expect(habits[2].name).toBe('B');
      });

      it('should update timestamps when reordering', async () => {
        const habit1 = await db.createHabit({ name: 'A' });
        const habit2 = await db.createHabit({ name: 'B' });
        const originalUpdatedAt1 = habit1.updated_at;
        const originalUpdatedAt2 = habit2.updated_at;

        await new Promise(resolve => setTimeout(resolve, 10));

        await db.reorderHabits([
          { ...habit2, order: 0 },
          { ...habit1, order: 1 },
        ]);

        const habits = await db.getHabits();
        expect(habits[0].updated_at).not.toBe(originalUpdatedAt2);
        expect(habits[1].updated_at).not.toBe(originalUpdatedAt1);
      });
    });

    describe('deleteHabit', () => {
      it('should delete a habit', async () => {
        const habit = await db.createHabit({ name: 'To Delete' });
        await db.deleteHabit(habit.id);

        const habits = await db.getHabits();
        expect(habits).toHaveLength(0);
      });

      it('should delete related habit completions when deleting habit', async () => {
        const habit = await db.createHabit({ name: 'Test Habit' });
        await db.createHabitCompletion({
          habitId: habit.id,
          completionDate: '2024-01-01',
        });

        await db.deleteHabit(habit.id);

        const habits = await db.getHabits();
        const completions = await db.getHabitCompletionsById(habit.id);

        expect(habits).toHaveLength(0);
        expect(completions).toHaveLength(0);
      });

      it('should not affect other habits when deleting one', async () => {
        await db.createHabit({ name: 'Keep' });
        const habitDelete = await db.createHabit({ name: 'Delete' });
        await db.createHabit({ name: 'Keep Too' });

        await db.deleteHabit(habitDelete.id);

        const habits = await db.getHabits();
        expect(habits).toHaveLength(2);
        expect(habits.map(h => h.name)).toEqual(['Keep', 'Keep Too']);
      });

      it('should handle deleting non-existent habit gracefully', async () => {
        // Should not throw, just do nothing
        await expect(db.deleteHabit(999)).resolves.not.toThrow();
      });
    });
  });

  describe('HabitCompletion CRUD Operations', () => {
    let testHabit: Habit;

    beforeEach(async () => {
      testHabit = await db.createHabit({ name: 'Test Habit' });
    });

    describe('createHabitCompletion', () => {
      it('should create a habit completion with auto-generated fields', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        expect(completion.id).toBeDefined();
        expect(completion.habitId).toBe(testHabit.id);
        expect(completion.completionDate).toBe('2024-01-01');
        expect(completion.created_at).toBeDefined();
        expect(completion.updated_at).toBeDefined();
        expect(typeof completion.created_at).toBe('string');
        expect(typeof completion.updated_at).toBe('string');
      });

      it('should create completion with count when provided', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
          count: 5,
        });

        expect(completion.count).toBe(5);
      });

      it('should allow multiple completions for the same habit on different dates', async () => {
        const completion1 = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        const completion2 = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-02',
        });

        expect(completion1.id).not.toBe(completion2.id);
        expect(completion1.completionDate).toBe('2024-01-01');
        expect(completion2.completionDate).toBe('2024-01-02');
      });

      it('should allow multiple completions for different habits on the same date', async () => {
        const habit2 = await db.createHabit({ name: 'Another Habit' });
        const completion1 = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        const completion2 = await db.createHabitCompletion({
          habitId: habit2.id,
          completionDate: '2024-01-01',
        });

        expect(completion1.habitId).not.toBe(completion2.habitId);
        expect(completion1.completionDate).toBe(completion2.completionDate);
      });
    });

    describe('getHabitCompletionsByDate', () => {
      it('should return empty array when no completions exist', async () => {
        const completions = await db.getHabitCompletionsByDate();
        expect(completions).toEqual([]);
      });

      it('should return all completions when no date specified', async () => {
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-02',
        });

        const completions = await db.getHabitCompletionsByDate();
        expect(completions).toHaveLength(2);
      });

      it('should return completions for a specific date', async () => {
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-02',
        });
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        const completions = await db.getHabitCompletionsByDate('2024-01-01');
        expect(completions).toHaveLength(2);
        completions.forEach(c => {
          expect(c.completionDate).toBe('2024-01-01');
        });
      });

      it('should return empty array for date with no completions', async () => {
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        const completions = await db.getHabitCompletionsByDate('2024-01-02');
        expect(completions).toEqual([]);
      });
    });

    describe('getHabitCompletionsById', () => {
      it('should return empty array when habit has no completions', async () => {
        const completions = await db.getHabitCompletionsById(testHabit.id);
        expect(completions).toEqual([]);
      });

      it('should return all completions for a specific habit', async () => {
        const habit2 = await db.createHabit({ name: 'Another Habit' });

        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-02',
        });
        await db.createHabitCompletion({
          habitId: habit2.id,
          completionDate: '2024-01-01',
        });

        const completions = await db.getHabitCompletionsById(testHabit.id);
        expect(completions).toHaveLength(2);
        completions.forEach(c => {
          expect(c.habitId).toBe(testHabit.id);
        });
      });

      it('should not return completions for other habits', async () => {
        const habit2 = await db.createHabit({ name: 'Another Habit' });

        await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        await db.createHabitCompletion({
          habitId: habit2.id,
          completionDate: '2024-01-01',
        });

        const completions = await db.getHabitCompletionsById(testHabit.id);
        expect(completions).toHaveLength(1);
        expect(completions[0].habitId).toBe(testHabit.id);
      });
    });

    describe('updateHabitCompletion', () => {
      it('should update completion count', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
          count: 5,
        });
        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => setTimeout(resolve, 10));
        const updated = await db.updateHabitCompletion(completion.id, {
          count: 10,
        });

        expect(updated.count).toBe(10);
        expect(updated.completionDate).toBe('2024-01-01');
        expect(updated.updated_at).not.toBe(completion.updated_at);
      });

      it('should update completion date', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        const updated = await db.updateHabitCompletion(completion.id, {
          completionDate: '2024-01-02',
        });

        expect(updated.completionDate).toBe('2024-01-02');
        expect(updated.habitId).toBe(testHabit.id);
      });

      it('should update multiple fields at once', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
          count: 5,
        });

        const updated = await db.updateHabitCompletion(completion.id, {
          completionDate: '2024-01-02',
          count: 10,
        });

        expect(updated.completionDate).toBe('2024-01-02');
        expect(updated.count).toBe(10);
      });

      it('should throw error when updating non-existent completion', async () => {
        await expect(
          db.updateHabitCompletion(999, { count: 5 })
        ).rejects.toThrow('HabitCompletion with id 999 not found');
      });

      it('should preserve existing fields when updating', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
          count: 5,
        });

        const updated = await db.updateHabitCompletion(completion.id, {
          count: 10,
        });

        expect(updated.count).toBe(10);
        expect(updated.completionDate).toBe('2024-01-01');
        expect(updated.habitId).toBe(testHabit.id);
      });
    });

    describe('deleteHabitCompletion', () => {
      it('should delete a habit completion', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        await db.deleteHabitCompletion(completion.id);

        const completions = await db.getHabitCompletionsByDate();
        expect(completions).toHaveLength(0);
      });

      it('should not affect other completions when deleting one', async () => {
        const completion1 = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });
        const completion2 = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-02',
        });

        await db.deleteHabitCompletion(completion1.id);

        const completions = await db.getHabitCompletionsByDate();
        expect(completions).toHaveLength(1);
        expect(completions[0].id).toBe(completion2.id);
      });

      it('should not affect the habit when deleting completion', async () => {
        const completion = await db.createHabitCompletion({
          habitId: testHabit.id,
          completionDate: '2024-01-01',
        });

        await db.deleteHabitCompletion(completion.id);

        const habits = await db.getHabits();
        expect(habits).toHaveLength(1);
        expect(habits[0].id).toBe(testHabit.id);
      });

      it('should handle deleting non-existent completion gracefully', async () => {
        await expect(db.deleteHabitCompletion(999)).resolves.not.toThrow();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete CRUD lifecycle for habits', async () => {
      // Create
      const habit = await db.createHabit({ name: 'Test Habit' });
      expect(habit.id).toBeDefined();

      // Read
      const habits = await db.getHabits();
      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('Test Habit');

      // Update
      const updated = await db.updateHabit(habit.id, { name: 'Updated Habit' });
      expect(updated.name).toBe('Updated Habit');

      // Delete
      await db.deleteHabit(habit.id);
      const remainingHabits = await db.getHabits();
      expect(remainingHabits).toHaveLength(0);
    });

    it('should handle complete CRUD lifecycle for habit completions', async () => {
      const habit = await db.createHabit({ name: 'Test Habit' });

      // Create
      const completion = await db.createHabitCompletion({
        habitId: habit.id,
        completionDate: '2024-01-01',
        count: 5,
      });
      expect(completion.id).toBeDefined();

      // Read
      const completions = await db.getHabitCompletionsById(habit.id);
      expect(completions).toHaveLength(1);
      expect(completions[0].count).toBe(5);

      // Update
      const updated = await db.updateHabitCompletion(completion.id, {
        count: 10,
      });
      expect(updated.count).toBe(10);

      // Delete
      await db.deleteHabitCompletion(completion.id);
      const remainingCompletions = await db.getHabitCompletionsById(habit.id);
      expect(remainingCompletions).toHaveLength(0);
    });

    it('should maintain data integrity across operations', async () => {
      // Create multiple habits and completions
      const habit1 = await db.createHabit({ name: 'Habit 1' });
      const habit2 = await db.createHabit({ name: 'Habit 2' });

      await db.createHabitCompletion({
        habitId: habit1.id,
        completionDate: '2024-01-01',
      });
      await db.createHabitCompletion({
        habitId: habit2.id,
        completionDate: '2024-01-01',
      });

      // Verify all data exists
      const habits = await db.getHabits();
      const completions = await db.getHabitCompletionsByDate('2024-01-01');

      expect(habits).toHaveLength(2);
      expect(completions).toHaveLength(2);

      // Delete one habit and verify cascade
      await db.deleteHabit(habit1.id);

      const remainingHabits = await db.getHabits();
      const remainingCompletions = await db.getHabitCompletionsByDate('2024-01-01');

      expect(remainingHabits).toHaveLength(1);
      expect(remainingHabits[0].id).toBe(habit2.id);
      expect(remainingCompletions).toHaveLength(1);
      expect(remainingCompletions[0].habitId).toBe(habit2.id);
    });

    it('should handle concurrent operations', async () => {
      // Create multiple habits concurrently
      const habits = await Promise.all([
        db.createHabit({ name: 'Habit A' }),
        db.createHabit({ name: 'Habit B' }),
        db.createHabit({ name: 'Habit C' }),
      ]);

      expect(habits).toHaveLength(3);
      const allHabits = await db.getHabits();
      expect(allHabits).toHaveLength(3);

      // Create multiple completions concurrently
      const completions = await Promise.all(
        habits.map(habit =>
          db.createHabitCompletion({
            habitId: habit.id,
            completionDate: '2024-01-01',
          })
        )
      );

      expect(completions).toHaveLength(3);
      const allCompletions = await db.getHabitCompletionsByDate('2024-01-01');
      expect(allCompletions).toHaveLength(3);
    });
  });
});

