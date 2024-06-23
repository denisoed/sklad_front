import { boot } from 'quasar/wrappers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

export default boot(async () => {
  const telegram = window?.Telegram?.WebApp;
  if (telegram?.initData) {
    telegram.expand()
    const { telegramAuth } = useJwtMethods()
    await telegramAuth()
    telegram.ready()
  }
})
