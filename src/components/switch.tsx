import React from 'react'
import styled from '@emotion/styled'
import {times} from '@arcath/utils'

import {Switch as ISwitch, createPortNumber, Cab, useConfig, useConfigMutations} from '../providers/config'

const SWGrid = styled.div<{mainPorts: number, extraPorts: number}>`
  ${({mainPorts, extraPorts}) => {
    const columns = Math.round(mainPorts / 2) + Math.round(extraPorts / 2) + 1

    return `
      display:grid;
      grid-template-columns:repeat(${columns}, 1fr);
      grid-gap:3px;
    `
  }}
`

const Port = styled.div<{x: number, y: number, trunk: boolean}>`
  ${({x, y, trunk}) => {
    return `
      grid-column:${x};
      grid-row:${y};
      border:1px solid ${trunk ? '#fc5c65' : '#a55eea'};
      text-align:center;
    `
  }}
`

export const Switch: React.FC<{sw: ISwitch, cab: Cab}> = ({sw, cab}) => {
  const {vlans, currentVlan} = useConfig()
  const {brushPort} = useConfigMutations()

  const vlan = vlans[currentVlan]

  return <>
    <h2>{sw.name}</h2>
    <SWGrid mainPorts={sw.mainPorts} extraPorts={sw.extraPorts}>
      {times(sw.mainPorts + sw.extraPorts, (i) => {
        let state = "N"

        const portName = createPortNumber({cab, sw, port: i})

        if(vlan.untagged.includes(portName)){
          state = "U"
        }

        if(vlan.tagged.includes(portName)){
          state = "T"
        }

        const trunk = vlan.trunk.includes(portName)

        return <Port 
          x={i > sw.mainPorts ? Math.round(i / 2) + 1 : Math.round(i / 2)}
          y={i % 2 === 0 ? 2 : 1}
          trunk={trunk}
          onClick={() => {
            brushPort({port: portName})
          }}
        >
          {i} {state}
        </Port>
      })}
    </SWGrid>
  </>
}