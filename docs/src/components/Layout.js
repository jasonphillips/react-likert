// example Root component
import React from 'react'
import './Layout.css'

const Layout = props =>
  <div id="wrapper">
    {props.children}
  </div>

export default Layout