import { LocalStorage, Dark } from 'quasar';
import { ref } from 'vue';
import { IS_DARK_MODE, MAIN_COLOR_DARK, MAIN_COLOR_LIGHT } from 'src/config'

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
  }

  function toggleTheme() {
    Dark.toggle();
    setThemeColor();
    LocalStorage.set(IS_DARK_MODE, isDark.value);
    const telegram = window?.Telegram?.WebApp;
    if (telegram?.initData) {
      telegram.setBackgroundColor(isDark.value ? '#222831' : '#f7f7f7')
      telegram.setHeaderColor(isDark.value ? '#222831' : '#f7f7f7')
    }
  }

  return {
    setThemeColor,
    toggleTheme,
    isDark
  }
}

export default useTheme;