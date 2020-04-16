import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { css, cx } from 'emotion'
import { Game, AnswerCard } from '~/types'
import { useSocketContext, useEmitEvent } from '~/utils/socket'
import { shuffle } from '~/utils/misc'
import { Card } from '~/components/Card'

interface Props {
  game: Game
  isJudge: boolean
}

const cls = css`
  height: 200px;
  .block {
    width: calc(100vw / 8);
    box-shadow: 0 1px 3px #0001;
  }

  &.-read-answers {
    .Card.-revealed {
      box-shadow: none;
      cursor: initial;

      &:hover {
        transform: scale(2);
      }
    }
  }
  .Card {
    cursor: pointer;

    &.-winner {
      background: gold;
    }
  }

  .btn {
    background: #59aeb7;
    color: white;
    border-radius: 2px;
    padding: 8px 32px;
    font-size: 24px;
    cursor: pointer;
  }
`

export const PlayersAnswers: React.FC<Props> = ({ game, isJudge }) => {
  if (!isJudge) return <div className={cls}></div>

  const { players } = game
  const sendCardReveal = useEmitEvent('game:card-reveal')
  const sendAllCardsRevealed = useEmitEvent('game:all-cards-revealed')
  const sendSelectWinner = useEmitEvent('game:select-winner')
  const sendNewRound = useEmitEvent('game:new-round')
  const [doneButtonActivated, activateDoneButton] = useState(false)
  const [newRoundButtonActivated, activateNewRoundButton] = useState(false)

  const playerAnswers = useMemo(() => {
    return players.flatMap(p => {
      return p.role === 'judge'
        ? []
        : p.winner
        ? [p.answers.map(c => ({ ...c, winner: true }))]
        : [p.answers]
    })
  }, [players])

  const id = JSON.stringify(playerAnswers)

  const answers = useMemo(() => {
    return shuffle<AnswerCard[]>(playerAnswers).sort(
      (a, b) => b.length - a.length
    )
  }, [id])

  const onCardClick = useCallback(
    card => {
      if (game.phase === 'read-answers' && !card.text) {
        sendCardReveal({ gameId: game.id, cardId: card.id })
      } else if (game.phase === 'select-winner') {
        sendSelectWinner({ gameId: game.id, cardId: card.id })
      }
    },
    [game.phase]
  )

  const doneClicked = useCallback(() => {
    activateDoneButton(false)
    sendAllCardsRevealed({ gameId: game.id })
  }, [])

  const newRoundClicked = useCallback(() => {
    activateNewRoundButton(false)

    sendNewRound({ gameId: game.id })
  }, [])

  useEffect(() => {
    if (
      game.phase === 'read-answers' &&
      answers.every(
        cards => cards.length && cards.every(card => Boolean(card.text))
      )
    ) {
      activateDoneButton(true)
    }
  }, [game.phase, answers])

  useEffect(() => {
    if (game.phase === 'points') {
      activateNewRoundButton(true)
    }
  }, [game.phase])

  const phaseCls =
    game.phase === 'read-answers' ? '-read-answers' : '-select-winner'
  return (
    <div className={cx(cls, 'u--flx', phaseCls)}>
      <div className="block u--flx -col -cc" key={`block-btn`}>
        {doneButtonActivated ? (
          <div className="btn" onClick={doneClicked}>
            Done!
          </div>
        ) : null}
        {newRoundButtonActivated ? (
          <div className="btn" onClick={newRoundClicked}>
            New Round!
          </div>
        ) : null}
      </div>
      {answers.map((cards, i) => {
        return (
          <div className="block u--flx -col -cc" key={`block-${i}`}>
            {cards.map(card => (
              <Card
                className={cx(
                  card.text ? '-revealed' : '-concealed',
                  card.winner ? '-winner' : ''
                )}
                id={card.id}
                text={card.text}
                size={'small'}
                key={`card-${card.id}`}
                onClick={onCardClick}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
