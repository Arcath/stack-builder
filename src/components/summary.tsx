import React from 'react'
import styled from '@emotion/styled'
import {rangeAsString} from '@arcath/utils'

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
      const tagged: {[cab: string]: {[sw: string]: number[]}} = {}

      vlan.untagged.forEach((portName) => {
        const {cab, sw, port} = dataFromPort(portName)

        if(!untagged[cab.name]){ untagged[cab.name] = {} }
        if(!untagged[cab.name][sw.name]){ untagged[cab.name][sw.name] = [] }

        untagged[cab.name][sw.name].push(parseInt(port, 10))
      })

      vlan.tagged.forEach((portName) => {
        const {cab, sw, port} = dataFromPort(portName)

        if(!tagged[cab.name]){ tagged[cab.name] = {} }
        if(!tagged[cab.name][sw.name]){ tagged[cab.name][sw.name] = [] }

        tagged[cab.name][sw.name].push(parseInt(port, 10))
      })

      return <div key={vid}>
        <h2>VLAN #{vid} {vlan.name}</h2>
        <h3>Untagged</h3>
        {Object.keys(untagged).map((cab) => {
          return Object.keys(untagged[cab]).map((sw) => {
            const ranges = rangeAsString(untagged[cab][sw])

            return ranges.map((range) => {
              return <>{cab}-{sw}-{range}&nbsp;</>
            })
          })
        })}
        <h3>Tagged</h3>
        {Object.keys(tagged).map((cab) => {
          return Object.keys(tagged[cab]).map((sw) => {
            const ranges = rangeAsString(tagged[cab][sw])

            return ranges.map((range) => {
              return <>{cab}-{sw}-{range}&nbsp;</>
            })
          })
        })}
      </div>
    })}
  </SummaryDiv>
}