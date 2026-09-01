import React from 'react';
import { Todo } from '../services/api.ts';
import { Trash2, Laptop, Globe, Zap } from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, nextDone: boolean) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const createdDate = parseISO(todo.createdAt);

  const getFormattedTime = () => {
    try {
      if (isToday(createdDate)) {
        return `Hari ini, ${format(createdDate, 'HH:mm')}`;
      }
      if (isYesterday(createdDate)) {
        return `Kemarin, ${format(createdDate, 'HH:mm')}`;
      }
      return format(createdDate, 'd MMM, HH:mm', { locale: idLocale });
    } catch {
      return '';
    }
  };

  return (
    <div className={`todo-card ${todo.isDone ? 'completed' : ''}`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.isDone}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`Mark "${todo.title}" as ${todo.isDone ? 'incomplete' : 'complete'}`}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="todo-title"
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: todo.isDone ? 'var(--p5-gray-muted)' : 'var(--p5-white)',
            wordBreak: 'break-word',
            lineHeight: 1.35,
          }}
        >
          {todo.title}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Source Badge */}
          {todo.source === 'popup' ? (
            <span
              className="p5-sticker red"
              style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Dibuat dari Quickshell popup saat laptop dinyalakan"
            >
              <Zap size={10} strokeWidth={2.5} />
              <span>POPUP FORCE HABIT</span>
            </span>
          ) : (
            <span
              className="p5-sticker black"
              style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Globe size={10} strokeWidth={2.5} />
              <span>WEB</span>
            </span>
          )}

          {/* Time text */}
          <span style={{ fontSize: '0.72rem', color: 'var(--p5-gray-muted)', fontFamily: 'var(--font-accent)' }}>
            {getFormattedTime()}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(todo.id)}
        className="p5-btn p5-btn-secondary p5-btn-icon"
        style={{
          width: '32px',
          height: '32px',
          padding: 0,
          flexShrink: 0,
          color: 'var(--p5-gray-muted)',
          boxShadow: 'none',
          border: '1px solid #222',
        }}
        title="Hapus Todo"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
