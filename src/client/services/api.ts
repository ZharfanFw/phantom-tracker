export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  checkedToday: boolean;
  checkedYesterday: boolean;
  completionRate30d: number;
}

export interface DayCell {
  date: string;
  value: number;
  isChecked: boolean;
  isToday: boolean;
  dayOfWeek: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  type: 'boolean' | 'count';
  targetCount: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats: HabitStats;
  recentGrid?: DayCell[];
  grid?: DayCell[];
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  source: 'popup' | 'web';
  isDone: boolean;
  createdAt: string;
  doneAt?: string | null;
}

export interface WidgetSummary {
  meta: {
    date: string;
    formattedDate: string;
    greeting: string;
    updatedAt: string;
  };
  habits: {
    total: number;
    doneToday: number;
    allDone: boolean;
    items: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
      currentStreak: number;
      longestStreak: number;
      checkedToday: boolean;
      miniHistory: number[];
    }>;
  };
  todos: {
    totalPending: number;
    totalCompleted: number;
    pending: Array<{ id: string; title: string; source: string }>;
    completed: Array<{ id: string; title: string }>;
  };
}

const API_BASE = '/api';

export const api = {
  // Habits
  async getHabits(): Promise<Habit[]> {
    const res = await fetch(`${API_BASE}/habits`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch habits');
    return data.habits;
  },

  async getHabitDetail(id: string): Promise<Habit> {
    const res = await fetch(`${API_BASE}/habits/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch habit detail');
    return data.habit;
  },

  async createHabit(payload: Partial<Habit>): Promise<Habit> {
    const res = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create habit');
    return data.habit;
  },

  async updateHabit(id: string, payload: Partial<Habit>): Promise<Habit> {
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update habit');
    return data.habit;
  },

  async deleteHabit(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete habit');
  },

  async toggleCheckin(
    habitId: string,
    date?: string,
    mode: 'toggle' | 'set' | 'increment' = 'toggle',
    value?: number
  ): Promise<{ isChecked: boolean; stats: HabitStats }> {
    const res = await fetch(`${API_BASE}/habits/${habitId}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, mode, value }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to toggle checkin');
    return data;
  },

  // Todos
  async getTodos(status: 'all' | 'pending' | 'done' = 'all'): Promise<Todo[]> {
    const res = await fetch(`${API_BASE}/todos?status=${status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch todos');
    return data.todos;
  },

  async createTodo(title: string, source: 'popup' | 'web' = 'web'): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, source }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create todo');
    return data.todo;
  },

  async toggleTodo(id: string, isDone?: boolean): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to toggle todo');
    return data.todo;
  },

  async deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete todo');
  },

  // Widgets
  async getWidgetSummary(): Promise<WidgetSummary> {
    const res = await fetch(`${API_BASE}/widgets/today`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch widget summary');
    return data;
  },
};
