import React, { lazy, Suspense } from 'react'
import { SocketContext } from '~utils/socket'
import io from 'socket.io-client'
import { Route } from 'wouter'
import { css, cx } from 'emotion'

const Lobby = lazy(() => import('~views/Lobby'))
const Game = lazy(() => import('~views/Game'))

const cls = css`
  color: #334855;
  background-color: #fefaf9;
  width: 100vw;
  height: 100vh;
`
const isDev = process.env.NODE_ENV === 'development'

export const App: React.FC = () => {
  const socket = io(isDev ? 'http://localhost:3090' : '')
  return (
    <div className={cx(cls, 'u--flx -col')}>
      <SocketContext.Provider value={{ socket }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Route path="/lobby" component={Lobby} />
          <Route path="/game/:gameId?">
            {params => <Game gameId={params.gameId} />}
          </Route>
        </Suspense>
      </SocketContext.Provider>
    </div>
  )
}
