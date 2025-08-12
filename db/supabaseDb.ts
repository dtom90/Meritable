import { createClient } from '@supabase/supabase-js'
import { Habit, HabitCompletion, HabitCompletionInput, HabitDatabaseInterface, HabitInput } from './types'

export class SupabaseDb extends HabitDatabaseInterface {
  private supabase: any

  constructor() {
    super()
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY')
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
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

  async getHabitCompletions(habitId?: number): Promise<HabitCompletion[]> {
    let query = this.supabase
      .from('habit_completions')
      .select('*')
      .order('completionDate', { ascending: false })

    if (habitId) {
      query = query.eq('habitId', habitId)
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

export const habitDb = new SupabaseDb()
