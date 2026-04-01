export const FEED_THEME_STORAGE_KEY = "feed_theme_mode";

export function readFeedDarkMode() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FEED_THEME_STORAGE_KEY) === "dark";
}

export function persistFeedDarkMode(isDarkMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FEED_THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
}
