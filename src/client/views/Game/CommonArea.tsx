import React, { useCallback } from 'react'
import { css, cx } from 'emotion'
import { Game, Player } from '~/types'
import { useSocketContext, useEmitEvent } from '~/utils/socket'
import { blankify } from '~/utils/misc'
import { Card } from '~/components/Card'

interface Props {
  game: Game
  player: Player
}

const cls = css`
  flex: 1;
  .Card.-question {
    cursor: pointer;
    &:not(.-enabled) {
      pointer-events: none;
    }
  }

  .question-block {
    width: 400px;
  }
  .answers-block {
    min-width: 400px;
  }
`

export const CommonArea: React.FC<Props> = ({ player, game }) => {
  const { players } = game
  const { socket } = useSocketContext()
  const sendPickQuestion = useEmitEvent('player:pick-question')

  const drawQuestionCard = useCallback(() => {
    sendPickQuestion({ gameId: game.id })
  }, [])

  const judge = players.find(p => p.role === 'judge')

  const deckEnabled =
    judge?.id === socket.id && judge.phase === 'question-picking'

  return (
    <div className={cx(cls, 'u--flx', '-cc')}>
      <div className="question-block u--flx -vc -sa">
        <Card
          className={deckEnabled ? '-enabled' : ''}
          type="question"
          deck={true}
          onClick={drawQuestionCard}
        />
        {game.question ? (
          <Card type="question" text={game.question.text} />
        ) : (
          <div className="card u--ghost"></div>
        )}
      </div>
      <div className="answers-block">
        {player.role === 'player'
          ? player.answers.map(card => (
              <Card id={card.id} text={card.text} key={`card-${card.id}`} />
            ))
          : null}
      </div>
    </div>
  )
}
