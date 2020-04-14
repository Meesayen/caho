import React, { useEffect, useState } from 'react'
import { css, cx } from 'emotion'
import { motion, Variants } from 'framer-motion'

interface Props {
  onReady: () => void
}

const cls = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000d;
  color: #fffa;
  font-size: 32px;
  letter-spacing: 1.5px;
  line-height: 50px;
  text-align: center;
`
const screenAnimations: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      duration: 0.2,
    },
  },
}
const contentAnimations: Variants = {
  hidden: {
    y: 100,
  },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 250,
      delay: 0.05,
    },
  },
  exiting: {
    y: -100,
    transition: {
      duration: 0.1,
    },
  },
}

export const LoadingPhase: React.FC<Props> = ({ onReady }) => {
  const [tminus, setTminus] = useState(3)
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let timer: any

    if (exiting) {
      timer = setTimeout(() => {
        setVisible(false)
        setExiting(false)
        onReady()
      }, 500)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [exiting])

  useEffect(() => {
    if (tminus === 0) {
      setExiting(true)
      return
    }

    const timer = setTimeout(() => {
      setTminus(tminus - 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [tminus])

  return (
    <motion.div
      initial="hidden"
      animate={visible && !exiting ? 'visible' : 'hidden'}
      variants={screenAnimations}
      className={cx(cls, 'u--flx -col -cc')}
    >
      <motion.div
        initial="hidden"
        animate={visible && !exiting ? 'visible' : 'exiting'}
        variants={contentAnimations}
      >
        <h1>Game starting in...</h1>
        <h3>{tminus}</h3>
      </motion.div>
    </motion.div>
  )
}
