import React, { lazy, Suspense } from 'react'
import io from 'socket.io-client'
import { Route } from 'wouter'
import { css, cx } from 'emotion'
import { SocketContext } from '~utils/socket'
import { noiseImage } from '~utils/misc'

const Lobby = lazy(() => import('~views/Lobby'))
const Sorry = lazy(() => import('~views/Sorry'))
const Game = lazy(() => import('~views/Game'))

const cls = css`
  color: #334855;
  width: 100vw;
  height: 100vh;

  background: linear-gradient(150deg, #2cb556, #244c2d);
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 0;
    opacity: 0.3;
    background-image: url(${noiseImage});
  }

  > * {
    position: relative;
    z-index: 1;
  }
`
const isDev = process.env.NODE_ENV === 'development'

export const App: React.FC = () => {
  const socket = io(isDev ? 'http://localhost:3090' : '')
  return (
    <div className={cx(cls, 'u--flx -col')}>
      <SocketContext.Provider value={{ socket }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Route path="/lobby" component={Lobby} />
          <Route path="/sorry" component={Sorry} />
          <Route path="/game/:gameId?">
            {params => <Game gameId={params.gameId} />}
          </Route>
        </Suspense>
      </SocketContext.Provider>
    </div>
  )
}
