// ---------------------- //
// ONLY TELEGRAM WEB APP
// ---------------------- //

import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.directive('vibrate', {
    mounted(el, binding) {
      el.onClick = function() {
        if (window?.Telegram?.WebApp) {
          if (binding?.modifiers?.success) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          } else {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
          }
        }
      };
      el.addEventListener('click', el.onClick);
    },
    unmounted(el) {
      el.removeEventListener('click', el.onClick);
    },
  });
});