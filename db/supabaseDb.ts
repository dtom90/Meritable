import { Habit, HabitCompletion, HabitCompletionInput, HabitInput, Exercise, ExerciseInput, Set, SetInput, Task, TaskInput, Tag } from './types';
import { HabitDatabaseInterface } from './habitDatabase';
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

  /**
   * Initialize the database by pre-fetching the user.
   * This prevents the lazy loading spinner when switching to cloud DB.
   */
  public async initialize(): Promise<void> {
    await this.getUser()
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
      .or('archived.is.null,archived.eq.false')
      .order('order', { ascending: true })
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  }

  async getArchivedHabits(): Promise<Habit[]> {
    const user = await this.getUser()

    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user?.id)
      .eq('archived', true)
      .order('order', { ascending: true })
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  }

  async getHabit(id: number): Promise<Habit | null> {
    const user = await this.getUser()

    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle()

    if (error) throw error
    return data
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

  // Exercise operations
  async createExercise(exercise: { name: string }): Promise<Exercise> {
    const user = await this.getUser()
    const { data: existing } = await this.supabase
      .from('exercises')
      .select('order')
      .eq('user_id', user?.id)
      .order('order', { ascending: false })
      .limit(1)
    const nextOrder = existing?.length ? existing[0].order + 1 : 0
    const { data, error } = await this.supabase
      .from('exercises')
      .insert({ name: exercise.name, order: nextOrder, user_id: user?.id })
      .select()
      .single()
    if (error) throw error
    return mapExerciseRow(data)
  }

  async getExercises(): Promise<Exercise[]> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user?.id)
      .order('order', { ascending: true })
      .order('id', { ascending: true })
    if (error) throw error
    return (data || []).map(mapExerciseRow)
  }

  async updateExercise(id: number, updates: Partial<ExerciseInput>): Promise<Exercise> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('exercises')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()
    if (error) throw error
    return mapExerciseRow(data)
  }

  async deleteExercise(id: number): Promise<void> {
    const user = await this.getUser()
    await this.supabase.from('sets').delete().eq('exercise_id', id).eq('user_id', user?.id)
    const { error } = await this.supabase.from('exercises').delete().eq('id', id).eq('user_id', user?.id)
    if (error) throw error
  }

  async reorderExercises(exercises: Exercise[]): Promise<Exercise[]> {
    const user = await this.getUser()
    const updated: Exercise[] = []
    for (const exercise of exercises) {
      if (exercise.id != null) {
        const { data, error } = await this.supabase
          .from('exercises')
          .update({
            order: exercise.order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', exercise.id)
          .eq('user_id', user?.id)
          .select()
          .single()
        if (error) throw error
        if (data) updated.push(mapExerciseRow(data))
      }
    }
    return updated
  }

  // Set operations
  async createSet(set: SetInput): Promise<Set> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('sets')
      .insert({
        exercise_id: set.exerciseId,
        weight: set.weight,
        reps: set.reps,
        completion_date: set.completionDate,
        user_id: user?.id
      })
      .select()
      .single()
    if (error) throw error
    return mapSetRow(data)
  }

  async getSetsByExerciseId(exerciseId: number): Promise<Set[]> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('sets')
      .select('*')
      .eq('exercise_id', exerciseId)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapSetRow)
  }

  async updateSet(id: number, updates: Partial<SetInput>): Promise<Set> {
    const user = await this.getUser()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.weight !== undefined) payload.weight = updates.weight
    if (updates.reps !== undefined) payload.reps = updates.reps
    if (updates.completionDate !== undefined) payload.completion_date = updates.completionDate
    const { data, error } = await this.supabase
      .from('sets')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()
    if (error) throw error
    return mapSetRow(data)
  }

  async deleteSet(id: number): Promise<void> {
    const user = await this.getUser()
    const { error } = await this.supabase.from('sets').delete().eq('id', id).eq('user_id', user?.id)
    if (error) throw error
  }

  // Task operations
  async createTask(task: TaskInput): Promise<Task> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        title: task.title,
        due_date: task.dueDate,
        completed: task.completed,
        completion_date: task.completionDate,
        user_id: user?.id
      })
      .select()
      .single()
    if (error) throw error
    return mapTaskRow(data)
  }

  async getTasks(): Promise<Task[]> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
    if (error) throw error
    return (data || []).map(mapTaskRow)
  }

  async getTask(id: number): Promise<Task | null> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle()
    if (error) throw error
    return data ? mapTaskRow(data) : null
  }

  async updateTask(id: number, updates: Partial<TaskInput>): Promise<Task> {
    const user = await this.getUser()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
    if (updates.completed !== undefined) payload.completed = updates.completed
    if (updates.completionDate !== undefined) payload.completion_date = updates.completionDate
    const { data, error } = await this.supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()
    if (error) throw error
    return mapTaskRow(data)
  }

  async deleteTask(id: number): Promise<void> {
    const user = await this.getUser()
    const { error } = await this.supabase.from('tasks').delete().eq('id', id).eq('user_id', user?.id)
    if (error) throw error
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', user?.id)
      .order('order', { ascending: true })
    if (error) throw error
    return (data || []).map(mapTagRow)
  }

  async createTag(name: string): Promise<Tag> {
    const user = await this.getUser()
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Tag name cannot be empty')
    const { data: existing } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', user?.id)
      .eq('name', trimmed)
      .maybeSingle()
    if (existing) return mapTagRow(existing)
    const { data: maxOrder } = await this.supabase
      .from('tags')
      .select('order')
      .eq('user_id', user?.id)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextOrder = maxOrder?.order != null ? Number(maxOrder.order) + 1 : 0
    const { data, error } = await this.supabase
      .from('tags')
      .insert({ name: trimmed, user_id: user?.id, order: nextOrder })
      .select()
      .single()
    if (error) throw error
    return mapTagRow(data)
  }

  async updateTag(id: number, name: string): Promise<Tag> {
    const user = await this.getUser()
    const trimmedName = name.trim()
    if (!trimmedName) throw new Error('Tag name cannot be empty')
    const { data: current, error: fetchError } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!current) throw new Error('Tag not found')
    if (current.name === trimmedName) return mapTagRow(current)
    const { data, error } = await this.supabase
      .from('tags')
      .update({ name: trimmedName })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') throw new Error('A tag with this name already exists')
      throw error
    }
    return mapTagRow(data)
  }

  async reorderTags(tags: Tag[]): Promise<Tag[]> {
    const user = await this.getUser()
    for (let i = 0; i < tags.length; i++) {
      const { error } = await this.supabase
        .from('tags')
        .update({ order: i })
        .eq('id', tags[i].id)
        .eq('user_id', user?.id)
      if (error) throw error
    }
    return tags.map((t, i) => ({ ...t, order: i }))
  }

  async getTaskTagIds(taskId: number): Promise<number[]> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('task_tags')
      .select('tag_id')
      .eq('task_id', taskId)
    if (error) throw error
    const rows = data || []
    const tagIds = rows.map((r: any) => Number(r.tag_id))
    const tagIdsFiltered = tagIds.filter((id: number) => !isNaN(id))
    if (tagIdsFiltered.length !== tagIds.length) return tagIdsFiltered
    return tagIds
  }

  async setTaskTags(taskId: number, tagIds: number[]): Promise<void> {
    const user = await this.getUser()
    const { error: delError } = await this.supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
    if (delError) throw delError
    const deduped = tagIds.filter((id: number, i: number) => tagIds.indexOf(id) === i)
    if (deduped.length === 0) return
    const toInsert = deduped.map((tag_id) => ({ task_id: taskId, tag_id }))
    const { error: insError } = await this.supabase.from('task_tags').insert(toInsert)
    if (insError) throw insError
  }

  async getTaskTagIdsMap(): Promise<Record<number, number[]>> {
    const user = await this.getUser()
    const { data, error } = await this.supabase
      .from('task_tags')
      .select('task_id, tag_id')
    if (error) throw error
    const rows = data || []
    const map: Record<number, number[]> = {}
    for (const row of rows) {
      const taskId = Number(row.task_id)
      const tagId = Number(row.tag_id)
      if (isNaN(taskId) || isNaN(tagId)) continue
      if (!map[taskId]) map[taskId] = []
      map[taskId].push(tagId)
    }
    return map
  }

  async deleteTag(id: number): Promise<void> {
    const user = await this.getUser()
    const { error: ttError } = await this.supabase.from('task_tags').delete().eq('tag_id', id)
    if (ttError) throw ttError
    const { error } = await this.supabase.from('tags').delete().eq('id', id).eq('user_id', user?.id)
    if (error) throw error
  }
}

function mapTagRow(row: any): Tag {
  return {
    id: Number(row.id),
    name: row.name,
    order: row.order != null ? Number(row.order) : 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function mapTaskRow(row: any): Task {
  return {
    id: Number(row.id),
    title: row.title,
    dueDate: row.due_date ?? row.dueDate,
    completed: Boolean(row.completed),
    completionDate: row.completion_date ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function mapExerciseRow(row: any): Exercise {
  return {
    id: Number(row.id),
    name: row.name,
    order: row.order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function mapSetRow(row: any): Set {
  return {
    id: Number(row.id),
    exerciseId: Number(row.exercise_id),
    weight: row.weight != null ? Number(row.weight) : null,
    reps: Number(row.reps),
    completionDate: row.completion_date ?? row.completionDate,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}


