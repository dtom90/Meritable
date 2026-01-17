import { Habit, HabitCompletion, HabitCompletionInput, HabitDatabaseInterface, HabitInput } from './habitDatabase'
import { supabaseClient } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export class SupabaseDb extends HabitDatabaseInterface {
  private supabase: any
  private cachedUser: User | null = null
  private userPromise: Promise<User | null> | null = null
  private isFetchingUser: boolean = false
  private onFetchingStateChange?: (isFetching: boolean) => void

  constructor() {
    super()
    this.supabase = supabaseClient
  }

  /**
   * Set a callback to be notified when user fetching state changes
   */
  public setOnFetchingStateChange(callback: ((isFetching: boolean) => void) | undefined): void {
    this.onFetchingStateChange = callback
  }

  /**
   * Check if user is currently being fetched
   */
  public getIsFetchingUser(): boolean {
    return this.isFetchingUser
  }

  private setFetchingState(isFetching: boolean): void {
    if (this.isFetchingUser !== isFetching) {
      this.isFetchingUser = isFetching
      this.onFetchingStateChange?.(isFetching)
    }
  }

  /**
   * Get the current user, with caching to avoid repeated API calls.
   * If multiple calls happen simultaneously, they share the same promise.
   */
  private async getUser(): Promise<User | null> {
    // If we have a cached user, return it immediately
    if (this.cachedUser) {
      return this.cachedUser
    }

    // If there's already a getUser() call in progress, return that promise
    if (this.userPromise) {
      return this.userPromise
    }

    // Set loading state
    this.setFetchingState(true)

    // Create a new promise and cache it
    this.userPromise = this.supabase.auth.getUser().then(({ data: { user }, error }: any) => {
      this.setFetchingState(false)
      if (error) {
        this.userPromise = null
        throw error
      }
      this.cachedUser = user
      this.userPromise = null
      return user
    }).catch((error: any) => {
      this.setFetchingState(false)
      this.userPromise = null
      throw error
    })

    return this.userPromise
  }

  // Habit operations
  async createHabit(habit: { name: string }): Promise<Habit> {
    const user = await this.getUser()
    
    // Get the current highest order value to assign the next order
    const { data: existingHabits } = await this.supabase
      .from('habits')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
    
    const nextOrder = existingHabits && existingHabits.length > 0 ? existingHabits[0].order + 1 : 0
    
    const { data, error } = await this.supabase
      .from('habits')
      .insert({
        ...habit,
        order: nextOrder,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHabits(): Promise<Habit[]> {
    const user = await this.getUser()
    
    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user?.id)
      .order('order', { ascending: true })
      .order('id', { ascending: true }) // Fallback for habits without order

    if (error) throw error
    return data || []
  }

  async updateHabit(id: number, updates: Partial<HabitInput>): Promise<Habit> {
    const user = await this.getUser()
    
    const { data, error } = await this.supabase
      .from('habits')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async reorderHabits(habits: Habit[]): Promise<Habit[]> {
    // Update each habit individually to set the order field
    const updatedHabits: Habit[] = [];
    
    for (const habit of habits) {
      if (habit.id) {
        const { data, error } = await this.supabase
          .from('habits')
          .update({
            order: habit.order,
            updated_at: new Date().toISOString()
          })
          .eq('id', habit.id)
          .select()
          .single();

        if (error) throw error;
        if (data) updatedHabits.push(data);
      }
    }

    return updatedHabits;
  }

  async deleteHabit(id: number): Promise<void> {
    const user = await this.getUser()
    
    // First delete all habit completions for this habit
    const { error: completionsError } = await this.supabase
      .from('habit_completions')
      .delete()
      .eq('habitId', id)
      .eq('user_id', user?.id)

    if (completionsError) throw completionsError

    // Then delete the habit
    const { error } = await this.supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (error) throw error
  }

  // HabitCompletion operations
  async createHabitCompletion(completion: HabitCompletionInput): Promise<HabitCompletion> {
    const user = await this.getUser()
    
    const { data, error } = await this.supabase
      .from('habit_completions')
      .insert({
        ...completion,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateHabitCompletion(id: number, updates: Partial<HabitCompletionInput>): Promise<HabitCompletion> {
    const user = await this.getUser()
    
    const { data, error } = await this.supabase
      .from('habit_completions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHabitCompletionsByDate(completionDate?: string): Promise<HabitCompletion[]> {
    const user = await this.getUser()
    
    let query = this.supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user?.id)
      .order('completionDate', { ascending: false })

    if (completionDate) {
      query = query.eq('completionDate', completionDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async getHabitCompletionsById(habitId: number): Promise<HabitCompletion[]> {
    const user = await this.getUser()
    
    const { data, error } = await this.supabase
      .from('habit_completions')
      .select('*')
      .eq('habitId', habitId)
      .eq('user_id', user?.id)
      .order('completionDate', { ascending: false })
    if (error) throw error
    return data || []
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    const user = await this.getUser()
    
    const { error } = await this.supabase
      .from('habit_completions')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (error) throw error
  }
}


