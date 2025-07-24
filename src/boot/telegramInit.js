import { boot } from 'quasar/wrappers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'
import { DEV_TG_INIT_DATA_UNSAFE } from 'src/config'

function insertInlineStyles() {
  const style = document.createElement('style')
  style.innerHTML = `
    html {
      height: var(--tg-viewport-stable-height);
      overflow: hidden;
    }
    body {
      top: 0 !important;
    }
  `.trim()
  document.head.appendChild(style)
}

export default boot(async () => {
  const telegram = window?.Telegram?.WebApp;
  if (DEV_TG_INIT_DATA_UNSAFE || telegram?.initData) {
    try {
      insertInlineStyles()
      telegram.expand()
      const { telegramAuth } = useJwtMethods()
      await telegramAuth(DEV_TG_INIT_DATA_UNSAFE || JSON.stringify(telegram.initDataUnsafe), 'tg')
      telegram.ready()
    } catch (error) {
      console.error('Telegram auth error:', error)
      throw error
    }
  }
})
