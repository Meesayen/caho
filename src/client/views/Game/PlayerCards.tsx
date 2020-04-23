import React, { useCallback, useState, useEffect } from 'react'
import { css, cx } from 'emotion'
import { Game, MePlayer, AnswerCard } from '~/types'
import { useEmitEvent } from '~/utils/socket'
import { Card } from '~/components/Card'
import { countBlanks } from '~/utils/misc'

interface Props {
  game: Game
  player: MePlayer
}

const cls = css`
  flex: 1;
  flex-direction: row-reverse;

  .Card {
    margin-left: -48px;

    &:hover {
      z-index: 2;
      transform: scale(1.2);
      margin-left: 8px;
      margin-right: 8px;
    }
    &.-selected {
      transform: scale(1.05);
      transform-origin: bottom;
      box-shadow: 1px 1px 4px #0002, 0 0 0 2px goldenrod;
    }
  }

  &.-player .Card {
    cursor: pointer;
  }

  &.-judge .Card {
    box-shadow: 1px 1px 4px #0002 !important;
  }
`

export const PlayerCards: React.FC<Props> = ({ game, player }) => {
  const [requiredAnswers, setRequiredAnswers] = useState<number>(0)
  const [answers, setAnswers] = useState<number[]>([])
  const sendPickAnswer = useEmitEvent('player:pick-answers')

  const isJudge = player.role === 'judge'
  const isEnabled = player.phase === 'answer-picking'

  const chooseCard = useCallback(
    (card: AnswerCard) => {
      if (!isEnabled || isJudge) return

      if (answers.includes(card.id)) {
        answers.splice(
          answers.findIndex(id => id === card.id),
          1
        )
      } else {
        answers.push(card.id)
      }
      setAnswers([...answers])

      if (answers.length === requiredAnswers) {
        sendPickAnswer({ gameId: game.id, cards: answers })
        setAnswers([])
      }
    },
    [requiredAnswers, answers]
  )

  useEffect(() => {
    if (game.question) {
      setRequiredAnswers(countBlanks(game.question))
    }
  }, [game.question])

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
        <Card
          className={answers.includes(c.id) ? '-selected' : ''}
          id={c.id}
          text={c.text}
          key={`card-${c.id}`}
          onClick={() => chooseCard(c)}
        />
      ))}
    </div>
  )
}
