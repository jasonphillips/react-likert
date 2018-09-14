// example Root component
import React from 'react'
import { StyleProvider } from 'mdx-go'

const css = `
  thead th {
    vertical-align: bottom;
  }
  .demo > tbody tr > td:first-child {
    border-bottom: 1px dotted #ccc;
    padding: 5px 0;
  }
  #wrapper {
    padding: 32px;
    margin-left: auto;
    margin-right: auto;
    max-width: 1000px;
  }
`

export const Root = props =>
  <StyleProvider css={css}>
    <div id="wrapper">
      {props.children}
    </div>
  </StyleProvider>