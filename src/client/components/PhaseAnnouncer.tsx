import React, { useEffect, useState } from 'react'
import { css, cx } from 'emotion'
import { motion, Variants } from 'framer-motion'
import { Game } from '~types'

interface Props {
  phase: Game['phase']
  isJudge: boolean
  isWinner: boolean
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

export const PhaseAnnouncer: React.FC<Props> = ({
  phase,
  isJudge,
  isWinner,
}) => {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let timer: any
    if (visible) {
      timer = setTimeout(() => setExiting(true), 2500)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [visible])

  useEffect(() => {
    let timer: any
    if (exiting) {
      timer = setTimeout(() => {
        setVisible(false)
        setExiting(false)
      }, 500)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [exiting])

  useEffect(() => {
    if (phase === 'pick-question') {
      setTitle('Question Picking')
      setMsg(
        isJudge ? 'Please pick a question card.' : 'Waiting judge action...'
      )
      setVisible(true)
    }

    if (phase === 'pick-answers') {
      setTitle('Answers Picking')
      setMsg(
        isJudge ? 'Waiting players actions...' : 'Please choose an answer card.'
      )
      setVisible(true)
    }

    if (phase === 'read-answers') {
      setTitle('Reading Answers')
      setMsg(
        isJudge
          ? 'Reveal answers one by one and read them aloud.'
          : 'Listen while the judge reads the answers.'
      )
      setVisible(true)
    }

    if (phase === 'select-winner') {
      setTitle('Winner Selection')
      setMsg(
        isJudge ? 'Please select the answer you liked the most' : 'Good Luck!'
      )
      setVisible(true)
    }

    if (phase === 'points') {
      setTitle(
        isJudge ? 'Great Choice!' : isWinner ? 'Congratulations!' : 'Too bad!'
      )
      setMsg(
        isJudge
          ? ''
          : isWinner
          ? 'You won this round. You get 1 point.'
          : 'Better luck next time.'
      )
      setVisible(true)
    }
  }, [phase])

  if (!visible) return null

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
        <h1>{title}</h1>
        <h3>{msg}</h3>
      </motion.div>
    </motion.div>
  )
}
