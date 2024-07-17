import { boot } from 'quasar/wrappers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

function insertInlineStyles() {
  const style = document.createElement('style')
  style.innerHTML = `
    html {
      height: 100vh;
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
  if (telegram?.initData) {
    // insertInlineStyles()
    telegram.expand()
    const { telegramAuth } = useJwtMethods()
    await telegramAuth(JSON.stringify(telegram.initDataUnsafe), 'tg')
    telegram.ready()
  }
})
