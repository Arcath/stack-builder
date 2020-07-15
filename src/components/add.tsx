import React from 'react'
import styled from '@emotion/styled'
import {useForm} from 'react-hook-use-form'

import {useConfigMutations, useConfig} from '../providers/config'

const AddDiv = styled.div`
  grid-column:3;
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
    <input {...bind('name')} />
    <input type="submit" value="Add Cab" />
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
    <select {...bind('cab')}>
      {cabs.map((cab) => {
        return <option value={cab.key} key={cab.key}>{cab.name}</option>
      })}
    </select>
    <input {...bind('name')} />
    <input {...bind('mainPorts')} type="number" />
    <input {...bind('extraPorts')} type="number" />
    <input type="submit" value="Add Switch" />
  </form>
}

const AddVlan: React.FC = () => {
  const {bind, formBind, onSubmit, clear} = useForm({name: '', number: 0})

  const {addVlan} = useConfigMutations()

  onSubmit(({name, number}) => {
    addVlan({name, number})
    clear()
  })

  return <form {...formBind()}>
    <h3>Add Vlan</h3>
    <input {...bind('name')} />
    <input {...bind('number')} min={1} max={4093} type="number" />
    <input type="submit" value="Add VLAN" />
  </form>
}

const BrushSelector: React.FC = () => {
  const {selectBrush} = useConfigMutations()

  return <div>
    <button onClick={() => selectBrush({brush: 'N'})}>N - Not a Member</button>
    <button onClick={() => selectBrush({brush: 'U'})}>U - Untagged Member</button>
    <button onClick={() => selectBrush({brush: 'T'})}>T - Tagged Member</button>
    <button onClick={() => selectBrush({brush: 'Tr'})}>Tr - Trunk Port</button>
    <button onClick={() => selectBrush({brush: 'I'})}>Inspect</button>
  </div>
}

const Inspector: React.FC = () => {
  const {cabs, vlans, inspect} = useConfig()

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

  if(trunk){
    return <div>
      <h3>{cab.name} - {sw.name} - {port}</h3>
      <p>Trunk Port</p>
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
  </div>
}