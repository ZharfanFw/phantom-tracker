import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { calculateStreakStats, generateContributionGrid, getTodayDateString } from '../services/streak.ts';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5435/habit_tracker';

let isPgConnected = false;
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  client = postgres(connectionString, {
    max: 5,
    idle_timeout: 10,
    connect_timeout: 3,
  });
  db = drizzle(client, { schema });
} catch {
  isPgConnected = false;
}

// Local File Store Fallback (when PostgreSQL is not running locally)
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'habit_tracker.json');

export interface HabitModel {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  type: 'boolean' | 'count';
  targetCount: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckinModel {
  id: string;
  habitId: string;
  checkedAt: string; // YYYY-MM-DD
  value: number;
  createdAt: string;
}

export interface TodoModel {
  id: string;
  userId: string;
  title: string;
  source: 'popup' | 'web';
  isDone: boolean;
  createdAt: string;
  doneAt: string | null;
}

interface LocalStore {
  habits: HabitModel[];
  checkins: CheckinModel[];
  todos: TodoModel[];
}

function getInitialStore(): LocalStore {
  const today = getTodayDateString();
  const habit1Id = 'h-1';
  const habit2Id = 'h-2';
  const habit3Id = 'h-3';

  return {
    habits: [
      {
        id: habit1Id,
        userId: 'default_user',
        name: 'Olahraga & Workout 30m',
        description: 'Push-up, pull-up, stretching pagi',
        color: '#ff1744',
        icon: 'flame',
        type: 'boolean',
        targetCount: 1,
        unit: 'kali',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: habit2Id,
        userId: 'default_user',
        name: 'Membaca Buku / Tech Docs 15m',
        description: 'Bangun wawasan teknikal sebelum kerja',
        color: '#ffe600',
        icon: 'book',
        type: 'boolean',
        targetCount: 1,
        unit: 'kali',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: habit3Id,
        userId: 'default_user',
        name: 'Minum Air 2 Liter',
        description: 'Hidrasi optimal sepanjang hari',
        color: '#00e5ff',
        icon: 'droplet',
        type: 'count',
        targetCount: 8,
        unit: 'gelas',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    checkins: [
      { id: 'c-1', habitId: habit1Id, checkedAt: today, value: 1, createdAt: new Date().toISOString() },
      { id: 'c-2', habitId: habit2Id, checkedAt: today, value: 1, createdAt: new Date().toISOString() },
    ],
    todos: [
      {
        id: 't-1',
        userId: 'default_user',
        title: 'Review PRD Habit Tracker & Konfirmasi Stack Hono',
        source: 'popup',
        isDone: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        doneAt: new Date().toISOString(),
      },
      {
        id: 't-2',
        userId: 'default_user',
        title: 'Cek To-do List dan Streak Habit dari HP (Mobile Web)',
        source: 'popup',
        isDone: false,
        createdAt: new Date().toISOString(),
        doneAt: null,
      },
      {
        id: 't-3',
        userId: 'default_user',
        title: 'Setup Widget Scriptable di iPhone Home Screen',
        source: 'web',
        isDone: false,
        createdAt: new Date().toISOString(),
        doneAt: null,
      },
    ],
  };
}

function loadLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return getInitialStore();
  }
}

function saveLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to write local store:', err);
  }
}

/**
 * Initialize DB
 */
export async function initDb() {
  if (client) {
    try {
      await client`
        CREATE TABLE IF NOT EXISTS habits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) DEFAULT 'default_user' NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#ff1744' NOT NULL,
          icon TEXT DEFAULT 'flame' NOT NULL,
          type TEXT DEFAULT 'boolean' NOT NULL,
          target_count INTEGER DEFAULT 1 NOT NULL,
          unit TEXT DEFAULT 'kali',
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS habit_checkins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
          checked_at DATE NOT NULL,
          value INTEGER DEFAULT 1 NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT unique_habit_date UNIQUE(habit_id, checked_at)
        );

        CREATE TABLE IF NOT EXISTS todos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) DEFAULT 'default_user' NOT NULL,
          title TEXT NOT NULL,
          source TEXT DEFAULT 'web' NOT NULL,
          is_done BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          done_at TIMESTAMP
        );
      `;
      isPgConnected = true;
      console.log('✅ Connected to PostgreSQL database successfully.');
      return;
    } catch {
      isPgConnected = false;
    }
  }

  isPgConnected = false;
  console.log('📁 PostgreSQL offline/unreachable: Running in resilient Local File Mode (.data/habit_tracker.json)');
  loadLocalStore();
}

// Data Access Service (Unified DB Layer)
export const dbService = {
  async getHabits() {
    const store = loadLocalStore();
    return store.habits.filter((h) => h.isActive);
  },

  async getHabitById(id: string) {
    const store = loadLocalStore();
    return store.habits.find((h) => h.id === id && h.isActive) || null;
  },

  async getCheckins(habitId: string) {
    const store = loadLocalStore();
    return store.checkins.filter((c) => c.habitId === habitId);
  },

  async createHabit(data: Partial<HabitModel>) {
    const store = loadLocalStore();
    const newHabit: HabitModel = {
      id: 'h-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: data.userId || 'default_user',
      name: data.name || 'Habit Baru',
      description: data.description || null,
      color: data.color || '#ff1744',
      icon: data.icon || 'flame',
      type: data.type || 'boolean',
      targetCount: data.targetCount || 1,
      unit: data.unit || 'kali',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.habits.unshift(newHabit);
    saveLocalStore(store);
    return newHabit;
  },

  async updateHabit(id: string, data: Partial<HabitModel>) {
    const store = loadLocalStore();
    const idx = store.habits.findIndex((h) => h.id === id);
    if (idx === -1) return null;

    store.habits[idx] = {
      ...store.habits[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.habits[idx];
  },

  async deleteHabit(id: string) {
    const store = loadLocalStore();
    store.habits = store.habits.filter((h) => h.id !== id);
    store.checkins = store.checkins.filter((c) => c.habitId !== id);
    saveLocalStore(store);
    return true;
  },

  async toggleCheckin(habitId: string, targetDate: string, mode: 'toggle' | 'set' | 'increment', value?: number) {
    const store = loadLocalStore();
    const habit = store.habits.find((h) => h.id === habitId);
    if (!habit) throw new Error('Habit not found');

    const existingIdx = store.checkins.findIndex(
      (c) => c.habitId === habitId && c.checkedAt === targetDate
    );

    let isChecked = false;
    let finalValue = 0;

    if (mode === 'toggle') {
      if (existingIdx !== -1) {
        store.checkins.splice(existingIdx, 1);
        isChecked = false;
        finalValue = 0;
      } else {
        const val = value !== undefined ? value : habit.type === 'count' ? habit.targetCount : 1;
        store.checkins.push({
          id: 'c-' + Date.now(),
          habitId,
          checkedAt: targetDate,
          value: val,
          createdAt: new Date().toISOString(),
        });
        isChecked = true;
        finalValue = val;
      }
    } else if (mode === 'set') {
      const val = value !== undefined ? value : 1;
      if (val <= 0) {
        if (existingIdx !== -1) store.checkins.splice(existingIdx, 1);
        isChecked = false;
        finalValue = 0;
      } else {
        if (existingIdx !== -1) {
          store.checkins[existingIdx].value = val;
        } else {
          store.checkins.push({
            id: 'c-' + Date.now(),
            habitId,
            checkedAt: targetDate,
            value: val,
            createdAt: new Date().toISOString(),
          });
        }
        isChecked = habit.type === 'count' ? val >= habit.targetCount : val >= 1;
        finalValue = val;
      }
    }

    saveLocalStore(store);

    const allCheckins = store.checkins.filter((c) => c.habitId === habitId);
    const stats = calculateStreakStats(allCheckins, habit.targetCount, habit.type);

    return { isChecked, value: finalValue, stats };
  },

  // Todos
  async getTodos(status?: 'all' | 'pending' | 'done', limit = 100) {
    const store = loadLocalStore();
    let list = store.todos;
    if (status === 'pending') {
      list = list.filter((t) => !t.isDone);
    } else if (status === 'done') {
      list = list.filter((t) => t.isDone);
    }
    return list.slice(0, limit);
  },

  async createTodo(title: string, source: 'popup' | 'web' = 'web', userId = 'default_user') {
    const store = loadLocalStore();
    const newTodo: TodoModel = {
      id: 't-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      title: title.trim(),
      source,
      isDone: false,
      createdAt: new Date().toISOString(),
      doneAt: null,
    };
    store.todos.unshift(newTodo);
    saveLocalStore(store);
    return newTodo;
  },

  async toggleTodo(id: string, isDone?: boolean, title?: string) {
    const store = loadLocalStore();
    const idx = store.todos.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = store.todos[idx];
    const nextDone = isDone !== undefined ? isDone : !current.isDone;

    store.todos[idx] = {
      ...current,
      ...(title !== undefined && { title: title.trim() }),
      isDone: nextDone,
      doneAt: nextDone ? new Date().toISOString() : null,
    };

    saveLocalStore(store);
    return store.todos[idx];
  },

  async deleteTodo(id: string) {
    const store = loadLocalStore();
    store.todos = store.todos.filter((t) => t.id !== id);
    saveLocalStore(store);
    return true;
  },
};
