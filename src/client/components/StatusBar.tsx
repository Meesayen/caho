import React, { useEffect, useState } from 'react'
import { css, cx } from 'emotion'
import SimplePeer from 'simple-peer'
import { useSocketContext, useEmitEvent } from '~utils/socket'
import { GameSession, Player } from '~types'
import { useGameContext } from '~utils/gameContext'

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
        <div className="role">{player.role}</div>
      </div>
      <div
        className={cx('status', player.status === 'offline' ? '-off' : '-on')}
      ></div>
    </div>
  )
}

const clsVideoId = css`
  width: 100%;
  height: calc(100vw / 8 * 10 / 16);
  background: #000d;

  video {
    width: 100%;
    height: 100%;
  }
`

const PlayerVideo: React.FC<{ stream: any }> = ({ stream }) => {
  if (!stream) return null
  console.log(stream)
  return (
    <div className={clsVideoId}>
      <video
        ref={video => {
          if (video) video.srcObject = stream
        }}
        autoPlay={true}
      ></video>
    </div>
  )
}

const clsId = css`
  position: fixed;
  width: 100vw;
  top: 0;
  left: 0;

  .block {
    width: calc(100vw / 8);
    height: calc(100vw / 8 * 10 / 16 + 50px);
    box-shadow: 0 1px 3px #0001;

    & + & {
      box-shadow: 0 1px 3px #0001, -2px 0 0 #ddd3, -1px 0 0 #9994;
    }
  }
`

interface Props {
  status: GameSession
}
const StatusBar: React.FC<Props> = ({ status }) => {
  const { socket } = useSocketContext()
  const [streams, setStreams] = useState({})
  console.log(status)

  const sendHi = useEmitEvent('streams:peers-hi')
  const sendAck = useEmitEvent('streams:peers-ack')
  const sendActiveSignal = useEmitEvent('streams:peers-active-signal')
  const sendPassiveSignal = useEmitEvent('streams:peers-passive-signal')
  useEffect(() => {
    const activePeers: any[] = []
    const passivePeers: any[] = []
    let myStream
    navigator.getUserMedia(
      { video: true, audio: false },
      stream => {
        console.log('got stream', socket.id)
        sendHi({ peerId: socket.id })
        myStream = stream
        setStreams(streams => {
          return { ...streams, [socket.id]: stream }
        })
      },
      () => {}
    )

    socket.on('streams:peers-hi', ({ peerId }: { peerId: string }) => {
      console.log('peers-hi')
      console.log(streams)
      const peer = new SimplePeer({
        initiator: false,
        stream: myStream
      })

      passivePeers.push(peer)

      peer.on('stream', stream => {
        console.log('on peer stream from hi')
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('signal', data => {
        console.log('signal from hi')
        sendActiveSignal({ data })
      })

      sendAck({ peerId: socket.id })
    })

    socket.on('streams:peers-ack', ({ peerId }: { peerId: string }) => {
      console.log('peers-ack')
      console.log(streams)
      const peer = new SimplePeer({
        initiator: true,
        stream: myStream
      })

      activePeers.push(peer)

      peer.on('stream', stream => {
        console.log('on peer stream from ack')
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('signal', data => {
        console.log('signal from ack')
        sendPassiveSignal({ data })
      })
    })

    socket.on('streams:peers-passive-signal', ({ data }) => {
      console.log('passive', passivePeers)
      passivePeers.forEach(peer => peer.signal(data))
    })
    socket.on('streams:peers-active-signal', ({ data }) => {
      console.log('active', activePeers)
      activePeers.forEach(peer => peer.signal(data))
    })
  }, [])
  console.log(streams)
  return (
    <div className={cx(clsId, 'u--flx')}>
      {status.players.map(p => (
        <div className="block u--flx -col" key={p.id}>
          <PlayerIndicator player={p} />
          <PlayerVideo stream={streams[p.id]} />
        </div>
      ))}
    </div>
  )
}

export default StatusBar
