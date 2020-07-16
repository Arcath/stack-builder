import React from 'react'
import styled from '@emotion/styled'
import {useForm} from 'react-hook-use-form'

import {useConfigMutations, useConfig} from '../providers/config'

const AddDiv = styled.div`
  grid-column:3;
`

const Input = styled.input`
  width:100%;
  background:none;
  color:#fff;
  border:1px solid #45aaf2;
  padding:3px;
  margin-bottom:3px;
  box-sizing:border-box;
`

const Select = styled.select`
  width:100%;
  background:none;
  color:#fff;
  border:1px solid #45aaf2;
  padding:3px;
  margin-bottom:3px;
`

const Submit = styled.input`
  width:100%;
  background-color:#20bf6b;
  color:#fff;
  border:1px solid #26de81;
  padding:3px;
  margin-bottom:3px;
`

export const Add: React.FC = () => {
  return <AddDiv>
    <BrushSelector />
    <Inspector />
    <AddCab />
    <AddSwitch />
    <AddVlan />
  </AddDiv>
}

const AddCab: React.FC = () => {
  const {bind, formBind, onSubmit, clear} = useForm({name: ''})

  const {addCab} = useConfigMutations()

  onSubmit(({name}) => {
    addCab({name})
    clear()
  })

  return <form {...formBind()}>
    <h3>Add Cab</h3>
    <Input {...bind('name')} />
    <Submit type="submit" value="Add Cab" />
  </form>
}

const AddSwitch: React.FC = () => {
  const {bind, formBind, onSubmit, clear} = useForm({name: '', mainPorts: 48, extraPorts: 4, cab: ''})

  onSubmit(({name, mainPorts, extraPorts, cab}) => {
    addSwitch({
      name,
      mainPorts: parseInt(mainPorts as any),
      extraPorts: parseInt(extraPorts as any),
      cab
    })
    clear()
  })

  const {cabs} = useConfig()
  const {addSwitch} = useConfigMutations()

  return <form {...formBind()}>
    <h3>Add Switch</h3>
    <label>Cab</label>
    <Select {...bind('cab')}>
      {cabs.map((cab) => {
        return <option value={cab.key} key={cab.key}>{cab.name}</option>
      })}
    </Select>
    <label>Name</label>
    <Input {...bind('name')} />
    <label>Main Ports</label>
    <Input {...bind('mainPorts')} type="number" />
    <label>Extra Ports</label>
    <Input {...bind('extraPorts')} type="number" />
    <Submit type="submit" value="Add Switch" />
  </form>
}

const AddVlan: React.FC = () => {
  const {bind, formBind, onSubmit, clear} = useForm({name: '', number: 0})

  const {addVlan} = useConfigMutations()

  onSubmit(({name, number}) => {
    const n = parseInt(number as any)

    addVlan({name, number: n})
    clear()
  })

  return <form {...formBind()}>
    <h3>Add Vlan</h3>
    <label>Name</label>
    <Input {...bind('name')} />
    <label>Number</label>
    <Input {...bind('number')} min={1} max={4093} type="number" />
    <Submit type="submit" value="Add VLAN" />
  </form>
}

const Brush = styled.button<{active: boolean}>`
  border:1px solid ${({active}) => (active ? '#26de81' : '#f7b731')};
  color:#fff;
  padding:5px;
  background:none;
  width:100%;
  margin-bottom:3px;
`

const BrushSelector: React.FC = () => {
  const {selectBrush} = useConfigMutations()
  const {brush, linkFrom} = useConfig()

  return <div>
    <Brush active={brush === 'N'} onClick={() => selectBrush({brush: 'N'})}>N - Not a Member</Brush>
    <Brush active={brush === 'U'} onClick={() => selectBrush({brush: 'U'})} style={{backgroundColor: '#4b7bec'}}>U - Untagged Member</Brush>
    <Brush active={brush === 'T'} onClick={() => selectBrush({brush: 'T'})} style={{backgroundColor: '#fa8231'}}>T - Tagged Member</Brush>
    <Brush active={brush === 'Tr'} onClick={() => selectBrush({brush: 'Tr'})}>Tr - Trunk Port</Brush>
    <Brush active={brush === 'L'} onClick={() => selectBrush({brush: 'L'})}>
      {linkFrom === '' ? `Link Ports` : `Link to ${linkFrom}` }
    </Brush>
    <Brush active={brush === 'I'} onClick={() => selectBrush({brush: 'I'})}>Inspect</Brush>
  </div>
}

const Inspector: React.FC = () => {
  const {cabs, vlans, inspect, links, dataFromPort, brush} = useConfig()
  const {selectBrush, brushPort} = useConfigMutations()

  if(inspect === ''){
    return <></>
  }

  const [cabKey, swKey, port] = inspect.split('#')

  const cab = cabs.reduce((c, a) => {
    return (a.key === cabKey ? a : c)
  })

  const sw = cab.switches.reduce((s, w) => {
    return (w.key === swKey ? w : s)
  })

  const untagged: number[] = []
  const tagged: number[] = []
  let trunk = false

  Object.keys(vlans).forEach((vid) => {
    if(vlans[vid as any].trunk.includes(inspect)){
      trunk = true
      return
    }

    if(vlans[vid as any].untagged.includes(inspect)){
      untagged.push(vid as any)
    }

    if(vlans[vid as any].tagged.includes(inspect)){
      tagged.push(vid as any)
    }
  })

  let linked = false
  let link: {cab?: any, sw?: any, port?: any} = {}
  if(!!links[inspect]){
    linked = true

    link = dataFromPort(links[inspect])
  }

  if(trunk){
    return <div>
      <h3>{cab.name} - {sw.name} - {port}</h3>
      <p>Trunk Port</p>
      {linked ? <p onClick={() => {
        if(brush !== 'I'){
          selectBrush({brush: 'I'})
        }

        brushPort({port: links[inspect]})
      }}>Linked to {link.cab.name} - {link.sw.name} - {link.port}</p> : ''}
    </div>
  }

  return <div>
    <h3>{cab.name} - {sw.name} - {port}</h3>
    <h4>Untagged</h4>
    <ul>
      {untagged.map((vid) => {
        return <li key={vid}>{vid}</li>
      })}
    </ul>
    <h4>Tagged</h4>
    <ul>
      {tagged.map((vid) => {
        return <li key={vid}>{vid}</li>
      })}
    </ul>
    {linked ? <p onClick={() => {
      if(brush !== 'I'){
        selectBrush({brush: 'I'})
      }

      brushPort({port: links[inspect]})
    }}>Linked to {link.cab.name} - {link.sw.name} - {link.port}</p> : ''}
  </div>
}