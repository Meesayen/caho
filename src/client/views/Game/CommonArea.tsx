import React, { useCallback } from 'react'
import { css, cx } from 'emotion'
import { Game } from '~types'
import { useSocketContext, useEmitEvent } from '~utils/socket'
import { blankify } from '~utils/misc'

interface Props {
  game: Game
}

const cls = css`
  flex: 1;
  .deck.-question {
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

export const CommonArea: React.FC<Props> = ({ game }) => {
  const { players } = game
  const { socket } = useSocketContext()
  const sendPickQuestion = useEmitEvent('player:pick-question')

  const drawQuestionCard = useCallback(() => {
    sendPickQuestion({ gameId: game.id })
  }, [])

  const judge = players.find(p => p.role === 'judge')
  if (!judge) return null

  return (
    <div className={cx(cls, 'u--flx', '-cc')}>
      <div className="question-block u--flx -vc -sa">
        {judge.id === socket.id && judge.phase === 'question-picking' ? (
          <div
            className="deck -question -enabled"
            onClick={drawQuestionCard}
          ></div>
        ) : (
          <div className="deck -question"></div>
        )}
        {game.question ? (
          <div className="card">{blankify(game.question.text)}</div>
        ) : (
          <div className="card u--ghost"></div>
        )}
      </div>
      <div className="answers-block"></div>
    </div>
  )
}
