import React, { useState } from 'react';
import { DayCell } from '../services/api.ts';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ContributionGridProps {
  cells?: DayCell[];
  color?: string;
  onToggleCell?: (dateStr: string) => void;
  compact?: boolean;
}

export const ContributionGrid: React.FC<ContributionGridProps> = ({
  cells = [],
  color = '#ff1744',
  onToggleCell,
  compact = false,
}) => {
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);

  if (!cells || cells.length === 0) {
    return <div className="text-muted text-sm py-2">Tidak ada riwayat aktivitas</div>;
  }

  const getIntensityClass = (cell: DayCell) => {
    if (!cell.isChecked && cell.value === 0) return 'level-0';
    if (cell.value === 1 || cell.isChecked) return 'level-3';
    if (cell.value === 2) return 'level-2';
    if (cell.value >= 3) return 'level-4';
    return 'level-1';
  };

  return (
    <div className="contribution-wrapper">
      <div className="heat-grid-container">
        <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', width: 'max-content' }}>
          {/* Day of Week labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 13px)',
              gap: '3px',
              fontSize: '0.6rem',
              fontFamily: 'var(--font-accent)',
              color: 'var(--p5-gray-muted)',
              lineHeight: '13px',
              paddingTop: '2px',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Grid Cells */}
          <div className="heat-grid">
            {cells.map((cell) => {
              const intensityClass = getIntensityClass(cell);
              const isTodayClass = cell.isToday ? 'is-today' : '';

              return (
                <div
                  key={cell.date}
                  className={`heat-cell ${intensityClass} ${isTodayClass}`}
                  style={{
                    gridRow: cell.dayOfWeek + 1,
                    ...(cell.isChecked && color !== '#ff1744' ? { backgroundColor: color } : {}),
                  }}
                  onClick={() => onToggleCell && onToggleCell(cell.date)}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={`${cell.date}: ${cell.isChecked ? 'Selesai' : 'Belum'}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip on hover / touch */}
      {hoveredCell && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-6px)',
            backgroundColor: '#000',
            color: '#fff',
            border: '2px solid var(--p5-red)',
            padding: '3px 6px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-accent)',
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'var(--p5-yellow)', fontWeight: 800 }}>
            {format(parseISO(hoveredCell.date), 'dd MMM yyyy', { locale: idLocale })}
          </span>
          : {hoveredCell.isChecked ? '[ SELESAI ]' : '[ BELUM ]'}
        </div>
      )}

      {/* Legend & Touch Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.4rem',
          fontSize: '0.65rem',
          color: 'var(--p5-gray-muted)',
          fontFamily: 'var(--font-accent)',
          flexWrap: 'wrap',
          gap: '0.25rem',
        }}
      >
        <span>Geser horizontal untuk riwayat</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>Less</span>
          <div className="heat-cell level-0" style={{ width: '9px', height: '9px' }} />
          <div className="heat-cell level-1" style={{ width: '9px', height: '9px' }} />
          <div className="heat-cell level-2" style={{ width: '9px', height: '9px' }} />
          <div className="heat-cell level-3" style={{ width: '9px', height: '9px' }} />
          <div className="heat-cell level-4" style={{ width: '9px', height: '9px' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
