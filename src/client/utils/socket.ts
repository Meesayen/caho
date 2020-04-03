import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import io from 'socket.io-client'

export interface SocketContext {
  socket: typeof io.Socket
}
const defaultContext: SocketContext = {
  socket: new Proxy(
    {},
    {
      get() {
        console.log('You need to provide a socket client!')
        return () => {}
      }
    }
  ) as typeof io.Socket
}

export const SocketContext = createContext<SocketContext>(defaultContext)

export const useSocketContext = () => useContext<SocketContext>(SocketContext)

type Error = number | string
export const useSocketData = <T>(msg: string): [T | null, Error | null] => {
  const [data, setData] = useState<T | null>(null)
  const [err, setErr] = useState<Error | null>(null)
  const { socket } = useSocketContext()
  useEffect(() => {
    const cb = (data: any) => {
      if (data.error) setErr(data.error)
      else setData(data as T)
    }
    socket.on(msg, cb)

    return () => {
      socket.off(msg, cb)
    }
  }, [msg, socket])
  return [data, err]
}

export const useSocket = () => {
  const { socket } = useSocketContext()
  return socket
}

export const useEmit = () => {
  const { socket } = useSocketContext()
  const emit = useCallback(
    (event: string, ...args: any[]) => {
      socket.emit(event, ...args)
    },
    [socket]
  )
  return emit
}

export const useEmitEvent = (event: string) => {
  const { socket } = useSocketContext()
  const emit = useCallback(
    (...args: any[]) => {
      socket.emit(event, ...args)
    },
    [event, socket]
  )
  return emit
}
