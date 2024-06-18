import { boot } from 'quasar/wrappers'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'

export default boot(({ app }) => {
  app.use(PerfectScrollbar)
})
