import { useState, useEffect } from 'react'
import SimplePeer from 'simple-peer'
import { useEmitEvent, useSocketContext } from '~utils/socket'

interface AckSynResponse {
  peerId: string
}

interface SignalResponse {
  data: SimplePeer.SignalData
}

interface PeerCache {
  peerId: string
  peer: SimplePeer.Instance
}

let myStream: MediaStream | null

export function useStreams() {
  const { socket } = useSocketContext()
  const [streams, setStreams] = useState<Record<string, MediaStream>>({})

  const sendSyn = useEmitEvent('streams:peers-syn')
  const sendAck = useEmitEvent('streams:peers-ack')
  const sendActiveSignal = useEmitEvent('streams:peers-active-signal')
  const sendPassiveSignal = useEmitEvent('streams:peers-passive-signal')

  useEffect(() => {
    let activePeers: PeerCache[] = []
    let passivePeers: PeerCache[] = []

    async function getMediaStream() {
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setStreams(streams => {
          return { ...streams, [socket.id]: myStream! }
        })
        console.log(socket.id)
        sendSyn({ peerId: socket.id })
      } catch (err) {
        /* TODO: handle the error */
      }
    }

    getMediaStream()

    socket.on('streams:peers-syn', ({ peerId }: AckSynResponse) => {
      console.log('syn')
      if (!myStream) return
      const peer = new SimplePeer({
        initiator: false,
        stream: myStream
      })

      peer.on('signal', data => {
        console.log('signal from syn')
        sendActiveSignal({ data })
      })

      passivePeers.push({ peerId, peer })

      peer.on('stream', stream => {
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('close', () => {
        console.log('close from syn')
        // sendPassiveSignal({ data })
      })

      sendAck({ peerId: socket.id })
    })

    socket.on('streams:peers-ack', ({ peerId }: AckSynResponse) => {
      console.log('ack')
      if (!myStream) return
      const peer = new SimplePeer({
        initiator: true,
        stream: myStream
      })

      peer.on('signal', data => {
        console.log('signal from ack')
        sendPassiveSignal({ data })
      })

      activePeers.push({ peerId, peer })

      peer.on('stream', stream => {
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('close', () => {
        console.log('close from ack')
        // sendPassiveSignal({ data })
      })
    })

    socket.on('streams:peers-passive-signal', ({ data }: SignalResponse) => {
      passivePeers.forEach(({ peer }) => peer.signal(data))
    })
    socket.on('streams:peers-active-signal', ({ data }: SignalResponse) => {
      activePeers.forEach(({ peer }) => peer.signal(data))
    })

    socket.on('game:player-left', ({ peerId }: AckSynResponse) => {
      console.log('peer left', peerId)
      setStreams(streams => {
        delete streams[peerId]
        return { ...streams }
      })
      passivePeers = passivePeers.filter(o => {
        if (peerId === o.peerId) {
          o.peer.destroy()
          return false
        }
        return true
      })
      activePeers = activePeers.filter(o => {
        if (peerId === o.peerId) {
          o.peer.destroy()
          return false
        }
        return true
      })
    })

    return () => {
      activePeers.forEach(({ peer }) => peer.destroy())
      activePeers = []
      passivePeers.forEach(({ peer }) => peer.destroy())
      passivePeers = []
      setStreams({})

      if (myStream) {
        myStream.getVideoTracks().forEach(t => t.stop())
        myStream.getAudioTracks().forEach(t => t.stop())
        myStream = null
      }
    }
  }, [])

  return streams
}
