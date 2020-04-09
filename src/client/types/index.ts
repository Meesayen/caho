export interface AnswerCard {
  text?: string
  id: number
}
export interface QuestionCard {
  text: string
}

type CommonPhase = 'ready' | 'cards-picking' | 'cards-picked'
type JudgePhase =
  | 'question-picking'
  | 'waiting-answers'
  | 'answer-reading'
  | 'winner-selecting'

type PlayerPhase = 'waiting' | 'answer-picking' | 'answer-picked'
export interface Player {
  id: string
  uid: string
  status: 'online' | 'offline'
  phase: CommonPhase | PlayerPhase | JudgePhase
  name: string
  avatar: string
  gameId: string
  role: 'judge' | 'player'
  answers: AnswerCard[]
}

export interface MePlayer extends Player {
  cards: {
    answers: AnswerCard[]
    question?: QuestionCard
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
  question?: QuestionCard
}
