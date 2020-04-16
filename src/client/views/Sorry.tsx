import React, { useEffect } from 'react'
import { css } from 'emotion'
import { Link } from 'wouter'

const cls = css`
  padding-top: 240px;
  .panel {
    margin: 0 auto;
    width: 640px;
    height: 480px;
    padding: 32px;
    border: 1px solid #0005;
    border-top-color: #0002;
    border-left-color: #0002;
    border-radius: 3px;
    box-shadow: 0 1px 3px #0002;
    text-align: center;

    h1 {
      margin-bottom: 0;
    }

    p {
      letter-spacing: 1px;
      font-size: 20px;
      max-width: 400px;
      margin-bottom: 32px;
    }

    .btn {
      background: #59aeb7;
      color: white;
      border-radius: 2px;
      padding: 16px 64px;
      font-size: 32px;
    }
  }
`

const Lobby: React.FC = () => {
  return (
    <div className={cls}>
      <div className="panel u--flx -col -cc -sb">
        <h1 className="title">Sorry!</h1>
        <div className="u--flx -col -cc">
          <p>
            The game you tried to join has probably already started or have met
            the maximum players allowed.
          </p>
        </div>
        <Link className="btn" to={`/lobby`}>
          Back to Lobby...
        </Link>
      </div>
    </div>
  )
}
export default Lobby
