import { boot } from 'quasar/wrappers'
import { LocalStorage, Dark } from 'quasar'
import { IS_DARK_MODE } from 'src/config'
import useTheme from 'src/modules/useTheme';

export default boot(() => {
  const { setMetaThemeColor } = useTheme();
  setMetaThemeColor();
  Dark.set(LocalStorage.getItem(IS_DARK_MODE));
  const telegram = window?.Telegram?.WebApp;
  if (telegram?.initData) {
    telegram.setBackgroundColor(Dark.isActive ? '#222831' : '#f7f7f7')
    telegram.setHeaderColor(Dark.isActive ? '#222831' : '#f7f7f7')
  }
})
