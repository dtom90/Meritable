import { Habit, HabitCompletion, HabitCompletionInput, HabitDatabaseInterface, HabitInput } from './types'
import { supabaseClient } from './supabaseClient'

export class SupabaseDb extends HabitDatabaseInterface {
  private supabase: any

  constructor() {
    super()
    this.supabase = supabaseClient
  }

  // Habit operations
  async createHabit(habit: HabitInput): Promise<Habit> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    const { data, error } = await this.supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getHabits(): Promise<Habit[]> {
    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  }

  async deleteHabit(id: number): Promise<void> {
    // First delete all habit completions for this habit
    const { error: completionsError } = await this.supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', id)

    if (completionsError) throw completionsError

    // Then delete the habit
    const { error } = await this.supabase
      .from('habits')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // HabitCompletion operations
  async createHabitCompletion(completion: HabitCompletionInput): Promise<HabitCompletion> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
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

  async getHabitCompletions(completionDate?: string): Promise<HabitCompletion[]> {
    let query = this.supabase
      .from('habit_completions')
      .select('*')
      .order('completionDate', { ascending: false })

    if (completionDate) {
      query = query.eq('completionDate', completionDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('habit_completions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}


