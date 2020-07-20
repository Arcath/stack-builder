import React from 'react'
import styled from '@emotion/styled'
import {times} from '@arcath/utils'
import ReactTooltip from 'react-tooltip'

import {Switch as ISwitch, createPortNumber, Cab, useConfig, useConfigMutations, PortState} from '../providers/config'

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

const Port = styled.div<{x: number, y: number, trunk: boolean, state: PortState, error: boolean}>`
  ${({x, y, trunk, state, error}) => {
    let bg = ''
    let border = '#a55eea'

    switch(state){
      case 'N':
        bg = 'rgba(0,0,0,0)'
        break
      case 'U':
        bg = '#4b7bec'
        break
      case 'T':
        bg = '#fa8231'
        break
    }

    if(trunk){
      border = '#fc5c65'
    }

    if(error){
      border = '#eb3b5a'
    }

    return `
      grid-column:${x};
      grid-row:${y};
      border:2px solid ${border};
      text-align:center;
      background-color:${bg};
      line-height:30px;
    `
  }}
`

export const Switch: React.FC<{sw: ISwitch, cab: Cab}> = ({sw, cab}) => {
  const {vlans, currentVlan, brush, dataFromPort} = useConfig()
  const {brushPort} = useConfigMutations()

  const vlan = vlans[currentVlan]

  return <>
    <h2>{sw.name}</h2>
    <SWGrid mainPorts={sw.mainPorts} extraPorts={sw.extraPorts}>
      {times(sw.mainPorts + sw.extraPorts, (i) => {
        let state: PortState = "N"

        const portName = createPortNumber({cab, sw, port: i})

        if(vlan.untagged.includes(portName)){
          state = "U"
        }

        if(vlan.tagged.includes(portName)){
          state = "T"
        }

        const trunk = vlan.trunk.includes(portName)

        const data = dataFromPort(portName)

        const untagged = () => {
          if(data.untagged.length === 1){
            return <>Untagged: {data.untagged[0]}</>
          }

          if(data.untagged.length === 0){
            return <span style={{color: '#eb3b5a'}}>No Untagged VLAN!</span>
          }

          return <span style={{color: '#eb3b5a'}}>Untagged: {data.untagged.join(', ')}</span>
        }

        return <>
          <ReactTooltip id={portName} disable={brush !== 'I'} multiline={true}>
            {cab.name} - {sw.name} - {i}<br />
            <br />
            {untagged()}<br />
            Tagged: {data.tagged.length === 0 ? <i>None</i> : data.tagged.join(', ')}
            {data.trunk ? <><br /><br />Trunk Port</> : ''}
          </ReactTooltip>
          <Port 
            x={i > sw.mainPorts ? Math.round(i / 2) + 1 : Math.round(i / 2)}
            y={i % 2 === 0 ? 2 : 1}
            trunk={trunk}
            onClick={() => {
              brushPort({port: portName})
            }}
            state={state}
            data-tip={true}
            data-for={portName}
            error={data.untagged.length !== 1}
          >
            {i}
          </Port>
        </>
      })}
    </SWGrid>
  </>
}