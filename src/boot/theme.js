import { boot } from 'quasar/wrappers'
import { LocalStorage, Dark } from 'quasar'
import { IS_DARK_MODE } from 'src/config'
import useTheme from 'src/modules/useTheme';

export default boot(() => {
  const { setMetaThemeColor } = useTheme();
  setMetaThemeColor();
  Dark.set(LocalStorage.getItem(IS_DARK_MODE));
})
