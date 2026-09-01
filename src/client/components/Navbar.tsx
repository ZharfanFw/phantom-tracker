import React from 'react';
import { Flame, Smartphone, Calendar, RefreshCw, BarChart3, CheckSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface NavbarProps {
  activeTab: 'overview' | 'habits' | 'todos';
  onTabChange: (tab: 'overview' | 'habits' | 'todos') => void;
  onOpenNewHabit: () => void;
  onOpenWidgetModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewHabit,
  onOpenWidgetModal,
  onRefresh,
  isRefreshing,
}) => {
  const todayFormatted = format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale });

  return (
    <header style={{ marginBottom: '1.25rem' }}>
      {/* Top Bar with Brand & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '0.75rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--p5-red)',
              border: 'var(--border-solid)',
              boxShadow: 'var(--shadow-sm)',
              transform: 'rotate(-4deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Flame size={22} strokeWidth={2.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1
              className="title-p5"
              style={{
                fontSize: '1.75rem',
                color: 'var(--p5-white)',
                letterSpacing: '1.5px',
                lineHeight: 1,
                textShadow: '2px 2px 0px var(--p5-red)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              PHANTOM TRACKER
            </h1>
            <p
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-accent)',
                color: 'var(--p5-gray-muted)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              TAKE YOUR TIME // ALL-OUT ROUTINE
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* Date pill visible on Tablet & Desktop */}
          <div
            className="p5-sticker yellow"
            style={{
              display: 'none',
              padding: '0.35rem 0.65rem',
              alignItems: 'center',
              gap: '5px',
            }}
            id="desktop-date-badge"
          >
            <Calendar size={13} strokeWidth={2.5} />
            <span>{todayFormatted}</span>
          </div>

          <button
            className="p5-btn p5-btn-secondary p5-btn-icon"
            onClick={onRefresh}
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button
            className="p5-btn p5-btn-secondary p5-btn-sm"
            onClick={onOpenWidgetModal}
            title="iOS Widget Guide"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Smartphone size={14} color="var(--p5-yellow)" />
            <span>WIDGET</span>
          </button>
        </div>
      </div>

      {/* Date banner for Mobile View */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          padding: '0.35rem 0.6rem',
          backgroundColor: 'var(--p5-dark-surface)',
          border: 'var(--border-solid)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--p5-yellow)' }}>
          <Calendar size={13} strokeWidth={2.5} />
          <span>{todayFormatted}</span>
        </div>
        <span className="p5-sticker red" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
          LIVE SYNC
        </span>
      </div>

      {/* Desktop / Tablet Nav Tabs */}
      <div className="p5-nav-tabs">
        <button
          className={`p5-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
        >
          <BarChart3 size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
          ALL-OUT OVERVIEW
        </button>
        <button
          className={`p5-tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => onTabChange('habits')}
        >
          <Flame size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
          HABIT STREAKS
        </button>
        <button
          className={`p5-tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => onTabChange('todos')}
        >
          <CheckSquare size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
          TO-DO MISSIONS
        </button>
      </div>
    </header>
  );
};
