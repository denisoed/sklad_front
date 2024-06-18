import { boot } from 'quasar/wrappers'
import useJwtMethods from 'src/modules/auth/useJwtMethods'

export default boot(async () => {
  const isTelegram = window?.Telegram?.WebApp?.initData;
  if (isTelegram) {
    const { telegramAuth } = useJwtMethods()
    await telegramAuth()
  }
})
