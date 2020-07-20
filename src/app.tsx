import React from 'react'
import styled from '@emotion/styled'

import {ConfigContext} from './providers/config'

import {Add} from './components/add'
import {Cabs} from './components/cab'
import {Summary} from './components/summary'
import {VLANSelector} from './components/vlan-selector'

const Grid = styled.div`
  display:grid;
  grid-template-columns:1fr 3fr 1fr 1fr;
  grid-gap:20px;
`

export const App: React.FC = () => {
  return <ConfigContext>
    <Grid>
      <VLANSelector />
      <Cabs />
      <Add />
      <Summary />
    </Grid>
  </ConfigContext>
}
