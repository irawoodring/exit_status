const BASE =
  "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition " +
  "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary:
  "border border-black/15 bg-black/5 text-gray-800 hover:bg-black/10 " +
  "dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function createButtonPanel(buttons) {
  const panel = document.createElement("div");
  panel.className = "grid grid-cols-2 content-start gap-2";

  const els = {};
  for (const { id, label, onClick, variant = "secondary", wide = false } of buttons) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = `${BASE} ${VARIANTS[variant]} ${wide ? "col-span-2" : ""}`;
    btn.addEventListener("click", onClick);
    // give focus back so Space/Enter keystrokes for the VM don't re-click the button
    btn.addEventListener("mouseup", () => btn.blur());
    panel.append(btn);
    if (id) els[id] = btn;
  }

  return { element: panel, buttons: els };
}
