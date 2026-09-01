import React from 'react';
import { Habit } from '../services/api.ts';
import { ContributionGrid } from './ContributionGrid.tsx';
import { Flame, Trophy, Percent, Check, Plus, Edit2, Trash2, Target } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onToggleToday: (habitId: string) => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleToday,
  onToggleDate,
  onEdit,
  onDelete,
}) => {
  const isCheckedToday = habit.stats.checkedToday;

  return (
    <div className="p5-card">
      {/* Header with red or custom strip */}
      <div className="p5-card-header red-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: habit.color || 'var(--p5-red)',
              border: '2px solid #000',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Target size={16} strokeWidth={2.5} />
          </div>
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <h3
              className="label-p5"
              style={{
                fontSize: '0.95rem',
                color: 'var(--p5-white)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {habit.name}
            </h3>
            {habit.description && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--p5-gray-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <button
            className="p5-btn p5-btn-secondary p5-btn-icon"
            onClick={() => onEdit(habit)}
            title="Edit Habit"
            style={{ width: '30px', height: '30px', minHeight: '30px' }}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="p5-btn p5-btn-secondary p5-btn-icon"
            onClick={() => {
              if (window.confirm(`Hapus habit "${habit.name}"?`)) {
                onDelete(habit.id);
              }
            }}
            title="Delete Habit"
            style={{ width: '30px', height: '30px', minHeight: '30px', color: 'var(--p5-red)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p5-card-body">
        {/* Streak Metrics & Action */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '0.85rem',
          }}
        >
          {/* Streak Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <div
              className={`p5-sticker ${habit.stats.currentStreak > 0 ? 'red' : 'black'}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
            >
              <Flame size={12} strokeWidth={2.5} />
              <span>STREAK: <strong>{habit.stats.currentStreak} HARI</strong></span>
            </div>

            <div
              className="p5-sticker yellow"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
            >
              <Trophy size={12} strokeWidth={2.5} />
              <span>BEST: <strong>{habit.stats.longestStreak} HARI</strong></span>
            </div>

            <div
              className="p5-sticker white"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
            >
              <Percent size={12} strokeWidth={2.5} />
              <span>30D: <strong>{habit.stats.completionRate30d}%</strong></span>
            </div>
          </div>

          {/* Quick Check-in Button */}
          <button
            className={`p5-btn p5-btn-block ${isCheckedToday ? 'p5-btn-yellow' : 'p5-btn-primary'}`}
            onClick={() => onToggleToday(habit.id)}
            style={{
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
            }}
          >
            {isCheckedToday ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>HARI INI SELESAI</span>
              </>
            ) : (
              <>
                <Plus size={16} strokeWidth={3} />
                <span>CHECK HARI INI</span>
              </>
            )}
          </button>
        </div>

        {/* Contribution Graph Heat Map */}
        <div style={{ marginTop: '0.2rem', width: '100%', overflow: 'hidden' }}>
          <ContributionGrid
            cells={habit.recentGrid || habit.grid || []}
            color={habit.color}
            onToggleCell={(dateStr) => onToggleDate(habit.id, dateStr)}
          />
        </div>
      </div>
    </div>
  );
};
