import QSwipeToClose from 'src/boot/QSwipeToClose/QSwipeToClose.vue';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.component('q-swipe-to-close', QSwipeToClose);
});
