import { useQuasar, LocalStorage } from 'quasar';
import { ref } from 'vue';
import { IS_DARK_MODE, MAIN_COLOR_DARK, MAIN_COLOR_LIGHT } from 'src/config'

const useTheme = () => {
  const $q = useQuasar();

  const isDark = ref(LocalStorage.getItem(IS_DARK_MODE) || false)

  function setMetaThemeColor() {
    const content = isDark.value ? MAIN_COLOR_DARK : MAIN_COLOR_LIGHT
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
    $q.dark.toggle();
    setMetaThemeColor();
    LocalStorage.set(IS_DARK_MODE, isDark.value);
  }

  return {
    setMetaThemeColor,
    toggleTheme,
    isDark
  }
}

export default useTheme;