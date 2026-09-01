// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET 1: HABIT STREAK COMMIT GRID
// ==============================================================================
// Petunjuk:
// 1. Ganti SERVER_URL di bawah ke alamat IP Tailscale / LAN home server Anda.
// 2. Di Widget Setting Scriptable pada Home Screen iOS, Anda bisa mengisi Parameter:
//    - Kosong (default) : Menampilkan habit pertama
//    - Angka (1, 2, 3...) : Menampilkan habit ke-N
//    - Nama habit (misal: "Olahraga") : Menampilkan habit sesuai nama
// ==============================================================================

const SERVER_URL = "http://YOUR_SERVER_IP:5050/api/widgets/today"; // Ganti dengan IP Tailscale/LAN

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#08080a");
  widget.setPadding(12, 14, 12, 14);

  // Auto refresh interval 5 menit
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 5);

  let data = null;
  try {
    const req = new Request(SERVER_URL);
    req.timeoutInterval = 8;
    req.headers = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    };
    data = await req.loadJSON();
  } catch (err) {
    data = null;
  }

  if (!data || !data.success || !data.habits || data.habits.items.length === 0) {
    const errTitle = widget.addText("[!] PHANTOM HABIT GRID");
    errTitle.textColor = new Color("#ff1744");
    errTitle.font = Font.heavySystemFont(13);
    widget.addSpacer(4);
    const errMsg = widget.addText(data ? "Belum ada target habit aktif." : "Server offline / periksa koneksi.");
    errMsg.textColor = new Color("#888888");
    errMsg.font = Font.systemFont(10);
    return widget;
  }

  // Dynamic habit selection via Widget Parameter
  const habits = data.habits.items;
  let targetHabit = habits[0];
  const param = args.widgetParameter ? args.widgetParameter.trim() : "";

  if (param) {
    const num = parseInt(param, 10);
    if (!isNaN(num) && num >= 1 && num <= habits.length) {
      targetHabit = habits[num - 1];
    } else {
      const found = habits.find((h) => h.name.toLowerCase().includes(param.toLowerCase()));
      if (found) targetHabit = found;
    }
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

  const habitTitle = header.addText(targetHabit.name);
  habitTitle.textColor = new Color("#ffffff");
  habitTitle.font = Font.heavySystemFont(12);

  header.addSpacer();

  const streakPill = header.addText(targetHabit.currentStreak + "d STREAK");
  streakPill.textColor = new Color("#ffe600");
  streakPill.font = Font.boldSystemFont(11);

  widget.addSpacer(8);

  // --- PRECISE GITHUB-STYLE COMMIT GRID (CALENDAR-ALIGNED VIA DRAWCONTEXT) ---
  const rows = 7; // Min s/d Sab
  const cols = 12; // 12 minggu terakhir
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
  const gridCells = targetHabit.grid || [];

  // Draw Day of Week Labels
  for (let r = 0; r < rows; r++) {
    draw.setFont(Font.systemFont(8));
    draw.setTextColor(new Color("#797d94"));
    draw.drawText(dayLabels[r], new Point(0, r * (cellSize + cellGap) + 1));
  }

  if (gridCells.length > 0) {
    const firstCell = gridCells[0];
    const firstDayOfWeek = firstCell.dayOfWeek;
    const totalCols = Math.ceil((gridCells.length + firstDayOfWeek) / 7);
    const startCol = Math.max(0, totalCols - cols);

    gridCells.forEach((c, idx) => {
      const rawCol = Math.floor((idx + firstDayOfWeek) / 7);
      const colIdx = rawCol - startCol;
      const rowIdx = c.dayOfWeek;

      if (colIdx >= 0 && colIdx < cols && rowIdx >= 0 && rowIdx < rows) {
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

        // Border
        draw.setStrokeColor(new Color("#000000"));
        draw.setLineWidth(1);
        draw.strokeRect(rect);

        // Highlight today
        if (c.isToday) {
          draw.setStrokeColor(new Color("#ffe600"));
          draw.setLineWidth(1.5);
          draw.strokeRect(rect);
        }
      }
    });
  }

  const gridImage = draw.getImage();
  const imageStack = widget.addImage(gridImage);
  imageStack.imageSize = new Size(canvasWidth, canvasHeight);

  widget.addSpacer(6);

  // --- FOOTER STATS ---
  const footer = widget.addStack();
  footer.centerAlignContent();

  const statusText = footer.addText(targetHabit.checkedToday ? "[✔] Hari ini Selesai" : "[ ] Belum Check-in");
  statusText.textColor = targetHabit.checkedToday ? new Color("#ffe600") : new Color("#888888");
  statusText.font = Font.boldSystemFont(9);

  footer.addSpacer();

  const bestText = footer.addText("Best: " + targetHabit.longestStreak + "d");
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
