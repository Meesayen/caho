import io from 'socket.io'
import uid from 'uid'

const ANSWER_CARDS = [
  {
    text: 'Answer 1'
  },
  {
    text: 'Answer 2'
  },
  {
    text: 'Answer 3'
  },
  {
    text: 'Answer 4'
  }
]
const QUESTION_CARDS = [
  {
    text: 'Question BLANK 1'
  },
  {
    text: 'Question 2 BLANK'
  },
  {
    text: 'BLANK: Question 3 BLANK'
  },
  {
    text: 'BLANK: Question 4'
  }
]

const GAMES = {}
const PLAYERS = {}
const PLAYERS_LIMBO = {}
const GAME_SOCKETS = {}

function cleanLimbo() {
  for (const [id, player] of Object.entries(PLAYERS_LIMBO)) {
    if (player.created + player.expire <= Date.now()) {
      delete PLAYERS_LIMBO[id]
      const { gameId, id: pid } = player.public
      const players = GAMES[gameId].players.filter(p => p.id !== pid)
      GAMES[gameId].players = players

      if (players.length) {
        broadCastToPlayers(gameId, 'game:player-left', { peerId: pid })
        broadcastGameStatus(GAMES[gameId])
        return
      }

      // no more players left - killing the game
      delete GAMES[gameId]
      delete GAME_SOCKETS[gameId]
    }
  }

  setTimeout(cleanLimbo, 5000)
}
cleanLimbo()

function broadCastToPlayers(gameId, msg, data) {
  if (!GAMES[gameId]) return

  const players = GAMES[gameId].players
  const gameSockets = GAME_SOCKETS[gameId]
  players.forEach(p => {
    if (p.status === 'offline') return
    gameSockets[p.id].emit(msg, data)
  })
}

function broadcastGameStatus(game) {
  broadCastToPlayers(game.id, 'game:status', game)
}

// modifies in places
function swap(list, a, b) {
  ;[list[a], list[b]] = [list[b], list[a]]
}

function shuffle(_list) {
  const list = [..._list]
  let i = list.length
  while (--i) {
    swap(list, i, ~~(Math.random() * i))
  }

  return list
}

function createShuffledDeck(cards) {
  const cardIndexes = cards.map((_, i) => i)
  return shuffle(cardIndexes)
}

function createNewPlayer(gameId, socket, idx, puid) {
  GAME_SOCKETS[gameId][socket.id] = socket

  const oldPlayer = PLAYERS_LIMBO[puid]
  if (oldPlayer) {
    delete PLAYERS_LIMBO[puid]
    PLAYERS[socket.id] = {
      gameId,
      cards: oldPlayer.private.cards
    }
    oldPlayer.public.id = socket.id
    oldPlayer.public.status = 'online'
    return oldPlayer.public
  }

  PLAYERS[socket.id] = {
    gameId,
    cards: {
      answers: [],
      question: null
    }
  }
  return {
    id: socket.id,
    uid: uid(8),
    status: 'online',
    phase: 'cards-picking',
    name: `Guest ${idx + 1}`,
    avatar: '',
    gameId,
    role: 'player',
    answers: []
  }
}
function createNewGame(id, socket) {
  GAME_SOCKETS[id] = {}
  GAMES[id] = {
    id,
    status: 'lobby',
    // the initial phase will be "deal"
    phase: 'deal',
    players: [createNewPlayer(id, socket, 0)],
    questions: createShuffledDeck(QUESTION_CARDS),
    answers: createShuffledDeck(ANSWER_CARDS),
    question: null
  }
  socket.emit('game:status', GAMES[id])
}

function updateGame(gameId, props) {
  const game = GAMES[gameId]
  if (!game) return

  const upGame = { ...game, ...props }
  GAMES[gameId] = upGame
  broadcastGameStatus(GAMES[gameId])
}

function updatePlayer(id, gameId, props) {
  console.log('update player')
  const game = GAMES[gameId]
  const sockets = GAME_SOCKETS[gameId]
  if (!game) return

  game.players = game.players.map(p => {
    if (p.id === id) {
      return { ...p, ...props }
    }
    return p
  })
  const player = game.players.find(p => p.id === id)
  sockets[id].emit('player:status', {
    ...player,
    cards: PLAYERS[player.id].cards
  })
  broadcastGameStatus(game)
}

function removePlayer(socket, gameId) {
  if (!PLAYERS[socket.id] || !GAMES[gameId]) return

  const player = GAMES[gameId].players.find(p => p.id === socket.id)

  PLAYERS_LIMBO[player.uid] = {
    private: PLAYERS[socket.id],
    public: { ...player },
    expire: 1 * 60 * 1000, // 2 minutes
    created: Date.now()
  }

  delete PLAYERS[socket.id]
  delete GAME_SOCKETS[gameId][socket.id]

  // putting player in limbo

  player.status = 'offline'
  // const players = GAMES[gameId].players.filter(p => p.id !== socket.id)
  // GAMES[gameId].players = players

  // if (players.length) {
  broadCastToPlayers(gameId, 'game:player-left', { peerId: socket.id })
  broadcastGameStatus(GAMES[gameId])
  //   return
  // }

  // no more players left - killing the game
  // delete GAMES[gameId]
  // delete GAME_SOCKETS[gameId]
}

function dealCardsToPlayers(gameId) {
  const game = GAMES[gameId]
  const gameSockets = GAME_SOCKETS[gameId]

  if (!game) return

  const players = game.players
  players.forEach(p => {
    const answers = PLAYERS[p.id].cards.answers
    const toPick = 1 - answers.length
    // const toPick = 10 - answers.length
    const newCards = game.answers.splice(0, toPick).map(i => ANSWER_CARDS[i])
    PLAYERS[p.id].cards.answers = answers.concat(newCards)
    gameSockets[p.id].emit('player:status', {
      ...p,
      cards: PLAYERS[p.id].cards
    })
  })
}

function chooseJudge(gameId) {
  const game = GAMES[gameId]

  if (!game) return
  const judgeId = shuffle(game.players.map(p => p.id))[0]
  game.players = game.players.map(p => {
    if (p.id !== judgeId) return p
    return {
      ...p,
      role: 'judge'
    }
  })
  broadcastGameStatus(game)
}

export function init(server) {
  io(server).on('connection', socket => {
    // game
    socket.on('game:create-new', () => {
      console.log('create game')
      let gameId = uid(8)
      createNewGame(gameId, socket)
    })

    socket.on('game:ask-status', ({ gameId }) => {
      console.log('ask-status')
      if (GAMES[gameId]) socket.emit('game:status', GAMES[gameId])
      else socket.emit('game:status', { error: 404 })
    })

    socket.on('game:starting', ({ gameId }) => {
      const game = GAMES[gameId]
      if (game && game.status === 'lobby') {
        updateGame(gameId, {
          status: 'starting'
        })
      }
    })

    socket.on('game:start', ({ gameId }) => {
      console.log('start game')
      const game = GAMES[gameId]
      if (game && game.status === 'starting') {
        chooseJudge(gameId)
        updateGame(gameId, {
          status: 'started',
          players: game.players.map(p => {
            return { ...p, phase: 'cards-picking' }
          })
        })
        dealCardsToPlayers(gameId)
      }
    })

    // player actions - session
    socket.on('game:join-game', ({ gameId, puid }) => {
      console.log('join game', socket.id)
      const game = GAMES[gameId]

      // no game found - 404
      if (!game) return socket.emit('game:status', { error: 404 })

      // no more space - 403
      if (game.players.length >= 6) {
        return socket.emit('game:status', { error: 403 })
      }

      if (!game.players.find(p => p.id === socket.id)) {
        // create new player and join
        const player = createNewPlayer(
          gameId,
          socket,
          game.players.length,
          puid
        )

        if (puid) {
          game.players = game.players.map(p => {
            if (p.uid === player.uid) return player
            return p
          })
        } else {
          game.players.push(player)
        }
      }

      const player = game.players.find(p => p.id === socket.id)

      broadcastGameStatus(GAMES[gameId])
      socket.emit('player:status', {
        ...player,
        cards: PLAYERS[player.id].cards
      })
    })
    socket.on('game:leave-game', ({ gameId }) => {
      removePlayer(socket, gameId)
    })

    // player actions - game
    socket.on('player:is-ready', ({ gameId }) => {
      updatePlayer(socket.id, gameId, {
        phase: 'ready'
      })
    })

    socket.on('player:cards-picked', ({ gameId }) => {
      console.log('player:cards-picked')
      updatePlayer(socket.id, gameId, {
        phase: 'cards-picked'
      })

      // if all players have picked their cards
      if (GAMES[gameId].players.every(p => p.phase === 'cards-picked')) {
        // move to the next phase - question picking
        updateGame(gameId, {
          phase: 'pick-question'
        })
        for (const player of GAMES[gameId].players) {
          if (player.role === 'judge') {
            updatePlayer(player.id, gameId, {
              phase: 'question-picking'
            })
            continue
          }
          updatePlayer(player.id, gameId, {
            phase: 'waiting'
          })
        }
      }
    })
    socket.on('player:pick-question', ({ gameId }) => {
      const game = GAMES[gameId]
      const questionId = game.questions.pop()
      game.question = QUESTION_CARDS[questionId]
      game.phase = 'pick-answers'
      updateGame(gameId, {
        phase: 'pick-answers'
      })
      for (const player of game.players) {
        if (player.role === 'judge') {
          updatePlayer(player.id, gameId, {
            phase: 'waiting-answers'
          })
          continue
        }
        updatePlayer(player.id, gameId, {
          phase: 'answer-picking'
        })
      }
    })

    // streams
    socket.on('streams:peers-syn', ({ peerId }) => {
      socket.broadcast.emit('streams:peers-syn', { peerId })
    })
    socket.on('streams:peers-ack', ({ peerId }) => {
      socket.broadcast.emit('streams:peers-ack', { peerId })
    })
    socket.on('streams:peers-passive-signal', ({ data }) => {
      socket.broadcast.emit('streams:peers-passive-signal', { data })
    })
    socket.on('streams:peers-active-signal', ({ data }) => {
      socket.broadcast.emit('streams:peers-active-signal', { data })
    })
    socket.on('streams:peers-left', ({ peerId }) => {
      console.log('leave', peerId)
      socket.broadcast.emit('streams:peers-left', { peerId })
    })

    // when the user disconnects.. perform this
    socket.on('disconnect', _ => {
      // TODO: add logic to keep user alive for a bunch of seconds
      if (!PLAYERS[socket.id]) return
      const gameId = PLAYERS[socket.id].gameId
      removePlayer(socket, gameId)
    })
  })
}
