// Mock Supabase database for testing
export const MockedSupabaseDb = jest.fn().mockImplementation(() => ({
  getHabits: jest.fn().mockResolvedValue([]),
  createHabit: jest.fn(),
  updateHabit: jest.fn(),
  reorderHabits: jest.fn(),
  deleteHabit: jest.fn(),
  createHabitCompletion: jest.fn(),
  updateHabitCompletion: jest.fn(),
  getHabitCompletionsByDate: jest.fn(),
  getHabitCompletionsById: jest.fn(),
  deleteHabitCompletion: jest.fn(),
  setOnFetchingStateChange: jest.fn(),
  initialize: jest.fn().mockResolvedValue(undefined),
  getIsFetchingUser: jest.fn().mockReturnValue(false),
}));

