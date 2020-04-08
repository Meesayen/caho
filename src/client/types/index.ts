export interface Card {
  text: string
}

export interface Player {
  id: string
  uid: string
  status: 'online' | 'offline'
  phase:
    | 'ready'
    | 'cards-picking'
    | 'cards-picked'
    | 'answer-picking'
    | 'answer-picked'
    | 'question-picking'
    | 'waiting-answers'
    | 'answer-reading'
    | 'winner-selecting'
    | 'waiting'
  name: string
  avatar: string
  gameId: string
  role: 'judge' | 'player'
  answers: Card[]
}

export interface MePlayer extends Player {
  cards: {
    answers: Card[]
    question?: Card
  }
}

export interface Game {
  id: string
  status: 'lobby' | 'starting' | 'started'
  phase:
    | 'deal'
    | 'pick-question'
    | 'pick-answers'
    | 'read-answers'
    | 'select-winner'
    | 'points'
  players: Player[]
  question?: Card
}
