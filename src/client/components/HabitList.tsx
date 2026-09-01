import React from 'react';
import { Habit } from '../services/api.ts';
import { HabitCard } from './HabitCard.tsx';
import { Plus, Target, Flame } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
  onToggleToday: (habitId: string) => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  loading,
  onToggleToday,
  onToggleDate,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div
          className="title-p5"
          style={{ fontSize: '2rem', color: 'var(--p5-red)', animation: 'pulse 1.5s infinite' }}
        >
          LOADING TARGETS...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 className="title-p5" style={{ fontSize: '1.75rem', color: 'var(--p5-white)' }}>
            ACTIVE HABITS
          </h2>
          <span className="p5-sticker red">{habits.length} TARGETS</span>
        </div>

        <button className="p5-btn p5-btn-primary" onClick={onAddHabit}>
          <Plus size={18} strokeWidth={3} />
          <span>TAMBAH HABIT</span>
        </button>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div
          className="p5-card"
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--p5-dark-surface)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#181922',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px var(--p5-red)',
              marginBottom: '1rem',
            }}
          >
            <Target size={36} color="var(--p5-red)" strokeWidth={2.5} />
          </div>
          <h3 className="title-p5" style={{ fontSize: '2rem', color: 'var(--p5-red)' }}>
            BELUM ADA HABIT
          </h3>
          <p
            style={{
              color: 'var(--p5-gray-muted)',
              maxWidth: '420px',
              margin: '0.5rem auto 1.5rem auto',
              fontSize: '0.9rem',
            }}
          >
            Mulai bangun rutinitas konsistenmu. Buat target habit pertamamu dan pantau streak harianmu!
          </p>
          <button className="p5-btn p5-btn-yellow" onClick={onAddHabit}>
            <Plus size={18} strokeWidth={3} />
            <span>BUAT HABIT PERTAMA</span>
          </button>
        </div>
      ) : (
        <div>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleToday={onToggleToday}
              onToggleDate={onToggleDate}
              onEdit={onEditHabit}
              onDelete={onDeleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
