// NOTE: use class "v-click-out-ignore" for ignore v-click-out

import { boot } from 'quasar/wrappers'

export default boot(async ({ app }) => {
  app.directive('clickOut', {
    beforeMount(el, binding) {
      el.clickOutsideEvent = event => {
        if (!(
          el == event.target ||
          el.contains(event.target) ||
          event.target.classList.contains('v-click-out-ignore')
        )) {
          binding.value(event)
        }
      }
      document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted: el => {
      document.removeEventListener('click', el.clickOutsideEvent)
    },
  })
})
