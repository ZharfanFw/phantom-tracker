// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET (PERSONA 5 NEO-BRUTALISM THEME)
// ==============================================================================
// Petunjuk Penggunaan:
// 1. Install aplikasi "Scriptable" dari iOS App Store di iPhone.
// 2. Buat script baru, copy & paste isi file ini ke Scriptable.
// 3. Ubah variabel SERVER_URL di bawah ke alamat Tailscale / LAN home server Anda.
// 4. Pasang widget Scriptable di Home Screen (pilih ukuran Medium atau Large).
// ==============================================================================

const SERVER_URL = "http://YOUR_SERVER_IP:5050/api/widgets/today"; // Ganti dengan IP Tailscale/LAN

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
    const errMsg = errStack.addText("Server tidak dapat dijangkau. Periksa koneksi Tailscale / LAN.");
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

  const habitHeader = habitCol.addText(`[ HABIT: ${data.habits.doneToday}/${data.habits.total} ]`);
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

      const name = row.addText(h.name.length > 12 ? h.name.substring(0, 11) + "..." : h.name);
      name.textColor = new Color("#e0e0e0");
      name.font = Font.systemFont(10);

      row.addSpacer();
      const streak = row.addText(`${h.currentStreak}d`);
      streak.textColor = new Color("#ff1744");
      streak.font = Font.boldSystemFont(9);
      habitCol.addSpacer(2);
    });
  }

  contentStack.addSpacer(10);

  // Right column: Todos
  const todoCol = contentStack.addStack();
  todoCol.layoutVertically();

  const todoHeader = todoCol.addText(`[ TO-DO: ${data.todos.totalPending} PENDING ]`);
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

      const title = row.addText(t.title.length > 14 ? t.title.substring(0, 13) + "..." : t.title);
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
Script.complete();
