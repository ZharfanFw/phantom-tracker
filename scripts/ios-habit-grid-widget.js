// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET 1: HABIT STREAK COMMIT GRID
// ==============================================================================
// Petunjuk:
// 1. Install aplikasi "Scriptable" dari iOS App Store di iPhone.
// 2. Buat script baru, copy & paste isi file ini ke Scriptable.
// 3. Ubah variabel SERVER_URL di bawah ke alamat Tailscale / LAN home server Anda.
// 4. Tambahkan Widget Scriptable ukuran Medium / Large di Home Screen iOS.
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

  const habitTitle = header.addText(primaryHabit.name);
  habitTitle.textColor = new Color("#ffffff");
  habitTitle.font = Font.heavySystemFont(12);

  header.addSpacer();

  const streakPill = header.addText(primaryHabit.currentStreak + "d STREAK");
  streakPill.textColor = new Color("#ffe600");
  streakPill.font = Font.boldSystemFont(11);

  widget.addSpacer(8);

  // --- GITHUB STYLE CONTRIBUTION HEAT GRID (DRAW VIA DRAWCONTEXT) ---
  // Draw 7 rows (days of week) x 12 columns (weeks)
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

  // Draw day labels
  for (let r = 0; r < rows; r++) {
    draw.setFont(Font.systemFont(8));
    draw.setTextColor(new Color("#797d94"));
    draw.drawText(dayLabels[r], new Point(0, r * (cellSize + cellGap) + 1));
  }

  // Draw cells
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

    // Draw border
    draw.setStrokeColor(new Color("#000000"));
    draw.setLineWidth(1);
    draw.strokeRect(rect);

    // If today, draw yellow highlight outline
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

  // --- FOOTER STATS ---
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
Script.complete();
