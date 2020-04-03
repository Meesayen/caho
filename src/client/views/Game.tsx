import React, { useEffect } from 'react'
import { css } from 'emotion'
import { Link, useLocation } from 'wouter'
import StatusBar from '~components/StatusBar'
import { GameContext } from '~utils/gameContext'
import { useSocketData, useEmitEvent } from '~utils/socket'
import { GameSession } from '~types'

const cls = css``

interface Props {
  gameId?: string
}

const Game: React.FC<Props> = ({ gameId }) => {
  const [, setLocation] = useLocation()
  const [gameStatus, err] = useSocketData<GameSession>('game:status')
  const joinGame = useEmitEvent('game:join-game')

  useEffect(() => {
    if (!gameId || err === 404) {
      setLocation('/lobby')
      return
    }

    joinGame({ gameId })
  }, [gameId, err])

  if (!gameStatus || !gameId) {
    return null
  }

  return (
    <GameContext.Provider value={{ gameId }}>
      <div className={cls}>
        <StatusBar status={gameStatus} />
      </div>
    </GameContext.Provider>
  )
}
export default Game
