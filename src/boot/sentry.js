import { boot } from 'quasar/wrappers'
import * as Sentry from '@sentry/vue'

export default boot(({ app, router }) => {
  console.log(process.env.NODE_ENV);
  Sentry.init({
    app,
    enabled: process.env.NODE_ENV === 'production',
    dsn: 'https://1fbb29e5518fed478c467c0a54fc4d1c@o4506315733991424.ingest.us.sentry.io/4507532710117376',
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
  })
})
