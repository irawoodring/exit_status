export function openLoadOverlay(onLoad) {
  const dialog = document.createElement("dialog");
  dialog.className =
    "m-auto w-[28rem] max-w-[90vw] rounded-xl border border-white/10 bg-neutral-900 " +
    "p-0 text-gray-200 shadow-2xl backdrop:bg-black/70";

  dialog.innerHTML = `
    <div class="p-6">
      <h2 class="mb-1 text-lg font-semibold text-white">Load saved state</h2>
      <p class="mb-4 text-sm text-gray-400">Choose a .bin state file exported with "Save state".</p>

      <label class="dropzone flex cursor-pointer flex-col items-center justify-center gap-1
                    rounded-lg border-2 border-dashed border-white/15 px-4 py-8 text-center
                    text-sm text-gray-400 transition hover:border-indigo-400">
        <span class="filename">Click to choose a file, or drop it here</span>
        <input type="file" accept=".bin" class="hidden" />
      </label>

      <p class="error mt-3 hidden text-sm text-red-400"></p>

      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="cancel cursor-pointer rounded-lg border border-white/15 bg-white/5
                px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10">Cancel</button>
        <button type="button" class="load cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm
                font-medium text-white transition hover:bg-indigo-500
                disabled:cursor-not-allowed disabled:opacity-50" disabled>Load</button>
      </div>
    </div>`;

  const input = dialog.querySelector("input");
  const dropzone = dialog.querySelector(".dropzone");
  const filenameEl = dialog.querySelector(".filename");
  const errorEl = dialog.querySelector(".error");
  const loadBtn = dialog.querySelector(".load");
  let file = null;

  function setFile(f) {
    file = f;
    errorEl.classList.add("hidden");
    filenameEl.textContent = f ? `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)` : "Click to choose a file, or drop it here";
    loadBtn.disabled = !f;
  }

  input.addEventListener("change", () => setFile(input.files[0] ?? null));

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-indigo-400");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("border-indigo-400"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-indigo-400");
    setFile(e.dataTransfer.files[0] ?? null);
  });

  loadBtn.addEventListener("click", async () => {
    loadBtn.disabled = true;
    loadBtn.textContent = "Loading…";
    try {
      await onLoad(file);
      dialog.close();
    } catch (err) {
      errorEl.textContent = `Couldn't load that file: ${err.message ?? err}`;
      errorEl.classList.remove("hidden");
      loadBtn.textContent = "Load";
      loadBtn.disabled = false;
    }
  });

  dialog.querySelector(".cancel").addEventListener("click", () => dialog.close());
  // clicking the dimmed backdrop closes it (the padding lives on the inner div,
  // so only backdrop clicks target the dialog itself)
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => dialog.remove());

  document.body.append(dialog);
  dialog.showModal();
}
