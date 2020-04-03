import io from 'socket.io'
import uid from 'uid'

const GAMES = {}
const PLAYERS = {}
const GAME_SOCKETS = {}

function broadCastToPlayers(gameId, msg, data) {
  const players = GAMES[gameId].players
  const gameSockets = GAME_SOCKETS[gameId]
  players.forEach(p => {
    gameSockets[p.id].emit(msg, data)
  })
}

function createNewPlayer(id, socket, idx) {
  GAME_SOCKETS[id][socket.id] = socket
  PLAYERS[socket.id] = {
    gameId: id
  }
  return {
    id: socket.id,
    status: 'idle',
    name: `Guest ${idx + 1}`,
    avatar: '',
    gameId: id,
    role: 'player'
  }
}
function createNewGame(id, socket) {
  GAME_SOCKETS[id] = {}
  GAMES[id] = {
    id,
    status: 'lobby',
    players: [createNewPlayer(id, socket, 0)]
  }
  socket.emit('game:status', GAMES[id])
}

function removePlayer(socket) {
  if (!PLAYERS[socket.id]) return

  const gameId = PLAYERS[socket.id].gameId
  delete PLAYERS[socket.id]
  const players = GAMES[gameId].players
  GAMES[gameId].players = players.filter(p => p.id !== socket.id)
  delete GAME_SOCKETS[gameId][socket.id]

  if (players.length) {
    broadCastToPlayers(gameId, 'game:status', GAMES[gameId])
    return
  }

  // no more players left - killing the game
  delete GAMES[gameId]
  delete GAME_SOCKETS[gameId]
}

export function init(server) {
  io(server).on('connection', socket => {
    socket.on('game:create-new', () => {
      console.log('create')
      let gameId = uid(8)
      createNewGame(gameId, socket)
    })

    socket.on('game:ask-status', ({ gameId }) => {
      console.log('ask-status')
      if (GAMES[gameId]) socket.emit('game:status', GAMES[gameId])
      else socket.emit('game:status', { error: 404 })
    })

    socket.on('game:join-game', ({ gameId }) => {
      console.log('join')
      console.log(GAMES[gameId])
      const game = GAMES[gameId]

      // no game found - 404
      if (!game) return socket.emit('game:status', { error: 404 })

      // no more space - 403
      if (game.players.length >= 6) {
        return socket.emit('game:status', { error: 403 })
      }

      if (!game.players.find(p => p.id === socket.id)) {
        // create new player and join
        game.players.push(createNewPlayer(gameId, socket, game.players.length))
      }

      broadCastToPlayers(gameId, 'game:status', GAMES[gameId])
    })

    socket.on('streams:peers-hi', ({ peerId }) => {
      socket.broadcast.emit('streams:peers-hi', { peerId })
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

    // when the user disconnects.. perform this
    socket.on('disconnect', _ => {
      // TODO: add logic to keep user alive for a bunch of seconds
      removePlayer(socket)
    })
  })
}
