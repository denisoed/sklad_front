import { LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { I18N_LOCALE } from 'src/config'

export default boot(({ app }) => {
  // Create I18n instance
  const i18n = createI18n({
    locale: (LocalStorage.getItem(I18N_LOCALE) || 'ru-RU'),
    legacy: false,
    globalInjection: true,
    messages
  })

  // Tell app to use the I18n instance
  app.use(i18n)
})
