const
  express = require('express'),
  serveStatic = require('serve-static'),
  history = require('connect-history-api-fallback'),
  helmet = require('helmet'),
  cors = require('cors'),
  port = process.env.PORT || 8080

const app = express()

app.use(cors())
app.use(helmet({
  contentSecurityPolicy: false,
}))
app.use(history())
app.use(serveStatic('dist/spa'))

app.listen(port, () => {
  console.log(`Server running on: ${port}`)
})
