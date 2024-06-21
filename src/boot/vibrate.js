// NOTE: use class "v-click-out-ignore" for ignore v-click-out

import { boot } from 'quasar/wrappers'

export default boot(async ({ app }) => {
  app.directive('vibrate', {
    beforeMount(el) {
      el.onClick = () => {
        if (window?.Telegram?.WebApp?.HapticFeedback) {
          window?.Telegram?.WebApp?.HapticFeedback.selectionChanged()
        }
      }
      document.addEventListener('click', el.onClick)
    },
    unmounted: el => {
      document.removeEventListener('click', el.onClick)
    },
  })
})
