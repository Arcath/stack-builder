import React from 'react'
import styled from '@emotion/styled'

import {useConfig} from '../providers/config'

const SummaryDiv = styled.div`
  grid-column:2;
`

export const Summary: React.FC = () => {
  const {vlans, dataFromPort} = useConfig()

  return <SummaryDiv>
    <h1>Summary</h1>
    {Object.keys(vlans).map((vid) => {
      const vlan = vlans[vid as any]

      const untagged: {[cab: string]: {[sw: string]: number[]}} = {}

      vlan.untagged.forEach((portName) => {
        const {cab, sw, port} = dataFromPort(portName)

        if(!untagged[cab.name]){ untagged[cab.name] = {} }
        if(!untagged[cab.name][sw.name]){ untagged[cab.name][sw.name] = [] }

        untagged[cab.name][sw.name].push(parseInt(port, 10))
      })



      return <div key={vid}>
        <h2>#{vid} {vlan.name}</h2>
        <h3>Untagged</h3>
        {Object.keys(untagged).map((cab) => {
          return Object.keys(untagged[cab]).map((sw) => {
            return untagged[cab][sw].map((port) => {
              return `${cab}-${sw}-${port}`
            }).join(', ')
          })
        })}
      </div>
    })}
  </SummaryDiv>
}