import React from 'react'
import { css, cx } from 'emotion'
import { Game, MePlayer } from '~types'
import { useSocketContext, useEmitEvent } from '~utils/socket'

interface Props {
  game: Game
  player: MePlayer
}

const cls = css`
  flex: 1;
  .deck.-question {
    &:not(.-enabled) {
      pointer-events: none;
    }
  }
`

export const PlayerCards: React.FC<Props> = ({ game, player }) => {
  const { players } = game
  const sendPickQuestion = useEmitEvent('player:pick-answer')

  // if (player.role === 'judge') return null
  return (
    <div className={cx(cls, 'u--flx', '-cc')}>
      {player.cards.answers.map(c => (
        <div className="card" key={c.text}>
          {c.text}
        </div>
      ))}
    </div>
  )
}
