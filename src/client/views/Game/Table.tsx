import React, { useEffect, useCallback } from 'react'
import { css, cx } from 'emotion'
import { useEmitEvent, useSocketData } from '~utils/socket'
import { Game, MePlayer } from '~types'
import { PlayersAnswers } from '~views/Game/PlayersAnswers'
import { CommonArea } from '~views/Game/CommonArea'
import { PlayerCards } from '~views/Game/PlayerCards'

const cls = css`
  flex: 1;
`

interface Props {
  game: Game
}

const Table: React.FC<Props> = ({ game }) => {
  const gameId = game.id
  const [player, err] = useSocketData<MePlayer>('player:status')
  const sendDealDone = useEmitEvent('player:cards-picked')
  console.log(player)
  if (game.status !== 'started' || !player) return null

  if (game.phase === 'deal') {
    if (player?.phase === 'cards-picking') {
      sendDealDone({ gameId })
    }
  }
  if (game.phase === 'pick-question') {
  }

  return (
    <div className={cx(cls, 'u--flx -col')}>
      <PlayersAnswers game={game} />
      <CommonArea game={game} />
      <PlayerCards player={player} game={game} />
    </div>
  )
}
export default Table
