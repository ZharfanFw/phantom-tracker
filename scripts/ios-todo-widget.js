// ==============================================================================
// PHANTOM TRACKER // iOS SCRIPTABLE WIDGET 2: TO-DO MISSIONS CHECKLIST
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
  countPill.textColor = new Color("#ff1744");
  countPill.font = Font.boldSystemFont(10);

  widget.addSpacer(8);

  // --- LIST OF TODOS ---
  const allItems = data.todos.items || [];
  const maxItems = 5;
  const displayItems = allItems.slice(0, maxItems);

  if (displayItems.length === 0) {
    const emptyText = widget.addText("✨ Tidak ada misi to-do saat ini.");
    emptyText.textColor = new Color("#797d94");
    emptyText.font = Font.systemFont(10);
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
  const summaryText = footer.addText(`Total: ${allItems.length} | Selesai: ${data.todos.totalCompleted}`);
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
