import { boot } from 'quasar/wrappers'
import useTheme from 'src/modules/useTheme';

export default boot(() => {
  const { setThemeColor, initAccentColor } = useTheme();
  initAccentColor();
  setThemeColor();
})
