import React, { useEffect, useState } from 'react'
import { css } from 'emotion'
import { Link } from 'wouter'
import { useSocketData, useEmitEvent } from '~/utils/socket'
import { Game } from '~/types'

const cls = css`
  padding-top: 20vh;
  .panel {
    margin: 0 auto;
    width: 640px;
    height: 520px;
    padding: 32px;
    border: 1px solid #0005;
    border-top-color: #0002;
    border-left-color: #0002;
    border-radius: 3px;
    box-shadow: 0 1px 3px #0002;
    text-align: center;
    background: #fff7;

    h1 {
      margin-bottom: 0;
    }

    p {
      letter-spacing: 1px;
      font-size: 20px;
      max-width: 400px;
      margin-bottom: 32px;
    }

    .token {
      font-family: 'Courier New', Courier, monospace;
      padding: 8px 16px;
      border: 1px solid #0003;
      border-radius: 3px;
      white-space: nowrap;
      letter-spacing: 2px;
      width: 120px;
      font-size: 20px;
      background: #000d;
      color: whitesmoke;
    }

    input.token {
      padding: 8px;
      margin-bottom: 24px;
      color: #030d;
      font-weight: 600;
      background: #fffa;
      border: 1px solid #0606;
      border-radius: 3px;
      outline: none;
      text-align: center;
      text-transform: uppercase;

      &:active,
      &:focus {
        box-shadow: 0 0 2px 1px #060a;
      }
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
  const [game, err] = useSocketData<Game>('game:status')
  const createNewGame = useEmitEvent('game:create-new')
  const [token, setToken] = useState('')

  useEffect(() => {
    localStorage.setItem('player:uid', '')
    createNewGame()
  }, [])

  if (err) return null
  if (!game) return null

  return (
    <div className={cls}>
      <div className="panel u--flx -col -cc -sb">
        <h1 className="title">Cards Against Humanity - Online!</h1>
        <div className="u--flx -col -cc">
          <p>Share the following game token with your friends</p>
          <div className="token">{game.id}</div>
          <br />
          <p>...or join an exising game by pasting game token here.</p>
          <input
            className="token"
            type="text"
            spellCheck={false}
            value={token}
            onChange={e => setToken(e.target.value.toUpperCase())}
          />
        </div>
        <Link className="btn" to={`/settings/${token || game.id}`}>
          GO!
        </Link>
      </div>
    </div>
  )
}
export default Lobby
