// DARK MODE from vueUse: https://vueuse.org/core/usedark/#usedark

/* (function () {
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setting = localStorage.getItem("vueuse-color-scheme") || "auto";
  if (setting === "dark" || (prefersDark && setting !== "light")) {
    document.documentElement.classList.toggle("dark", true);
  } else {
    document.documentElement.classList.toggle("dark", false);
  }
})(); */

// Toggle dark mode on/off
// add typeScript
export const isDark = useDark({
  onChanged() {
    // On vueUse useDark isDark change, toggle .dark class in src\assets\styles\_theme_colors.scss
    document.documentElement.classList.toggle('dark')
  },
})
export const toggleDarkMode = useToggle(isDark)
// Export to be used in src\components\navigation\Navbar.vue
