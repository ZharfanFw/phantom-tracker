import React, { useState, useEffect, useCallback } from 'react';
import { api, Habit, Todo, WidgetSummary } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { HabitList } from './components/HabitList.tsx';
import { TodoList } from './components/TodoList.tsx';
import { HabitCard } from './components/HabitCard.tsx';
import { HabitModal } from './components/HabitModal.tsx';
import { WidgetModal } from './components/WidgetModal.tsx';
import { Flame, CheckSquare, BarChart3, Plus, Zap, Target } from 'lucide-react';

export const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [widgetSummary, setWidgetSummary] = useState<WidgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'todos'>('overview');

  // Modals
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [habitsData, todosData, summaryData] = await Promise.all([
        api.getHabits().catch(() => []),
        api.getTodos().catch(() => []),
        api.getWidgetSummary().catch(() => null),
      ]);
      setHabits(habitsData);
      setTodos(todosData);
      setWidgetSummary(summaryData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Toggle Habit Today
  const handleToggleHabitToday = async (habitId: string) => {
    try {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            const nextChecked = !h.stats.checkedToday;
            return {
              ...h,
              stats: {
                ...h.stats,
                checkedToday: nextChecked,
                currentStreak: nextChecked ? h.stats.currentStreak + 1 : Math.max(0, h.stats.currentStreak - 1),
              },
            };
          }
          return h;
        })
      );

      await api.toggleCheckin(habitId, undefined, 'toggle');
      fetchData();
    } catch (err) {
      console.error('Failed to toggle habit checkin:', err);
      fetchData();
    }
  };

  // Toggle Habit on Specific Date (from Grid)
  const handleToggleHabitDate = async (habitId: string, dateStr: string) => {
    try {
      await api.toggleCheckin(habitId, dateStr, 'toggle');
      fetchData();
    } catch (err) {
      console.error('Failed to toggle date checkin:', err);
    }
  };

  // Save Habit (Create or Update)
  const handleSaveHabit = async (data: Partial<Habit>) => {
    if (editingHabit) {
      await api.updateHabit(editingHabit.id, data);
    } else {
      await api.createHabit(data);
    }
    fetchData();
  };

  // Delete Habit
  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      fetchData();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  // Todo Actions
  const handleAddTodo = async (title: string) => {
    try {
      const newTodo = await api.createTodo(title, 'web');
      setTodos((prev) => [newTodo, ...prev]);
      fetchData();
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  const handleToggleTodo = async (id: string, nextDone: boolean) => {
    try {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDone: nextDone } : t))
      );
      await api.toggleTodo(id, nextDone);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      fetchData();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      await api.deleteTodo(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  // Summary Metrics
  const habitsDoneToday = habits.filter((h) => h.stats.checkedToday).length;
  const bestOverallStreak = habits.reduce((max, h) => Math.max(max, h.stats.currentStreak), 0);
  const pendingTodosCount = todos.filter((t) => !t.isDone).length;
  const completedTodosCount = todos.filter((t) => t.isDone).length;

  return (
    <div className="container">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setHabitModalOpen(true);
        }}
        onOpenWidgetModal={() => setWidgetModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Calling Card Banner */}
      <div className="calling-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#000',
              border: '2px solid #fff',
              transform: 'rotate(-4deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={20} color="var(--p5-yellow)" strokeWidth={2.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              className="title-p5"
              style={{ fontSize: '1.3rem', letterSpacing: '1px', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              MISSION: CONQUER YOUR ROUTINE
            </h2>
            <p style={{ fontSize: '0.74rem', fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--p5-yellow)', lineHeight: 1.25 }}>
              "Momen terpenting adalah konsistensi harian saat menyalakan hari baru."
            </p>
          </div>
        </div>
      </div>

      {/* Stats Metric Row (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="stats-grid">
        <div className="stat-box highlight">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={13} color="var(--p5-red)" strokeWidth={2.5} />
            <span className="label-p5" style={{ fontSize: '0.72rem', color: 'var(--p5-white)' }}>
              HABIT HARI INI
            </span>
          </div>
          <div className="stat-val">
            {habitsDoneToday} <span style={{ fontSize: '1.1rem', color: 'var(--p5-gray-muted)' }}>/ {habits.length}</span>
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={13} color="var(--p5-yellow)" strokeWidth={2.5} />
            <span className="label-p5" style={{ fontSize: '0.72rem', color: 'var(--p5-yellow)' }}>
              STREAK TERTINGGI
            </span>
          </div>
          <div className="stat-val" style={{ color: 'var(--p5-yellow)' }}>
            {bestOverallStreak} <span style={{ fontSize: '1rem' }}>HARI</span>
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={13} color="var(--p5-red)" strokeWidth={2.5} />
            <span className="label-p5" style={{ fontSize: '0.72rem', color: 'var(--p5-white)' }}>
              TO-DO PENDING
            </span>
          </div>
          <div className="stat-val" style={{ color: 'var(--p5-red)' }}>
            {pendingTodosCount}
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckSquare size={13} color="var(--p5-green)" strokeWidth={2.5} />
            <span className="label-p5" style={{ fontSize: '0.72rem', color: 'var(--p5-white)' }}>
              TO-DO SELESAI
            </span>
          </div>
          <div className="stat-val" style={{ color: 'var(--p5-green)' }}>
            {completedTodosCount}
          </div>
        </div>
      </div>

      {/* Main View based on Tab */}
      {activeTab === 'overview' && (
        <div className="grid-stack">
          {/* Top: Habit Highlights */}
          <div style={{ width: '100%', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <h2 className="title-p5" style={{ fontSize: '1.35rem', color: 'var(--p5-white)', margin: 0, whiteSpace: 'nowrap' }}>
                HABIT TRACKER GRID
              </h2>
              <button
                className="p5-btn p5-btn-primary p5-btn-sm"
                onClick={() => {
                  setEditingHabit(null);
                  setHabitModalOpen(true);
                }}
                style={{ flexShrink: 0 }}
              >
                <Plus size={14} strokeWidth={3} />
                <span>+ HABIT</span>
              </button>
            </div>

            {habits.slice(0, 3).map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleToday={handleToggleHabitToday}
                onToggleDate={handleToggleHabitDate}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setHabitModalOpen(true);
                }}
                onDelete={handleDeleteHabit}
              />
            ))}

            {habits.length > 3 && (
              <button
                className="p5-btn p5-btn-secondary p5-btn-block"
                onClick={() => setActiveTab('habits')}
                style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}
              >
                LIHAT SEMUA {habits.length} HABIT →
              </button>
            )}
          </div>

          {/* Bottom: To-Do Missions */}
          <div style={{ width: '100%', minWidth: 0, marginTop: '0.25rem' }}>
            <TodoList
              todos={todos}
              loading={loading}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>
        </div>
      )}

      {activeTab === 'habits' && (
        <HabitList
          habits={habits}
          loading={loading}
          onToggleToday={handleToggleHabitToday}
          onToggleDate={handleToggleHabitDate}
          onAddHabit={() => {
            setEditingHabit(null);
            setHabitModalOpen(true);
          }}
          onEditHabit={(h) => {
            setEditingHabit(h);
            setHabitModalOpen(true);
          }}
          onDeleteHabit={handleDeleteHabit}
        />
      )}

      {activeTab === 'todos' && (
        <TodoList
          todos={todos}
          loading={loading}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="mobile-bottom-bar">
        <button
          className={`mobile-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={17} strokeWidth={2.5} />
          <span>OVERVIEW</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <Flame size={17} strokeWidth={2.5} />
          <span>HABITS</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          <CheckSquare size={17} strokeWidth={2.5} />
          <span>TO-DO</span>
        </button>
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={habitModalOpen}
        initialHabit={editingHabit}
        onClose={() => {
          setHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
      />

      <WidgetModal
        isOpen={widgetModalOpen}
        onClose={() => setWidgetModalOpen(false)}
        summary={widgetSummary}
      />
    </div>
  );
};
