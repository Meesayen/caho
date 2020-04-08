import React from 'react'
import { css, cx } from 'emotion'
import { Game } from '~types'
import { useSocketContext } from '~utils/socket'

interface Props {
  game: Game
}

const cls = css`
  height: 300px;
  .block {
    width: calc(100vw / 8);
    box-shadow: 0 1px 3px #0001;
  }
`

export const PlayersAnswers: React.FC<Props> = ({ game }) => {
  const { players } = game
  const { socket } = useSocketContext()

  return (
    <div className={cx(cls, 'u--flx')}>
      {players.map(p => {
        const isMe = p.id === socket.id
        return (
          <div className="block u--flx -col" key={p.id}>
            {p.answers.map(card => (
              <div className="card">{card.text}</div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
