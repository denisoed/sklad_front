import { LocalStorage, Quasar } from 'quasar'
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
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

  const mapI18nToQuasarLocale = (i18nLocale) => {
    switch (i18nLocale) {
      case 'ru-RU':
        return 'ru'
      case 'en-US':
        return 'en-US'
      case 'kg-KG':
        // No official Quasar locale; fallback
        return 'ru'
      default:
        return 'en-US'
    }
  }

  const setQuasarLang = async (quasarLocale) => {
    try {
      const lang = await import(
        /* webpackInclude: /(en-US|ru)\.js$/ */
        `quasar/lang/${quasarLocale}`
      )
      Quasar.lang.set(lang.default)
    } catch (error) {
      const fallback = await import('quasar/lang/en-US')
      Quasar.lang.set(fallback.default)
    }
  }

  // Sync Quasar language with i18n and persist in LocalStorage
  const localeRef = i18n.global.locale
  watch(
    localeRef,
    async (newLocale) => {
      LocalStorage.set(I18N_LOCALE, newLocale)
      await setQuasarLang(mapI18nToQuasarLocale(newLocale))
    },
    { immediate: true }
  )
})
