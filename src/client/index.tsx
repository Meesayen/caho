import React from 'react'
import { render } from 'react-dom'
import { Global, css } from '@emotion/core'
import { App } from './App'

const globalStyles = css`
  * {
    box-sizing: border-box;
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
`

render(
  <>
    <Global styles={globalStyles} />
    <App />
  </>,
  document.getElementById('app')
)
