import React, { useEffect, useCallback, lazy, Suspense, useState } from 'react'
import { css } from 'emotion'
import { useLocation } from 'wouter'
import { GameContext } from '~/utils/gameContext'
import { useSocketData, useEmitEvent, useSocketContext } from '~/utils/socket'
import { Game as GameType } from '~/types'
import { LoadingPhase } from '~/components/LoadingPhase'
import PlayersStatus from '~/views/Game/PlayersStatus'
import Settings from '~/views/Game/Settings'

const GameTable = lazy(() => import('./Table'))

interface Props {
  gameId?: string
}

interface Settings {
  name: string
  avatar: string
}

const Game: React.FC<Props> = ({ gameId }) => {
  const { socket } = useSocketContext()
  const [, setLocation] = useLocation()
  const [settings, setSettings] = useState<Settings>({ name: '', avatar: '' })
  const [gameStatus, err] = useSocketData<GameType>('game:status')
  const joinGame = useEmitEvent('game:join-game')
  const leaveGame = useEmitEvent('game:leave-game')
  const startingGame = useEmitEvent('game:starting')
  const startGame = useEmitEvent('game:start')

  const onGameReady = useCallback(() => {
    startGame({ gameId })
  }, [gameId])

  const updateSettings = useCallback(
    (o: { name: string; avatar: string }) => {
      setSettings({ ...o })
    },
    [gameId]
  )

  useEffect(() => {
    if (!gameId || err === 404) {
      setLocation('/lobby')
      return
    }

    if (err === 403) {
      setLocation('/sorry')
      localStorage.setItem('player:uid', '')
    }

    if (settings.name) {
      const puid = localStorage.getItem('player:uid')
      joinGame({
        gameId,
        puid,
        playerName: settings.name,
        playerAvatar: settings.avatar,
      })
    }
  }, [gameId, err, settings])

  useEffect(() => {
    return () => {
      leaveGame({ gameId })
    }
  }, [])

  useEffect(() => {
    if (gameStatus?.players.every(p => p.phase === 'ready')) {
      startingGame({ gameId })
    }
  })

  useEffect(() => {
    if (!gameStatus) return

    localStorage.setItem(
      'player:uid',
      gameStatus.players.find(p => socket.id === p.id)?.uid ?? ''
    )
  }, [gameStatus])

  if (!settings.name) {
    return <Settings onSave={updateSettings} />
  }

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
