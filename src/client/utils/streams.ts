import { useState, useEffect, useCallback } from 'react'
import SimplePeer from 'simple-peer'
import { useEmitEvent, useSocketContext } from '~/utils/socket'

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
let videoOn: boolean = true

type SetPropsFunction = (o: { withVideo: boolean }) => void
type UseMyStreamHookRet = [MediaStream | null, SetPropsFunction]
export function useMyStream(): UseMyStreamHookRet {
  const [stream, setStream] = useState<MediaStream | null>(myStream)
  const [withVideo, setWithVideo] = useState(videoOn)

  useEffect(() => {
    async function getMediaStream() {
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          video: withVideo,
          audio: true,
        })
        setStream(myStream)
      } catch (err) {
        /* TODO: handle the error */
      }
    }

    getMediaStream()

    return () => {
      if (myStream) {
        myStream.getVideoTracks().forEach(t => t.stop())
        myStream.getAudioTracks().forEach(t => t.stop())
        myStream = null
      }
    }
  }, [withVideo])

  const setProps = useCallback(({ withVideo = true }) => {
    videoOn = withVideo
    setWithVideo(withVideo)
  }, [])

  return [stream, setProps]
}

export function useStreams() {
  const { socket } = useSocketContext()
  const [stream] = useMyStream()
  const [streams, setStreams] = useState<Record<string, MediaStream>>({})

  const sendSyn = useEmitEvent('streams:peers-syn')
  const sendAck = useEmitEvent('streams:peers-ack')
  const sendActiveSignal = useEmitEvent('streams:peers-active-signal')
  const sendPassiveSignal = useEmitEvent('streams:peers-passive-signal')

  useEffect(() => {
    if (stream) {
      setStreams(streams => {
        return { ...streams, [socket.id]: stream! }
      })
      sendSyn({ peerId: socket.id })
    }
  }, [stream])

  useEffect(() => {
    if (!stream) return

    let activePeers: PeerCache[] = []
    let passivePeers: PeerCache[] = []

    socket.on('streams:peers-syn', ({ peerId }: AckSynResponse) => {
      if (!stream) return
      const peer = new SimplePeer({
        initiator: false,
        stream,
      })

      peer.on('signal', data => {
        sendActiveSignal({ data })
      })

      passivePeers.push({ peerId, peer })

      peer.on('stream', stream => {
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('close', () => {
        // sendPassiveSignal({ data })
      })

      sendAck({ peerId: socket.id })
    })

    socket.on('streams:peers-ack', ({ peerId }: AckSynResponse) => {
      if (!stream) return
      const peer = new SimplePeer({
        initiator: true,
        stream,
      })

      peer.on('signal', data => {
        sendPassiveSignal({ data })
      })

      activePeers.push({ peerId, peer })

      peer.on('stream', stream => {
        setStreams(streams => {
          return { ...streams, [peerId]: stream }
        })
      })

      peer.on('close', () => {
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
  }, [stream])

  return streams
}
