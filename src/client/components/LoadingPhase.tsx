import React, { useEffect, useState } from 'react'
import { css, cx } from 'emotion'

interface Props {
  onReady: () => void
}

const cls = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0007;
  color: #fffa;
  font-size: 32px;
  letter-spacing: 1.5px;
  line-height: 50px;
  text-align: center;
`

export const LoadingPhase: React.FC<Props> = ({ onReady }) => {
  const [tminus, setTminus] = useState(5)

  useEffect(() => {
    if (tminus === 0) {
      onReady()
      return
    }

    setTimeout(() => {
      setTminus(tminus - 1)
    }, 1000)
  }, [tminus])

  return (
    <div className={cx(cls, 'u--flx -col -cc')}>
      <div>Game Starting In...</div>
      <div>{tminus}</div>
    </div>
  )
}
