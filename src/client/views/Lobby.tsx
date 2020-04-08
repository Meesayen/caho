import React, { useEffect } from 'react'
import { css } from 'emotion'
import { Link } from 'wouter'
import { useSocketData, useEmit, useEmitEvent } from '~utils/socket'
import { Game } from '~types'

const cls = css`
  padding-top: 240px;
  .panel {
    margin: 0 auto;
    width: 640px;
    height: 480px;
    padding: 32px;
    border: 1px solid #0005;
    border-top-color: #0002;
    border-left-color: #0002;
    border-radius: 3px;
    box-shadow: 0 1px 3px #0002;
    text-align: center;

    h1 {
      margin-bottom: 0;
    }

    p {
      letter-spacing: 1px;
      font-size: 20px;
      max-width: 400px;
      margin-bottom: 32px;
    }

    .link {
      font-family: 'Courier New', Courier, monospace;
      padding: 8px 16px;
      border: 1px solid #0003;
      border-radius: 3px;
      max-width: 95%;
      font-weight: bold;
    }

    .btn {
      background: #59aeb7;
      color: white;
      border-radius: 2px;
      padding: 16px 64px;
      font-size: 32px;
    }
  }
`

const Lobby: React.FC = () => {
  const [data, err] = useSocketData<Game>('game:status')
  const createNewGame = useEmitEvent('game:create-new')

  useEffect(() => {
    createNewGame()
  }, [])

  if (err) return null
  if (!data) return null

  const linkUrl = `${window.location.origin}/${data.id}`
  return (
    <div className={cls}>
      <div className="panel u--flx -col -cc -sb">
        <h1 className="title">Cards Against Humanity - Online!</h1>
        <div className="u--flx -col -cc">
          <p>
            Copy and share the following link with your friends and then hit GO!
          </p>
          <div className="link">{linkUrl}</div>
        </div>
        <Link className="btn" to={`/game/${data.id}`}>
          GO!
        </Link>
      </div>
    </div>
  )
}
export default Lobby
