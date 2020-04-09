import React, { useEffect, useCallback, lazy, Suspense } from 'react'
import { css } from 'emotion'
import { useLocation } from 'wouter'
import { GameContext } from '~utils/gameContext'
import { useSocketData, useEmitEvent, useSocketContext } from '~utils/socket'
import { Game } from '~types'
import { LoadingPhase } from '~components/LoadingPhase'
import PlayersStatus from '~views/Game/PlayersStatus'

const GameTable = lazy(() => import('./Table'))

interface Props {
  gameId?: string
}

const Game: React.FC<Props> = ({ gameId }) => {
  const { socket } = useSocketContext()
  const [, setLocation] = useLocation()
  const [gameStatus, err] = useSocketData<Game>('game:status')
  const joinGame = useEmitEvent('game:join-game')
  const leaveGame = useEmitEvent('game:leave-game')
  const startingGame = useEmitEvent('game:starting')
  const startGame = useEmitEvent('game:start')

  const onGameReady = useCallback(() => {
    startGame({ gameId })
  }, [gameId])

  useEffect(() => {
    if (!gameId || err === 404) {
      setLocation('/lobby')
      return
    }

    if (err === 403) {
      setLocation('/sorry')
    }

    const puid = sessionStorage.getItem('player:uid')
    joinGame({ gameId, puid })

    return () => {
      leaveGame({ gameId })
    }
  }, [gameId, err])

  useEffect(() => {
    if (gameStatus?.players.every(p => p.phase === 'ready')) {
      startingGame({ gameId })
    }
  })

  useEffect(() => {
    if (!gameStatus) return

    sessionStorage.setItem(
      'player:uid',
      gameStatus.players.find(p => socket.id === p.id)?.uid ?? ''
    )
  }, [gameStatus])

  if (!gameStatus || !gameId) {
    return null
  }

  const isStarting = gameStatus.status === 'starting'

  console.log('game:', gameStatus)

  return (
    <GameContext.Provider value={{ gameId }}>
      <PlayersStatus game={gameStatus} />
      <Suspense fallback={<div>Loading...</div>}>
        <GameTable game={gameStatus} />
      </Suspense>
      {isStarting ? <LoadingPhase onReady={onGameReady} /> : null}
    </GameContext.Provider>
  )
}
export default Game
