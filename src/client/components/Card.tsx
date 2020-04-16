import React, { useCallback } from 'react'
import { css, cx } from 'emotion'
import { motion } from 'framer-motion'
import marked from 'marked'
import { AnswerCard, QuestionCard } from '~/types'
import { blankify, countBlanks } from '~/utils/misc'

const cls = css`
  width: 160px;
  height: 256px;
  border-radius: 14px;
  border: 1px solid #0003;
  box-shadow: 1px 1px 4px #0002;
  background: white;
  padding: 8px 16px;
  font-family: helvetica;
  letter-spacing: 0.3px;
  line-height: 20px;
  font-size: 15px;
  transition: box-shadow 150ms ease-in-out;

  &.-question {
    background: linear-gradient(150deg, #242627, #242627d6);
    color: white;
  }

  &.-deck {
    box-shadow: 3px 2px #2a3828, 4px 4px #2a3828, 6px 6px #2a3828,
      6px 6px 14px #000a;
    transform: translate(-3px, -6px);

    &:hover {
      box-shadow: 0 0 0 2px goldenrod, 3px 2px #2a3828, 4px 4px #2a3828,
        6px 6px #2a3828, 6px 6px 14px #000a;
    }
  }

  &.-small {
    width: 80px;
    height: 128px;
    line-height: 10px;
    font-size: 7px;
    border-radius: 10px;
    padding: 2px 8px;
  }

  &.-pick-2,
  &.-pick-3 {
    position: relative;
    &::before,
    &::after {
      position: absolute;
      display: block;
    }
    &::before {
      content: 'Pick';
      color: white;
      right: 44px;
      bottom: 14px;
      font-size: 17px;
    }
    &::after {
      bottom: 10px;
      right: 10px;
      width: 18px;
      height: 18px;
      background: white;
      color: #242627;
      border-radius: 50%;
      padding: 5px;
      text-align: center;
      font-size: 20px;
    }
  }
  &.-pick-2 {
    &::after {
      content: '2';
    }
  }
  &.-pick-3 {
    &::after {
      content: '3';
    }
  }

  &:not(.-deck):hover {
    box-shadow: 1px 1px 4px #0002, 0 0 0 2px goldenrod;
  }
`

interface Props {
  id?: number
  text?: string
  className?: string
  type?: 'question' | 'answer'
  deck?: boolean
  size?: 'small' | 'regular'
  onClick?: (c: AnswerCard | QuestionCard) => void
}

export const Card: React.FC<Props> = ({
  type = 'answer',
  size = 'regular',
  deck,
  id,
  text,
  className,
  onClick,
}) => {
  const pickNum = text ? countBlanks({ text }) : 0

  const classes = [
    className,
    type === 'question' ? '-question' : null,
    size === 'small' ? '-small' : null,
    deck ? '-deck' : null,
    pickNum > 1 ? `-pick-${pickNum}` : null,
  ].filter(Boolean)

  const emitClick = useCallback(() => {
    if (onClick) {
      if (id) onClick({ id, text } as AnswerCard)
      else onClick({ text } as QuestionCard)
    }
  }, [onClick])

  const html = text ? marked(blankify(text)) : ''

  return (
    <motion.div className={cx(cls, 'Card', ...classes)} onClick={emitClick}>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </motion.div>
  )
}
