import { createContext, useContext } from 'react'
import io from 'socket.io-client'

export interface GameContext {
  gameId: string
}
const defaultContext: GameContext = {
  gameId: '',
}

export const GameContext = createContext<GameContext>(defaultContext)

export const useGameContext = () => useContext<GameContext>(GameContext)
