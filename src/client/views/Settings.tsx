import React, { useEffect, useState, useCallback } from 'react'
import { css, cx } from 'emotion'
import { Link } from 'wouter'
import { useMyStream } from '~/utils/streams'
import Video from '~/components/Video'
import Avatar, { avatars } from '~/components/Avatar'

const cls = css`
  padding-top: 5vh;
  .panel {
    margin: 0 auto;
    width: 640px;
    max-height: 92vh;
    padding: 32px;
    border: 1px solid #0005;
    border-top-color: #0002;
    border-left-color: #0002;
    border-radius: 3px;
    box-shadow: 0 1px 3px #0002;
    text-align: center;
    background: #fff7;

    h1 {
      margin-bottom: 0;
    }

    p {
      letter-spacing: 1px;
      font-size: 20px;
      margin-bottom: 32px;

      span {
        font-size: 14px;
        color: #0007;
      }
    }

    input.name {
      font-size: 20px;
      width: 100%;
      padding: 8px;
      color: #030d;
      font-family: helvetica;
      background: #fffa;
      border: 1px solid #0606;
      border-radius: 3px;
      outline: none;

      &:active,
      &:focus {
        box-shadow: 0 0 2px 1px #060a;
      }
    }

    .video {
      width: 400px;
      height: 300px;
      max-width: 40vh;
      max-height: 30vh;
      margin: 0 auto;
    }

    .toggle {
      width: 100%;
      padding: 16px;

      label {
        position: relative;
        background: #fffa;
        width: 24px;
        height: 24px;
        display: block;
        border: 1px solid #0606;
        border-radius: 8px 3px;
        cursor: pointer;

        &::after {
          position: absolute;
          content: '';
          display: block;
          width: 16px;
          height: 16px;
          top: 3px;
          left: 3px;
          border-radius: 5px 2px;
          background: #0609;
          opacity: 0;
        }
      }

      input {
        opacity: 0;

        &:checked ~ label::after {
          opacity: 1;
        }
      }
    }

    .avatars {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(2, 110px);
      grid-gap: 8px;
      height: 300px;

      > * {
        cursor: pointer;
      }

      .-selected {
        transform: scale(1.1);
      }
    }

    .actions {
      width: 100%;
    }
    .btn {
      background: #59aeb7;
      color: white;
      border-radius: 2px;
      padding: 8px 32px;
      font-size: 24px;
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }

      &.-disabled {
        pointer-events: none;
        filter: grayscale();
      }

      &.-back {
        position: relative;
        padding-left: 22px;
        &::before {
          position: absolute;
          display: block;
          content: '';
          top: 0;
          left: -44px;
          border: 22px solid #59aeb7;
          border-color: transparent #59aeb7 transparent transparent;
        }
      }
    }
  }
`

interface Props {
  gameId: string
}

const Settings: React.FC<Props> = ({ gameId }) => {
  const [name, setName] = useState<string>('')
  const [avatar, setAvatar] = useState<string>('')
  const [videoOn, setVideoOn] = useState(true)
  const [stream, setStreamProps] = useMyStream()

  const toggleVideo = useCallback(() => {
    const newVal = !videoOn
    setVideoOn(newVal)
    setStreamProps({ withVideo: newVal })
  }, [videoOn])

  useEffect(() => {
    sessionStorage.setItem('player-name', name)
    sessionStorage.setItem('player-avatar', avatar)
  }, [name, avatar])

  return (
    <div className={cls}>
      <div className="panel u--flx -col -cc -sb">
        <h1 className="title">Before we start</h1>
        <section className="u--flx -col -cc">
          <p>
            What's your name of choice? <span>(required)</span>
          </p>
          <input
            className="name"
            type="text"
            spellCheck={false}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </section>

        <section>
          <p>
            The app may use your cam and mic. <br />
            <span>(please give permissions when asked)</span>
          </p>
          {videoOn ? (
            <div className="video">
              <Video stream={stream} isMe={true} />
            </div>
          ) : (
            <div className="avatars">
              {avatars.map(a => {
                return (
                  <div
                    className={a.id === avatar ? '-selected' : ''}
                    onClick={() => setAvatar(a.id)}
                    key={a.id}
                  >
                    <Avatar id={a.id} />
                  </div>
                )
              })}
            </div>
          )}
          <div className="toggle u--flx -cc">
            <div>Turn video on/off:</div>
            <input
              id="turnOffCamVideo"
              type="checkbox"
              checked={videoOn}
              onChange={toggleVideo}
            />
            <label htmlFor="turnOffCamVideo"></label>
          </div>
        </section>

        <section className="actions u--flx -vc -se">
          <Link className="btn -back" to={`/lobby`}>
            Back
          </Link>
          <Link
            className={cx('btn', name ? '' : '-disabled')}
            to={`/game/${gameId}`}
          >
            Submit
          </Link>
        </section>
      </div>
    </div>
  )
}
export default Settings
