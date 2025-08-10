import { LocalStorage, Dark } from 'quasar';
import { ref } from 'vue';
import { IS_DARK_MODE, MAIN_COLOR_DARK, MAIN_COLOR_LIGHT, ACCENT_COLOR, ACCENT_COLORS } from 'src/config'

const useTheme = () => {
  const isDark = ref(LocalStorage.getItem(IS_DARK_MODE) || true)

  function setThemeColor() {
    const content = isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT
    Dark.set(isDark.value);
    document.querySelector(
      'meta[name="theme-color"]'
    ).setAttribute(
      'content', content
    );
    document.querySelector(
      'meta[name="msapplication-TileColor"]'
    ).setAttribute(
      'content', content
    );
    const telegram = window?.Telegram?.WebApp;
    if (telegram?.initData) {
      telegram.setBackgroundColor(isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT)
      telegram.setHeaderColor(isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT)
    }
  }

  function setAccentColor(colorValue, colorRgb) {
    const root = document.documentElement;
    root.style.setProperty('--q-primary', colorValue);
    root.style.setProperty('--q-primary-rgb', colorRgb);
  }

  function initAccentColor() {
    const savedColor = LocalStorage.getItem(ACCENT_COLOR);
    if (savedColor) {
      setAccentColor(savedColor.value, savedColor.rgb);
    } else {
      // Set default color
      const defaultColor = ACCENT_COLORS[0];
      setAccentColor(defaultColor.value, defaultColor.rgb);
    }
  }

  function toggleTheme() {
    Dark.toggle();
    setThemeColor();
    LocalStorage.set(IS_DARK_MODE, isDark.value);
    const telegram = window?.Telegram?.WebApp;
    if (telegram?.initData) {
      telegram.setBackgroundColor(isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT)
      telegram.setHeaderColor(isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT)
    }
  }

  return {
    setThemeColor,
    toggleTheme,
    setAccentColor,
    initAccentColor,
    isDark
  }
}

export default useTheme;