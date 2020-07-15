import React from 'react'
import styled from '@emotion/styled'

import {useConfig, Cab} from '../providers/config'

import {Switch} from './switch'

const CabsDiv = styled.div`
  grid-column:2;
`

const CabDiv = styled.div`
  border: 2px solid #d1d8e0;
`
export const Cabs = () => {
  const {cabs} = useConfig()

  return <CabsDiv>
    {cabs.map((cab) => {
      return <Cabinet cab={cab} key={cab.key} />
    })}
  </CabsDiv>
}

const Cabinet: React.FC<{cab: Cab}> = ({cab}) => {
  return <CabDiv>
    <h1>{cab.name}</h1>
    {cab.switches.map((sw) => {
      return <Switch key={sw.key} sw={sw} cab={cab} />
    })}
  </CabDiv>
}