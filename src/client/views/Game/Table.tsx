import React, { useEffect, useCallback } from 'react'
import { css, cx } from 'emotion'
import { useEmitEvent, useSocketData } from '~utils/socket'
import { Game, MePlayer } from '~types'
import { PlayersAnswers } from '~views/Game/PlayersAnswers'
import { CommonArea } from '~views/Game/CommonArea'
import { PlayerCards } from '~views/Game/PlayerCards'
import { PhaseAnnouncer } from '~components/PhaseAnnouncer'

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
  if (game.status !== 'started' || !player) return null

  if (game.phase === 'deal') {
    if (player?.phase === 'cards-picking') {
      sendDealDone({ gameId })
    }
  }
  if (game.phase === 'pick-question') {
  }

  console.log('player:', player)

  const isJudge = player.role === 'judge'

  return (
    <div className={cx(cls, 'u--flx -col')}>
      <PlayersAnswers game={game} isJudge={isJudge} />
      <CommonArea game={game} />
      <PlayerCards player={player} game={game} />
      <PhaseAnnouncer phase={game.phase} isJudge={isJudge} />
    </div>
  )
}
export default Table
