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
  border:1px solid ${({active}) => (active ? '#26de81' : '#f7b731')};
  color:#fff;
  padding:5px;
  background:none;
`

export const VLANSelector: React.FC = () => {
  const {vlans, currentVlan} = useConfig()
  const {setActiveVlan} = useConfigMutations()

  const vids = Object.keys(vlans).map((n) => parseInt(n, 10))

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