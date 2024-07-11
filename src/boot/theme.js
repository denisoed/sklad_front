import { boot } from 'quasar/wrappers'
import { Dark } from 'quasar'
import useTheme from 'src/modules/useTheme';

export default boot(() => {
  const { setThemeColor } = useTheme();
  setThemeColor();
  const telegram = window?.Telegram?.WebApp;
  if (telegram?.initData) {
    telegram.setBackgroundColor(Dark.isActive ? '#222831' : '#f7f7f7')
    telegram.setHeaderColor(Dark.isActive ? '#222831' : '#f7f7f7')
  }
})
