export interface Player {
  id: string
  status: 'idle' | 'offline'
  name: string
  avatar: string
  gameId: string
  role: 'judge' | 'player'
}

export interface GameSession {
  id: string
  status: 'lobby'
  players: Player[]
}
