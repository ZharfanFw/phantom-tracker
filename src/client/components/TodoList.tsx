import React, { useState, useMemo } from 'react';
import { Todo } from '../services/api.ts';
import { TodoItem } from './TodoItem.tsx';
import { Plus, ListTodo } from 'lucide-react';
import { parseISO, isToday, isYesterday } from 'date-fns';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onAddTodo: (title: string) => Promise<void>;
  onToggleTodo: (id: string, nextDone: boolean) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onAddTodo(newTitle.trim());
      setNewTitle('');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered todos
  const filteredTodos = useMemo(() => {
    if (filter === 'pending') return todos.filter((t) => !t.isDone);
    if (filter === 'done') return todos.filter((t) => t.isDone);
    return todos;
  }, [todos, filter]);

  // Grouping
  const grouped = useMemo(() => {
    const todayList: Todo[] = [];
    const yesterdayList: Todo[] = [];
    const olderList: Todo[] = [];

    for (const item of filteredTodos) {
      const d = parseISO(item.createdAt);
      if (isToday(d)) {
        todayList.push(item);
      } else if (isYesterday(d)) {
        yesterdayList.push(item);
      } else {
        olderList.push(item);
      }
    }

    return { todayList, yesterdayList, olderList };
  }, [filteredTodos]);

  const pendingCount = todos.filter((t) => !t.isDone).length;
  const completedCount = todos.filter((t) => t.isDone).length;

  return (
    <div>
      {/* Header & Quick Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <h2 className="title-p5" style={{ fontSize: '1.5rem', color: 'var(--p5-white)' }}>
            TO-DO LIST
          </h2>
          <span className="p5-sticker red">{pendingCount} PENDING</span>
          <span className="p5-sticker yellow">{completedCount} DONE</span>
        </div>

        {/* Filter Segmented Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', width: '100%', maxWidth: '340px' }}>
          <button
            className={`p5-btn p5-btn-sm ${filter === 'all' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ flex: 1 }}
          >
            SEMUA ({todos.length})
          </button>
          <button
            className={`p5-btn p5-btn-sm ${filter === 'pending' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
            onClick={() => setFilter('pending')}
            style={{ flex: 1 }}
          >
            PENDING
          </button>
          <button
            className={`p5-btn p5-btn-sm ${filter === 'done' ? 'p5-btn-yellow' : 'p5-btn-secondary'}`}
            onClick={() => setFilter('done')}
            style={{ flex: 1 }}
          >
            SELESAI
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <input
              type="text"
              className="p5-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tulis misi / to-do baru..."
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className="p5-btn p5-btn-primary"
              style={{ flexShrink: 0 }}
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">TAMBAH</span>
            </button>
          </div>
        </div>
        <p
          style={{
            fontSize: '0.68rem',
            color: 'var(--p5-gray-muted)',
            marginTop: '0.35rem',
            fontFamily: 'var(--font-accent)',
          }}
        >
          [SYSTEM NOTE] To-do harian otomatis dibuat dari popup laptop saat startup.
        </p>
      </form>

      {/* Todo Groups */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--p5-red)' }}>
          <div className="title-p5" style={{ fontSize: '1.4rem' }}>LOADING MISSIONS...</div>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div
          className="p5-card"
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--p5-dark-surface)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              backgroundColor: '#181922',
              border: 'var(--border-solid)',
              boxShadow: 'var(--shadow-yellow)',
              marginBottom: '0.75rem',
            }}
          >
            <ListTodo size={32} color="var(--p5-yellow)" strokeWidth={2.5} />
          </div>
          <h3 className="title-p5" style={{ fontSize: '1.5rem', color: 'var(--p5-yellow)' }}>
            TIDAK ADA TO-DO
          </h3>
          <p style={{ color: 'var(--p5-gray-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {filter === 'pending'
              ? 'Semua to-do sudah selesai! Target terpenuhi.'
              : 'Belum ada to-do yang tercatat. Tulis to-do baru di atas.'}
          </p>
        </div>
      ) : (
        <div>
          {/* Group 1: Hari Ini */}
          {grouped.todayList.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="p5-sticker red">HARI INI</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--p5-gray-muted)', fontFamily: 'var(--font-accent)' }}>
                  ({grouped.todayList.length} items)
                </span>
              </div>
              {grouped.todayList.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          )}

          {/* Group 2: Kemarin */}
          {grouped.yesterdayList.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="p5-sticker yellow">KEMARIN</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--p5-gray-muted)', fontFamily: 'var(--font-accent)' }}>
                  ({grouped.yesterdayList.length} items)
                </span>
              </div>
              {grouped.yesterdayList.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          )}

          {/* Group 3: Terdahulu */}
          {grouped.olderList.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="p5-sticker black">SEBELUMNYA</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--p5-gray-muted)', fontFamily: 'var(--font-accent)' }}>
                  ({grouped.olderList.length} items)
                </span>
              </div>
              {grouped.olderList.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
