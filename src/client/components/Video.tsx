import React, { useCallback } from 'react'
import { css } from 'emotion'

const clsId = css`
  width: 100%;
  height: 100%;
  font-size: 0;
  background: #000d;
  overflow: hidden;

  div,
  video {
    width: 100%;
    height: 100%;
  }
`

const Video: React.FC<{ stream: any; isMe: boolean }> = ({ stream, isMe }) => {
  const addStream = useCallback(
    video => {
      if (video) video.srcObject = stream
    },
    [stream]
  )

  return (
    <div className={clsId}>
      {stream ? (
        <video ref={addStream} autoPlay={true} muted={isMe}></video>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Video
