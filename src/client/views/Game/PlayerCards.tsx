import React, { useCallback } from 'react'
import { css, cx } from 'emotion'
import { Game, MePlayer, AnswerCard } from '~types'
import { useEmitEvent } from '~utils/socket'

interface Props {
  game: Game
  player: MePlayer
}

const cls = css`
  flex: 1;
  &:not(.-enabled),
  &.-judge {
    pointer-events: none;
  }

  &.-player .card {
    cursor: pointer;
  }
`

export const PlayerCards: React.FC<Props> = ({ game, player }) => {
  const sendPickAnswer = useEmitEvent('player:pick-answer')

  const isJudge = player.role === 'judge'
  const isEnabled = player.phase === 'answer-picking'

  const chooseCard = useCallback((card: AnswerCard) => {
    sendPickAnswer({ gameId: game.id, cardId: card.id })
  }, [])

  return (
    <div
      className={cx(
        cls,
        'u--flx',
        '-cc',
        isJudge ? '-judge' : '-player',
        isEnabled ? '-enabled' : ''
      )}
    >
      {player.cards.answers.map(c => (
        <div
          className="card"
          key={`card-${c.id}`}
          onClick={() => chooseCard(c)}
        >
          {c.text}
        </div>
      ))}
    </div>
  )
}
