// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET 2: TO-DO MISSIONS CHECKLIST
// ==============================================================================
// Petunjuk:
// 1. Ganti SERVER_URL di bawah ke alamat IP Tailscale / LAN home server Anda.
// 2. Di Widget Setting Scriptable pada Home Screen iOS, Anda bisa mengisi Parameter:
//    - Kosong (default) : Menampilkan misi pending teratas diikuti yang selesai
//    - "pending" : Hanya menampilkan to-do yang belum selesai
//    - "done" : Hanya menampilkan to-do yang sudah selesai
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

  if (!data || !data.success) {
    const errTitle = widget.addText("[!] PHANTOM TO-DO");
    errTitle.textColor = new Color("#ff1744");
    errTitle.font = Font.heavySystemFont(13);
    widget.addSpacer(4);
    const errMsg = widget.addText(data ? "Tidak ada to-do." : "Server offline / periksa koneksi.");
    errMsg.textColor = new Color("#888888");
    errMsg.font = Font.systemFont(10);
    return widget;
  }

  // --- FILTER ITEMS ---
  const param = args.widgetParameter ? args.widgetParameter.trim().toLowerCase() : "all";
  const pending = data.todos.pending || [];
  const completed = data.todos.completed || [];

  let displayItems = [];
  if (param === "pending") {
    displayItems = pending.slice(0, 6);
  } else if (param === "done") {
    displayItems = completed.slice(0, 6);
  } else {
    // Show up to 4 pending, then remaining slots for completed
    const maxTotal = 5;
    const pendingSlice = pending.slice(0, 4);
    const completedSlice = completed.slice(0, maxTotal - pendingSlice.length);
    displayItems = [...pendingSlice, ...completedSlice];
  }

  // --- HEADER ---
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
  countPill.textColor = data.todos.totalPending > 0 ? new Color("#ff1744") : new Color("#00e676");
  countPill.font = Font.boldSystemFont(10);

  widget.addSpacer(8);

  // --- TO-DO ITEMS LIST ---
  if (displayItems.length === 0) {
    const emptyText = widget.addText(data.todos.totalPending === 0 ? "Semua target hari ini selesai!" : "Belum ada misi to-do.");
    emptyText.textColor = new Color("#ffe600");
    emptyText.font = Font.italicSystemFont(10);
  } else {
    displayItems.forEach((t) => {
      const row = widget.addStack();
      row.centerAlignContent();

      // Checkmark indicator
      const checkText = row.addText(t.isDone ? "[✔] " : "[ ] ");
      checkText.textColor = t.isDone ? new Color("#00e676") : new Color("#ff1744");
      checkText.font = Font.boldSystemFont(10);

      // Title
      const titleText = row.addText(t.title);
      titleText.textColor = t.isDone ? new Color("#666666") : new Color("#f0f0f0");
      titleText.font = Font.systemFont(10);
      titleText.lineLimit = 1;

      row.addSpacer();

      // Source Tag
      if (t.source === "popup") {
        const tag = row.addText("POPUP");
        tag.textColor = new Color("#ff1744");
        tag.font = Font.boldSystemFont(8);
      }

      widget.addSpacer(3);
    });
  }

  widget.addSpacer(4);

  // --- FOOTER ---
  const footer = widget.addStack();
  footer.centerAlignContent();
  const summaryText = footer.addText(`Pending: ${data.todos.totalPending} | Selesai: ${data.todos.totalCompleted}`);
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
Script.complete();
