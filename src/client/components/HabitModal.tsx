import React, { useState, useEffect } from 'react';
import { Habit } from '../services/api.ts';
import { X, Check } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  initialHabit?: Habit | null;
  onClose: () => void;
  onSave: (data: Partial<Habit>) => Promise<void>;
}

const COLOR_PRESETS = [
  '#ff1744', // Persona Red
  '#ffe600', // Persona Yellow
  '#00e5ff', // Cyan
  '#d500f9', // Neon Purple
  '#00e676', // Green
  '#ff6d00', // Flame Orange
  '#f5f5f7', // White
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  initialHabit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ff1744');
  const [type, setType] = useState<'boolean' | 'count'>('boolean');
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('kali');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setDescription(initialHabit.description || '');
      setColor(initialHabit.color || '#ff1744');
      setType(initialHabit.type || 'boolean');
      setTargetCount(initialHabit.targetCount || 1);
      setUnit(initialHabit.unit || 'kali');
    } else {
      setName('');
      setDescription('');
      setColor('#ff1744');
      setType('boolean');
      setTargetCount(1);
      setUnit('kali');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        color,
        type,
        targetCount: type === 'count' ? Number(targetCount) : 1,
        unit: type === 'count' ? unit.trim() : 'kali',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p5-modal-backdrop" onClick={onClose}>
      <div className="p5-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p5-card-header red-strip">
          <h3 className="title-p5" style={{ fontSize: '1.4rem', color: 'var(--p5-white)' }}>
            {initialHabit ? 'EDIT TARGET HABIT' : 'TARGET HABIT BARU'}
          </h3>
          <button
            onClick={onClose}
            className="p5-btn p5-btn-secondary p5-btn-icon"
            style={{ width: '32px', height: '32px', minHeight: '32px', padding: 0 }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.1rem' }}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              NAMA HABIT *
            </label>
            <input
              type="text"
              required
              className="p5-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Baca Buku 15 Menit, Workout, Coding"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              DESKRIPSI (OPSIONAL)
            </label>
            <input
              type="text"
              className="p5-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail target atau catatan motivasi..."
            />
          </div>

          {/* Type Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              TIPE PELACAKAN
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                type="button"
                className={`p5-btn p5-btn-sm ${type === 'boolean' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
                onClick={() => setType('boolean')}
              >
                CHECKLIST (YA/TIDAK)
              </button>
              <button
                type="button"
                className={`p5-btn p5-btn-sm ${type === 'count' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
                onClick={() => setType('count')}
              >
                TARGET HITUNGAN
              </button>
            </div>
          </div>

          {/* Target count & unit if count type */}
          {type === 'count' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                  TARGET HARIAN
                </label>
                <input
                  type="number"
                  min="1"
                  className="p5-input"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div>
                <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                  SATUAN
                </label>
                <input
                  type="text"
                  className="p5-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="gelas / halaman / menit"
                />
              </div>
            </div>
          )}

          {/* Color Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label-p5" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              AKSEN WARNA GRID
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: c,
                    border: color === c ? '2.5px solid #fff' : '2px solid #000',
                    boxShadow: color === c ? '0 0 5px rgba(255,255,255,0.8)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    display: 'grid',
                    placeContent: 'center',
                  }}
                >
                  {color === c && <Check size={14} color={c === '#ffe600' || c === '#f5f5f7' ? '#000' : '#fff'} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="p5-btn p5-btn-secondary p5-btn-sm" onClick={onClose}>
              BATAL
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="p5-btn p5-btn-primary p5-btn-sm">
              {saving ? 'MENYIMPAN...' : initialHabit ? 'SIMPAN PERUBAHAN' : 'BUAT TARGET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
