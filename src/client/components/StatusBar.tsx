import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { css, cx } from 'emotion'
import { useSocketContext, useEmitEvent } from '~/utils/socket'
import { Game, Player } from '~/types'
import { useStreams } from '~/utils/streams'
import Avatar from '~/components/Avatar'
import Video from './Video'

const clsPlayerId = css`
  width: 100%;
  height: 50px;
  padding: 8px 16px;

  .info {
    flex: 1;
  }
  .name {
    font-size: 18px;
  }
  .role {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 10px;
  }

  .status {
    width: 8px;
    height: 8px;
    border-radius: 4px;

    &.-off {
      background: red;
    }
    &.-on {
      background: green;
    }
  }
`

const PlayerIndicator: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div className={cx(clsPlayerId, 'u--flx -sb -cc')}>
      <div className="info">
        <div className="name">{player.name}</div>
        <div className="role">{player.winner ? 'winner' : player.role}</div>
      </div>
      <div
        className={cx('status', player.status === 'offline' ? '-off' : '-on')}
      ></div>
    </div>
  )
}

const clsVideoId = css`
  width: 100%;
  height: calc(100vw / 8 * 3 / 4);
  background: #000d;
  overflow: hidden;

  div,
  video {
    width: 100%;
    height: 100%;
  }
`

const PlayerVideo: React.FC<{ stream: any; isMe: boolean }> = ({
  stream,
  isMe,
}) => {
  const addStream = useCallback(
    video => {
      if (video) video.srcObject = stream
    },
    [stream]
  )

  return (
    <div className={clsVideoId}>
      {stream ? (
        <video ref={addStream} autoPlay={true} muted={isMe}></video>
      ) : (
        <div></div>
      )}
    </div>
  )
}

const readyBtnCls = css`
  padding: 8px 16px;
  pointer-events: none;
  background: whitesmoke;
  flex: 1;
`
const readyCls = css`
  ${readyBtnCls}
  background: #3dde6f;
  color: #fffc;
`
const notReadyCls = css`
  ${readyBtnCls}
  border: 1px solid #0803;
  color: #080a;

  &.-enabled {
    pointer-events: all;
  }

  &:hover {
    background: #a6ffda;
    cursor: pointer;
  }
`
const ReadyButton: React.FC<{
  player: Player
  isMe: boolean
  onClick: (e: any) => void
}> = ({ player, isMe, onClick }) => {
  if (player.phase === 'ready') {
    return <div className={cx(readyCls, 'u--flx -cc')}>Ready!</div>
  }
  return (
    <div
      className={cx(notReadyCls, 'u--flx -cc', isMe ? '-enabled' : '')}
      onClick={onClick}
    >
      Ready?
    </div>
  )
}

const cls = css`
  width: 100vw;
  border-bottom: 1px solid #0001;
  background: #2f2f2f;

  .block {
    width: calc(100vw / 8);
    box-shadow: 0 1px 3px #0001;
    background: whitesmoke;

    .media {
      height: calc(100vw / 8 * 3 / 4);
    }

    & + & {
      box-shadow: 0 1px 3px #0001, -2px 0 0 #ddd3, -1px 0 0 #9994;
    }

    &.-me {
      background: #59aeb7;
    }

    &.-winner {
      background: gold;
    }
  }
`

interface Props {
  game: Game
  onReady: (e: any) => void
}
const StatusBar: React.FC<Props> = ({ game, onReady }) => {
  const { socket } = useSocketContext()
  const streams = useStreams()

  const players = useMemo(() => {
    const players = [...game.players]
    const meIdx = players.findIndex(p => p.id === socket.id)
    ;[players[0], players[meIdx]] = [players[meIdx], players[0]]
    return players
  }, [game.players])

  return (
    <div className={cx(cls, 'u--flx')}>
      {players.map(p => {
        const isMe = p.id === socket.id
        const avatar = p.avatar

        return (
          <div
            className={cx(
              'block u--flx -col',
              isMe ? '-me' : '',
              p.winner ? '-winner' : ''
            )}
            key={p.id}
          >
            <PlayerIndicator player={p} />
            <div className="media">
              {avatar ? (
                <Avatar id={avatar} />
              ) : (
                <Video stream={streams[p.id]} isMe={isMe} />
              )}
            </div>
            {game.status !== 'started' ? (
              <ReadyButton player={p} isMe={isMe} onClick={onReady} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default StatusBar
