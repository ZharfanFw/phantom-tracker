import React, { useState } from 'react';
import { WidgetSummary } from '../services/api.ts';
import { X, Copy, Check, Smartphone, Flame, Target, Zap } from 'lucide-react';

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary?: WidgetSummary | null;
}

export const WidgetModal: React.FC<WidgetModalProps> = ({ isOpen, onClose, summary }) => {
  const [copied, setCopied] = useState(false);
  const [widgetSize, setWidgetSize] = useState<'medium' | 'large'>('medium');

  if (!isOpen) return null;

  const scriptCode = `// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET (PERSONA 5 NEO-BRUTALISM THEME)
// ==============================================================================
// 1. Ganti SERVER_URL dengan IP Tailscale/LAN home server Anda
const SERVER_URL = "http://YOUR_SERVER_IP:5050/api/widgets/today";

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#090a0f");
  widget.setPadding(12, 14, 12, 14);

  let data = null;
  try {
    const req = new Request(SERVER_URL);
    req.timeoutInterval = 8;
    data = await req.loadJSON();
  } catch (err) {
    data = null;
  }

  if (!data || !data.success) {
    const errStack = widget.addStack();
    errStack.layoutVertically();
    const errTitle = errStack.addText("[!] PHANTOM TRACKER");
    errTitle.textColor = new Color("#ff1744");
    errTitle.font = Font.heavySystemFont(13);

    errStack.addSpacer(4);
    const errMsg = errStack.addText("Server offline / tidak terjangkau.");
    errMsg.textColor = new Color("#888888");
    errMsg.font = Font.systemFont(10);
    return widget;
  }

  // --- HEADER ---
  const header = widget.addStack();
  header.centerAlignContent();

  const brandSymbol = SFSymbol.named("flame.fill");
  if (brandSymbol) {
    const iconImg = header.addImage(brandSymbol.image);
    iconImg.tintColor = new Color("#ff1744");
    iconImg.imageSize = new Size(13, 13);
    header.addSpacer(4);
  }

  const brandTitle = header.addText("PHANTOM TRACKER");
  brandTitle.textColor = new Color("#ff1744");
  brandTitle.font = Font.heavySystemFont(13);

  header.addSpacer();

  const datePill = header.addText(data.meta.date);
  datePill.textColor = new Color("#ffe600");
  datePill.font = Font.boldSystemFont(10);

  widget.addSpacer(8);

  // --- CONTENT SECTION: HABITS & TODOS ---
  const contentStack = widget.addStack();
  contentStack.layoutHorizontally();

  // Left column: Habits
  const habitCol = contentStack.addStack();
  habitCol.layoutVertically();

  const habitHeader = habitCol.addText("[ HABITS: " + data.habits.doneToday + "/" + data.habits.total + " ]");
  habitHeader.textColor = new Color("#ffffff");
  habitHeader.font = Font.heavySystemFont(10);
  habitCol.addSpacer(3);

  const habitItems = data.habits.items.slice(0, 3);
  if (habitItems.length === 0) {
    const noHabit = habitCol.addText("Belum ada target");
    noHabit.textColor = new Color("#666666");
    noHabit.font = Font.systemFont(9);
  } else {
    habitItems.forEach((h) => {
      const row = habitCol.addStack();
      row.centerAlignContent();

      const mark = row.addText(h.checkedToday ? "[x] " : "[ ] ");
      mark.textColor = h.checkedToday ? new Color("#ffe600") : new Color("#666666");
      mark.font = Font.boldSystemFont(10);

      const name = row.addText(h.name.length > 11 ? h.name.substring(0, 10) + "..." : h.name);
      name.textColor = new Color("#e0e0e0");
      name.font = Font.systemFont(10);

      row.addSpacer();
      const streak = row.addText(h.currentStreak + "d");
      streak.textColor = new Color("#ff1744");
      streak.font = Font.boldSystemFont(9);
      habitCol.addSpacer(2);
    });
  }

  contentStack.addSpacer(10);

  // Right column: Todos
  const todoCol = contentStack.addStack();
  todoCol.layoutVertically();

  const todoHeader = todoCol.addText("[ TO-DO: " + data.todos.totalPending + " PENDING ]");
  todoHeader.textColor = new Color("#ffffff");
  todoHeader.font = Font.heavySystemFont(10);
  todoCol.addSpacer(3);

  const pendingList = data.todos.pending.slice(0, 3);
  if (pendingList.length === 0) {
    const allDone = todoCol.addText("Semua misi selesai!");
    allDone.textColor = new Color("#ffe600");
    allDone.font = Font.italicSystemFont(9);
  } else {
    pendingList.forEach((t) => {
      const row = todoCol.addStack();
      row.centerAlignContent();

      const bullet = row.addText("- ");
      bullet.textColor = new Color("#ff1744");
      bullet.font = Font.boldSystemFont(9);

      const title = row.addText(t.title.length > 12 ? t.title.substring(0, 11) + "..." : t.title);
      title.textColor = new Color("#cccccc");
      title.font = Font.systemFont(9);
      todoCol.addSpacer(2);
    });
  }

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p5-modal-backdrop" onClick={onClose}>
      <div className="p5-modal" style={{ maxWidth: '560px', width: '100%', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p5-card-header yellow-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            <Smartphone size={18} color="var(--p5-yellow)" style={{ flexShrink: 0 }} />
            <h3 className="title-p5" style={{ fontSize: '1.3rem', color: 'var(--p5-white)', margin: 0, whiteSpace: 'nowrap' }}>
              iOS WIDGET GUIDE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p5-btn p5-btn-secondary p5-btn-icon"
            style={{ width: '30px', height: '30px', minHeight: '30px', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '0.9rem', width: '100%', boxSizing: 'border-box' }}>
          {/* Simulated iOS Widget Live Preview */}
          <div style={{ marginBottom: '1.15rem', width: '100%', boxSizing: 'border-box' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.45rem',
                flexWrap: 'wrap',
              }}
            >
              <span className="label-p5" style={{ fontSize: '0.76rem', color: 'var(--p5-white)' }}>
                PREVIEW WIDGET IPHONE
              </span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  className={`p5-btn p5-btn-sm ${widgetSize === 'medium' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
                  onClick={() => setWidgetSize('medium')}
                  style={{ minHeight: '26px', padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}
                >
                  MEDIUM
                </button>
                <button
                  className={`p5-btn p5-btn-sm ${widgetSize === 'large' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
                  onClick={() => setWidgetSize('large')}
                  style={{ minHeight: '26px', padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}
                >
                  LARGE
                </button>
              </div>
            </div>

            {/* Simulated Widget Box (Strictly Contained) */}
            <div
              style={{
                backgroundColor: '#090a0f',
                border: 'var(--border-solid)',
                boxShadow: 'var(--shadow-red)',
                padding: '0.75rem 0.85rem',
                color: '#fff',
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                minHeight: widgetSize === 'medium' ? '150px' : '250px',
              }}
            >
              {/* Widget Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.6rem',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <Flame size={14} color="var(--p5-red)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem',
                      color: 'var(--p5-red)',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    PHANTOM TRACKER
                  </span>
                </div>
                <span className="p5-sticker yellow" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', flexShrink: 0 }}>
                  {summary?.meta.date || 'TODAY'}
                </span>
              </div>

              {/* Grid content inside simulated widget (Strict Two-Column on Medium, Single on Large) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: widgetSize === 'large' ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '0.55rem',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Habit Column */}
                <div style={{ minWidth: 0, width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--p5-white)',
                      marginBottom: '0.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Target size={11} color="var(--p5-red)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>HABIT ({summary?.habits.doneToday || 0}/{summary?.habits.total || 0})</span>
                  </div>

                  {summary?.habits.items.slice(0, widgetSize === 'large' ? 4 : 2).map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '3px',
                        fontSize: '0.68rem',
                        marginBottom: '0.2rem',
                        padding: '0.2rem 0.35rem',
                        backgroundColor: '#14151f',
                        border: '1px solid #000',
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          minWidth: 0,
                          flex: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{ color: h.checkedToday ? 'var(--p5-yellow)' : '#888', fontWeight: 800, flexShrink: 0 }}>
                          {h.checkedToday ? '[x]' : '[ ]'}
                        </span>
                        <span
                          style={{
                            color: '#e0e0e0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0,
                          }}
                        >
                          {h.name}
                        </span>
                      </div>
                      <span style={{ color: 'var(--p5-red)', fontWeight: 800, fontSize: '0.65rem', flexShrink: 0 }}>
                        {h.currentStreak}d
                      </span>
                    </div>
                  ))}
                  {(!summary?.habits.items || summary.habits.items.length === 0) && (
                    <div style={{ fontSize: '0.65rem', color: '#888', fontStyle: 'italic' }}>
                      Belum ada habit
                    </div>
                  )}
                </div>

                {/* Todos Column */}
                <div style={{ minWidth: 0, width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--p5-white)',
                      marginBottom: '0.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Zap size={11} color="var(--p5-yellow)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>TO-DO ({summary?.todos.totalPending || 0})</span>
                  </div>

                  {summary?.todos.pending.slice(0, widgetSize === 'large' ? 4 : 2).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.68rem',
                        marginBottom: '0.2rem',
                        padding: '0.2rem 0.35rem',
                        backgroundColor: '#14151f',
                        border: '1px solid #000',
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ color: 'var(--p5-red)', fontWeight: 800, flexShrink: 0 }}>-</span>
                      <span
                        style={{
                          color: '#cccccc',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {t.title}
                      </span>
                    </div>
                  ))}
                  {(!summary?.todos.pending || summary.todos.pending.length === 0) && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--p5-yellow)', fontStyle: 'italic' }}>
                      Semua misi selesai!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div style={{ marginBottom: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <h4 className="label-p5" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', color: 'var(--p5-white)' }}>
              LANGKAH PEMASANGAN DI IPHONE:
            </h4>
            <ol style={{ paddingLeft: '1.15rem', fontSize: '0.76rem', color: 'var(--p5-gray-light)', lineHeight: 1.5 }}>
              <li>Install <strong>Scriptable</strong> dari App Store di iPhone.</li>
              <li>Klik tombol <strong>"COPY SCRIPT"</strong> di bawah.</li>
              <li>Buka Scriptable, tekan <strong>+</strong>, paste kode skrip.</li>
              <li>Ganti <code>YOUR_SERVER_IP</code> dengan IP Tailscale/LAN home server.</li>
              <li>Tambahkan Widget Scriptable ke Home Screen!</li>
            </ol>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button className="p5-btn p5-btn-secondary p5-btn-sm" onClick={onClose}>
              TUTUP
            </button>
            <button className={`p5-btn p5-btn-sm ${copied ? 'p5-btn-yellow' : 'p5-btn-primary'}`} onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={15} strokeWidth={3} />
                  <span>BERHASIL DI-COPY</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>COPY SCRIPT SCRIPTABLE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
