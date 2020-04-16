import React, { useEffect, useCallback } from 'react'
import { css } from 'emotion'
import StatusBar from '~/components/StatusBar'
import { useEmitEvent } from '~/utils/socket'
import { Game } from '~/types'

const cls = css``

interface Props {
  game: Game
}

const PlayersStatus: React.FC<Props> = ({ game }) => {
  const gameId = game.id
  const playerReady = useEmitEvent('player:is-ready')

  const sendReady = useCallback(() => {
    playerReady({ gameId })
  }, [gameId])

  return (
    <div className={cls}>
      <StatusBar game={game} onReady={sendReady} />
    </div>
  )
}
export default PlayersStatus
