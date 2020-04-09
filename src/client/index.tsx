import React from 'react'
import { render } from 'react-dom'
import { Global, css } from '@emotion/core'
import { App } from './App'

const globalStyles = css`
  * {
    box-sizing: border-box;
  }
  .u--ghost {
    opacity: 0;
  }
  .u--flx {
    display: flex;

    &.-cc {
      justify-content: center;
      align-items: center;
    }

    &.-sb {
      justify-content: space-between;
    }
    &.-se {
      justify-content: space-evenly;
    }
    &.-sa {
      justify-content: space-around;
    }

    &:not(.-col) {
      &.-vc {
        align-items: center;
      }
      &.-hc {
        justify-content: center;
      }
    }
    &.-col {
      flex-direction: column;
      &.-vc {
        justify-content: center;
      }
      &.-hc {
        align-items: center;
      }
    }
  }

  .card,
  .deck {
    width: 160px;
    height: 256px;
    border-radius: 14px;
    border: 1px solid #0003;
    box-shadow: 1px 1px 4px #0002;
    padding: 24px 16px;
    font-family: helvetica;
    letter-spacing: 0.3px;

    &.-question {
      background: linear-gradient(150deg, #242627, #242627d6);
    }
  }
  .deck {
    box-shadow: 3px 3px #36404c, 4px 4px 6px #000a;
  }

  .card.-small {
    width: 80px;
    height: 128px;
    font-size: 10px;
    border-radius: 10px;
    padding: 12px 10px;
  }
`

render(
  <>
    <Global styles={globalStyles} />
    <App />
  </>,
  document.getElementById('app')
)
