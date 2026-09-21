const root = document.documentElement;

export const isDark = () => root.classList.contains("dark");

export function setTheme(mode) {
  root.classList.toggle("dark", mode === "dark");
  try { localStorage.setItem("theme", mode); } catch {}
}

export const toggleTheme = () => setTheme(isDark() ? "light" : "dark");

// follow OS changes until the user picks a theme themselves
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  if (!saved) root.classList.toggle("dark", e.matches);
});
