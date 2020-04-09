import http from 'http'
import polka from 'polka'
import sirv from 'sirv'
import { init } from './sockets/index.js'
import { readFileSync } from 'fs'

const { PORT = 3090, NODE_ENV = 'development' } = process.env
const server = http.createServer()

const app = polka({ server })

if (NODE_ENV === 'production') {
  const index = readFileSync('./dist/index.html')
  app
    .use(
      sirv('dist', {
        maxAge: 31536000, // 1Y
        immutable: true,
      })
    )
    .get('/*', (req, res) => {
      res.end(index)
    })
}

app.listen(PORT, err => {
  if (err) throw err
  console.log(`> Running on localhost:${PORT}`)
})

init(server)
