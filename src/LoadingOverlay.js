export function createLoadingOverlay(parent) {
  const el = document.createElement("div");
  el.className =
    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/85 " +
    "text-sm text-gray-300 transition-opacity duration-300";
  el.innerHTML = `
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400"></div>
    <div class="label">Starting…</div>
    <div class="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
      <div class="bar h-full w-0 bg-indigo-500 transition-[width] duration-200"></div>
    </div>
    <div class="file max-w-[90%] truncate text-xs text-gray-500"></div>
    <div class="error hidden max-w-[90%] text-center text-red-400"></div>`;
  parent.append(el);

  const label = el.querySelector(".label");
  const bar = el.querySelector(".bar");
  const file = el.querySelector(".file");
  const error = el.querySelector(".error");

  return {
    show() {
      bar.style.width = "0%";
      label.textContent = "Starting…";
      file.textContent = "";
      error.classList.add("hidden");
      el.classList.remove("opacity-0", "pointer-events-none");
    },
    progress(e) {
      file.textContent = e.file_name ?? "";
      const count = e.file_count || 1;
      // file_index may be 0- or 1-based; clamp so the bar never overshoots
      const frac = e.lengthComputable && e.total ? e.loaded / e.total : 0;
      const overall = Math.min(1, ((e.file_index ?? 0) + frac) / count);
      bar.style.width = `${Math.round(overall * 100)}%`;
      label.textContent = `Downloading… ${Math.round(overall * 100)}%`;
    },
    fail(e) {
      error.textContent = `Failed to load ${e?.file_name ?? "a file"}. Check your connection and reload.`;
      error.classList.remove("hidden");
      label.textContent = "Load failed";
    },
    hide() {
      el.classList.add("opacity-0", "pointer-events-none");
    },
  };
}
