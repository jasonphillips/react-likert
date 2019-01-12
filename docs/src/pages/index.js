import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/Layout'
import Simple from '../components/Simple'

const IndexPage = () => (
  <Layout>
    <h1>Home</h1>

    <Simple />

    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage
