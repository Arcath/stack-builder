import React from 'react'
import styled from '@emotion/styled'

import {useConfig, useConfigMutations} from '../providers/config'

const SelectionDiv = styled.div`
  grid-column:2/4;
`

const SelectionGrid = styled.div<{selections: number}>`
  display:grid;
  grid-gap:10px;
  grid-template-columns:repeat(${({selections}) => selections}, 1fr);
`

const Selection = styled.button<{active: boolean}>`

`

export const VLANSelector: React.FC = () => {
  const {vlans, currentVlan} = useConfig()
  const {setActiveVlan} = useConfigMutations()

  const vids = Object.keys(vlans) as any as number[]

  return <SelectionDiv>
    <h3>VLAN</h3>
    <SelectionGrid selections={vids.length}>
      {vids.map((vid) => {
        return <Selection key={vid} active={vid === currentVlan} onClick={() => {
          setActiveVlan({number: vid})
        }}>VLAN #{vid} {vlans[vid].name}</Selection>
      })}
    </SelectionGrid>
  </SelectionDiv>
}