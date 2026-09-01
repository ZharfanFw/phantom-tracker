import React, { useState } from 'react';
import { WidgetSummary } from '../services/api.ts';
import { X, Copy, Check, Smartphone, Flame, CheckSquare, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary?: WidgetSummary | null;
}

// Universal clipboard copy helper (Safe for iOS Safari on non-HTTPS/IP addresses)
async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern clipboard API if available in secure context
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback...', err);
    }
  }

  // 2. iOS-safe execCommand fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0.01';
    textArea.style.fontSize = '16px'; // Prevent zoom on iOS

    document.body.appendChild(textArea);

    // Specific iOS Safari selection
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('All copy methods failed:', err);
    return false;
  }
}

export const WidgetModal: React.FC<WidgetModalProps> = ({ isOpen, onClose, summary }) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'habits' | 'todos'>('habits');
  const [selectedHabitIndex, setSelectedHabitIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);

  if (!isOpen) return null;

  const habitItems = summary?.habits.items || [];
  const selectedHabit = habitItems[selectedHabitIndex] || habitItems[0];
  const todoItems = summary?.todos.items || [
    ...(summary?.todos.pending || []),
    ...(summary?.todos.completed || []),
  ];

  // Script 1: Habit Grid Script
  const habitScriptCode = `// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET: HABIT STREAK COMMIT GRID
// ==============================================================================
const SERVER_URL = "http://YOUR_SERVER_IP:5050/api/widgets/today"; // Ganti dengan IP Tailscale/LAN

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#08080a");
  widget.setPadding(12, 14, 12, 14);

  let data = null;
  try {
    const req = new Request(SERVER_URL);
    req.timeoutInterval = 8;
    data = await req.loadJSON();
  } catch (err) {
    data = null;
  }

  if (!data || !data.success || !data.habits || data.habits.items.length === 0) {
    const errTitle = widget.addText("[!] PHANTOM HABIT GRID");
    errTitle.textColor = new Color("#ff1744");
    errTitle.font = Font.heavySystemFont(13);
    widget.addSpacer(4);
    const errMsg = widget.addText(data ? "Belum ada habit aktif." : "Server offline / tidak terjangkau.");
    errMsg.textColor = new Color("#888888");
    errMsg.font = Font.systemFont(10);
    return widget;
  }

  const primaryHabit = data.habits.items[0];

  // Header
  const header = widget.addStack();
  header.centerAlignContent();
  const brandSymbol = SFSymbol.named("flame.fill");
  if (brandSymbol) {
    const iconImg = header.addImage(brandSymbol.image);
    iconImg.tintColor = new Color("#ff1744");
    iconImg.imageSize = new Size(13, 13);
    header.addSpacer(4);
  }

  const habitTitle = header.addText(primaryHabit.name);
  habitTitle.textColor = new Color("#ffffff");
  habitTitle.font = Font.heavySystemFont(12);

  header.addSpacer();
  const streakPill = header.addText(primaryHabit.currentStreak + "d STREAK");
  streakPill.textColor = new Color("#ffe600");
  streakPill.font = Font.boldSystemFont(11);

  widget.addSpacer(8);

  // Contribution Grid via DrawContext (7 rows x 12 cols)
  const rows = 7;
  const cols = 12;
  const cellSize = 12;
  const cellGap = 3;
  const labelWidth = 24;

  const canvasWidth = labelWidth + cols * (cellSize + cellGap);
  const canvasHeight = rows * (cellSize + cellGap);

  const draw = new DrawContext();
  draw.size = new Size(canvasWidth, canvasHeight);
  draw.opaque = false;
  draw.respectScreenScale = true;

  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const gridCells = primaryHabit.grid || [];

  for (let r = 0; r < rows; r++) {
    draw.setFont(Font.systemFont(8));
    draw.setTextColor(new Color("#797d94"));
    draw.drawText(dayLabels[r], new Point(0, r * (cellSize + cellGap) + 1));
  }

  const totalSlots = rows * cols;
  const startIndex = Math.max(0, gridCells.length - totalSlots);
  const displayCells = gridCells.slice(startIndex);

  displayCells.forEach((c, idx) => {
    const colIdx = Math.floor(idx / rows);
    const rowIdx = idx % rows;

    const x = labelWidth + colIdx * (cellSize + cellGap);
    const y = rowIdx * (cellSize + cellGap);
    const rect = new Rect(x, y, cellSize, cellSize);

    let cellColor = new Color("#161720");
    if (c.isChecked) {
      cellColor = new Color("#ff1744");
    } else if (c.value > 0) {
      cellColor = new Color("#9e0e27");
    }

    draw.setFillColor(cellColor);
    draw.fill(rect);

    draw.setStrokeColor(new Color("#000000"));
    draw.setLineWidth(1);
    draw.strokeRect(rect);

    if (c.isToday) {
      draw.setStrokeColor(new Color("#ffe600"));
      draw.setLineWidth(1.5);
      draw.strokeRect(rect);
    }
  });

  const gridImage = draw.getImage();
  const imageStack = widget.addImage(gridImage);
  imageStack.imageSize = new Size(canvasWidth, canvasHeight);

  widget.addSpacer(6);

  // Footer
  const footer = widget.addStack();
  footer.centerAlignContent();
  const statusText = footer.addText(primaryHabit.checkedToday ? "[✔] Hari ini Selesai" : "[ ] Belum Check-in");
  statusText.textColor = primaryHabit.checkedToday ? new Color("#ffe600") : new Color("#888888");
  statusText.font = Font.boldSystemFont(9);

  footer.addSpacer();
  const bestText = footer.addText("Best: " + primaryHabit.longestStreak + "d");
  bestText.textColor = new Color("#ff1744");
  bestText.font = Font.boldSystemFont(9);

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();`;

  // Script 2: To-Do Checklist Script
  const todoScriptCode = `// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET: TO-DO MISSIONS CHECKLIST
// ==============================================================================
const SERVER_URL = "http://YOUR_SERVER_IP:5050/api/widgets/today"; // Ganti dengan IP Tailscale/LAN

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#08080a");
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
    const errTitle = widget.addText("[!] PHANTOM TO-DO");
    errTitle.textColor = new Color("#ff1744");
    errTitle.font = Font.heavySystemFont(13);
    widget.addSpacer(4);
    const errMsg = widget.addText("Server offline / tidak terjangkau.");
    errMsg.textColor = new Color("#888888");
    errMsg.font = Font.systemFont(10);
    return widget;
  }

  // Header
  const header = widget.addStack();
  header.centerAlignContent();
  const brandSymbol = SFSymbol.named("checkmark.square.fill");
  if (brandSymbol) {
    const iconImg = header.addImage(brandSymbol.image);
    iconImg.tintColor = new Color("#ffe600");
    iconImg.imageSize = new Size(13, 13);
    header.addSpacer(4);
  }

  const brandTitle = header.addText("TO-DO MISSIONS");
  brandTitle.textColor = new Color("#ffffff");
  brandTitle.font = Font.heavySystemFont(12);

  header.addSpacer();
  const countPill = header.addText(data.todos.totalPending + " PENDING");
  countPill.textColor = new Color("#ff1744");
  countPill.font = Font.boldSystemFont(10);

  widget.addSpacer(8);

  // To-do items list
  const allItems = data.todos.items || [];
  const displayItems = allItems.slice(0, 5);

  if (displayItems.length === 0) {
    const emptyText = widget.addText("✨ Tidak ada misi to-do saat ini.");
    emptyText.textColor = new Color("#797d94");
    emptyText.font = Font.systemFont(10);
  } else {
    displayItems.forEach((t) => {
      const row = widget.addStack();
      row.centerAlignContent();

      const checkText = row.addText(t.isDone ? "[✔] " : "[ ] ");
      checkText.textColor = t.isDone ? new Color("#00e676") : new Color("#ff1744");
      checkText.font = Font.boldSystemFont(10);

      const titleText = row.addText(t.title);
      titleText.textColor = t.isDone ? new Color("#666666") : new Color("#f0f0f0");
      titleText.font = Font.systemFont(10);
      titleText.lineLimit = 1;

      row.addSpacer();
      if (t.source === "popup") {
        const tag = row.addText("POPUP");
        tag.textColor = new Color("#ff1744");
        tag.font = Font.boldSystemFont(8);
      }

      widget.addSpacer(3);
    });
  }

  widget.addSpacer(4);

  // Footer
  const footer = widget.addStack();
  footer.centerAlignContent();
  const summaryText = footer.addText("Total: " + allItems.length + " | Selesai: " + data.todos.totalCompleted);
  summaryText.textColor = new Color("#797d94");
  summaryText.font = Font.systemFont(8);

  footer.addSpacer();
  const dateText = footer.addText(data.meta.date);
  dateText.textColor = new Color("#ffe600");
  dateText.font = Font.boldSystemFont(8);

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();`;

  const activeCode = activeWidgetTab === 'habits' ? habitScriptCode : todoScriptCode;

  const handleCopy = async () => {
    const success = await copyToClipboard(activeCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      // If clipboard API completely blocked by iOS, open the manual code view
      setShowRawCode(true);
      alert('Kliping otomatis terblokir browser. Silakan pilih dan salin teks langsung dari kotak kode di bawah.');
    }
  };

  return (
    <div className="p5-modal-backdrop" onClick={onClose}>
      <div className="p5-modal" style={{ maxWidth: '580px', width: '100%', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p5-card-header yellow-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            <Smartphone size={18} color="var(--p5-yellow)" style={{ flexShrink: 0 }} />
            <h3 className="title-p5" style={{ fontSize: '1.3rem', color: 'var(--p5-white)', margin: 0, whiteSpace: 'nowrap' }}>
              iOS WIDGET CENTER
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
          {/* Widget Type Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '1rem' }}>
            <button
              className={`p5-btn p5-btn-sm ${activeWidgetTab === 'habits' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
              onClick={() => setActiveWidgetTab('habits')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Flame size={14} strokeWidth={2.5} />
              <span>1. HABIT GRID WIDGET</span>
            </button>
            <button
              className={`p5-btn p5-btn-sm ${activeWidgetTab === 'todos' ? 'p5-btn-primary' : 'p5-btn-secondary'}`}
              onClick={() => setActiveWidgetTab('todos')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <CheckSquare size={14} strokeWidth={2.5} />
              <span>2. TO-DO WIDGET</span>
            </button>
          </div>

          {/* ========================================================
              VIEW 1: HABIT STREAK COMMIT GRID WIDGET PREVIEW
              ======================================================== */}
          {activeWidgetTab === 'habits' && (
            <div style={{ marginBottom: '1.15rem' }}>
              {/* Habit selector if multiple habits */}
              {habitItems.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--p5-gray-muted)', fontFamily: 'var(--font-accent)', whiteSpace: 'nowrap' }}>
                    Pilih Target:
                  </span>
                  {habitItems.map((h, idx) => (
                    <button
                      key={h.id}
                      className={`p5-btn p5-btn-sm ${selectedHabitIndex === idx ? 'p5-btn-yellow' : 'p5-btn-secondary'}`}
                      onClick={() => setSelectedHabitIndex(idx)}
                      style={{ minHeight: '24px', padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Simulated iOS Habit Commit Grid Widget Box */}
              <div
                style={{
                  backgroundColor: '#08080a',
                  border: 'var(--border-solid)',
                  boxShadow: 'var(--shadow-red)',
                  padding: '0.85rem',
                  color: '#fff',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Header inside widget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                    <Flame size={15} color="var(--p5-red)" strokeWidth={2.8} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {selectedHabit?.name || 'Habit Target'}
                    </span>
                  </div>
                  <span className="p5-sticker yellow" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', flexShrink: 0 }}>
                    🔥 {selectedHabit?.currentStreak || 0}d STREAK
                  </span>
                </div>

                {/* Commit Grid heat map rendered in widget */}
                <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px' }}>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', width: 'max-content' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateRows: 'repeat(7, 12px)',
                        gap: '3px',
                        fontSize: '0.58rem',
                        fontFamily: 'var(--font-accent)',
                        color: 'var(--p5-gray-muted)',
                        lineHeight: '12px',
                        userSelect: 'none',
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

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateRows: 'repeat(7, 12px)',
                        gridAutoFlow: 'column',
                        gridAutoColumns: '12px',
                        gap: '3px',
                      }}
                    >
                      {(selectedHabit?.grid || []).slice(-84).map((cell) => {
                        let bg = '#161720';
                        if (cell.isChecked) bg = '#ff1744';
                        else if (cell.value > 0) bg = '#9e0e27';

                        return (
                          <div
                            key={cell.date}
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: bg,
                              border: cell.isToday ? '1.5px solid #ffe600' : '1px solid #000',
                              gridRow: cell.dayOfWeek + 1,
                              boxShadow: cell.isChecked ? '0 0 3px rgba(255,23,68,0.5)' : 'none',
                            }}
                            title={`${cell.date}: ${cell.isChecked ? 'Selesai' : 'Belum'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer stats in widget */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid #1a1b24',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-accent)',
                  }}
                >
                  <span style={{ color: selectedHabit?.checkedToday ? 'var(--p5-yellow)' : 'var(--p5-gray-muted)', fontWeight: 800 }}>
                    {selectedHabit?.checkedToday ? '[✔] Hari ini Selesai' : '[ ] Belum Check-in'}
                  </span>
                  <span style={{ color: 'var(--p5-red)', fontWeight: 800 }}>
                    Best: {selectedHabit?.longestStreak || 0}d
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: TO-DO MISSIONS CHECKLIST WIDGET PREVIEW
              ======================================================== */}
          {activeWidgetTab === 'todos' && (
            <div style={{ marginBottom: '1.15rem' }}>
              {/* Simulated iOS To-Do Checklist Widget Box */}
              <div
                style={{
                  backgroundColor: '#08080a',
                  border: 'var(--border-solid)',
                  boxShadow: 'var(--shadow-yellow)',
                  padding: '0.85rem',
                  color: '#fff',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Header inside widget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckSquare size={15} color="var(--p5-yellow)" strokeWidth={2.8} />
                    <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>
                      TO-DO MISSIONS
                    </span>
                  </div>
                  <span className="p5-sticker red" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {summary?.todos.totalPending || 0} PENDING
                  </span>
                </div>

                {/* To-Do items with check / strike-through */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {todoItems.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.74rem',
                        padding: '0.3rem 0.45rem',
                        backgroundColor: '#13141b',
                        border: '1px solid #20212c',
                      }}
                    >
                      <span
                        style={{
                          color: t.isDone ? '#00e676' : 'var(--p5-red)',
                          fontWeight: 900,
                          flexShrink: 0,
                          fontFamily: 'var(--font-accent)',
                        }}
                      >
                        {t.isDone ? '[✔]' : '[ ]'}
                      </span>
                      <span
                        style={{
                          color: t.isDone ? 'var(--p5-gray-muted)' : '#f0f0f0',
                          textDecoration: t.isDone ? 'line-through' : 'none',
                          textDecorationColor: 'var(--p5-red)',
                          textDecorationThickness: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                        }}
                      >
                        {t.title}
                      </span>
                      {t.source === 'popup' && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--p5-red)', fontWeight: 800, flexShrink: 0, fontFamily: 'var(--font-accent)' }}>
                          POPUP
                        </span>
                      )}
                    </div>
                  ))}

                  {todoItems.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--p5-gray-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      Belum ada to-do missions saat ini.
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid #1a1b24',
                    fontSize: '0.68rem',
                    color: 'var(--p5-gray-muted)',
                    fontFamily: 'var(--font-accent)',
                  }}
                >
                  <span>Total: {summary?.todos.total || todoItems.length} | Selesai: {summary?.todos.totalCompleted || 0}</span>
                  <span style={{ color: 'var(--p5-yellow)', fontWeight: 800 }}>{summary?.meta.date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Code Viewer Toggle (Fail-safe for iOS) */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="p5-btn p5-btn-secondary p5-btn-sm p5-btn-block"
              onClick={() => setShowRawCode(!showRawCode)}
              style={{ justifyContent: 'space-between', fontSize: '0.74rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Code size={14} color="var(--p5-yellow)" />
                <span>{showRawCode ? 'SEMBUNYIKAN KODE SKRIP' : 'LIHAT / SALIN KODE MANUAL (JIKA TOMBOL COPY DIBLOKIR)'}</span>
              </div>
              {showRawCode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showRawCode && (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea
                  readOnly
                  value={activeCode}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '100%',
                    height: '140px',
                    backgroundColor: '#0a0a0f',
                    color: '#00e5ff',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    border: 'var(--border-solid)',
                    padding: '0.5rem',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre',
                  }}
                />
                <p style={{ fontSize: '0.65rem', color: 'var(--p5-gray-muted)', marginTop: '0.25rem' }}>
                  Tap di dalam kotak untuk select all, lalu pilih Copy di iPhone.
                </p>
              </div>
            )}
          </div>

          {/* Quick Setup Instructions */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="label-p5" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', color: 'var(--p5-white)' }}>
              CARA MEMASANG WIDGET DI IPHONE:
            </h4>
            <ol style={{ paddingLeft: '1.15rem', fontSize: '0.76rem', color: 'var(--p5-gray-light)', lineHeight: 1.5 }}>
              <li>Unduh aplikasi <strong>Scriptable</strong> dari iOS App Store.</li>
              <li>Klik tombol <strong>"COPY SCRIPT"</strong> di bawah untuk widget yang dipilih ({activeWidgetTab === 'habits' ? 'Habit Grid' : 'To-Do Checklist'}).</li>
              <li>Buka Scriptable, tekan tombol <strong>+</strong>, lalu Paste kodenya.</li>
              <li>Ganti <code>YOUR_SERVER_IP</code> dengan IP Tailscale/LAN home server.</li>
              <li>Tambahkan Widget Scriptable ukuran Medium di Home Screen iPhone!</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button className="p5-btn p5-btn-secondary p5-btn-sm" onClick={onClose}>
              TUTUP
            </button>
            <button className={`p5-btn p5-btn-sm ${copied ? 'p5-btn-yellow' : 'p5-btn-primary'}`} onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={15} strokeWidth={3} />
                  <span>KODE BERHASIL DI-COPY!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>COPY SCRIPT ({activeWidgetTab === 'habits' ? 'HABIT GRID' : 'TO-DO'})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
