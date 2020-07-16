import React, {createContext, useContext, useReducer} from 'react'
import {v4 as uuidv4} from 'uuid'
import {times} from '@arcath/utils'

export type PortNumber = string

export interface Config{
  vlans: {[vlan: number]: VLAN}
  cabs: Cab[]
  currentVlan: number
  brush: Brush
  inspect: string
  links: {[from: string]: string}
  linkFrom: string
}

export interface VLAN{
  number: number
  name: string
  untagged: PortNumber[]
  tagged: PortNumber[]
  trunk: PortNumber[]
}

export interface Cab{
  key: string
  name: string
  switches: Switch[]
}

export interface Switch{
  key: string
  name: string
  mainPorts: number
  extraPorts: number
}

export type PortState = "N" | "U" | "T" | "Tr"
export type Brush =  PortState | 'I' | 'L'

interface ReducerPayload{
  addCab: {
    name: string
  }
  removeCab: {
    key: string
  }
  addVlan: {
    number: number
    name: string
  }
  removeVlan: {
    number: number
  }
  addSwitch: {
    name: string
    mainPorts: number
    extraPorts: number
    cab: string
  }
  setActiveVlan: {
    number: number
  }
  brushPort: {
    port: string
  }
  selectBrush: {
    brush: Brush
  }
}

interface ReducerAction<T extends keyof ReducerPayload>{
  action: T
  payload: ReducerPayload[T]
}

type ConfigActions = 
  ReducerAction<'addCab'> |
  ReducerAction<'removeCab'> |
  ReducerAction<'addVlan'> |
  ReducerAction<'removeVlan'> |
  ReducerAction<'addSwitch'> |
  ReducerAction<'setActiveVlan'> |
  ReducerAction<'brushPort'> |
  ReducerAction<'selectBrush'>


export const createPortNumber = ({cab, sw, port}: {cab: Cab, sw: Switch, port: number}): PortNumber => {
  return `${cab.key}#${sw.key}#${port}`
}

const configReducer = (state: Config, {action, payload}: ConfigActions) => {
  const newState = Object.assign({}, state)

  switch(action){
    case 'addCab':
      const {name} = payload as ReducerPayload['addCab']
      newState.cabs.push({
        key: uuidv4(),
        name,
        switches: []
      })
      break
    case 'removeCab':
      const {key} = payload as ReducerPayload['removeCab']
      newState.cabs = newState.cabs.filter((cab) => {
        return cab.key !== key
      })
      break
    case 'addVlan':
      const {name: vlanName, number} = payload as ReducerPayload['addVlan']
      newState.vlans[number] = {
        number,
        name: vlanName,
        untagged: [],
        tagged: [],
        trunk: []
      }

      newState.cabs.forEach((cab) => {
        cab.switches.forEach((sw) => {
          times(sw.mainPorts + sw.extraPorts, (port) => {
            const portName = createPortNumber({cab, sw, port})

            if(newState.vlans[1].trunk.includes(portName)){
              newState.vlans[number].trunk.push(portName)
              newState.vlans[number].tagged.push(portName)
            }
          })
        })
      })
      break
    case 'removeVlan':
      delete newState.vlans[(payload as ReducerPayload['removeVlan']).number]
      break
    case 'addSwitch':
      const {name: switchName, mainPorts, extraPorts, cab} = payload as ReducerPayload['addSwitch']

      let cabIndex = 0
      newState.cabs.forEach((c, i) => {
        if(c.key === cab){
          cabIndex = i
        }
      })

      const sw = {
        name: switchName,
        mainPorts,
        extraPorts,
        key: uuidv4()
      }

      newState.cabs[cabIndex].switches.push(sw)

      times(mainPorts + extraPorts, (port) => {
        newState.vlans[1].untagged.push(createPortNumber({cab: newState.cabs[cabIndex], sw, port}))
      })
      break
    case 'setActiveVlan':
      const {number: vid} = payload as ReducerPayload['setActiveVlan']

      newState.currentVlan = vid
      break
    case 'brushPort':
      const {port} = payload as ReducerPayload['brushPort']

      if(newState.brush === 'I'){
        newState.inspect = port
        break
      }

      if(newState.brush === 'L'){
        if(newState.linkFrom === ''){
          newState.linkFrom = port
        }else{
          delete newState.links[newState.links[port]]
          delete newState.links[newState.links[newState.linkFrom]]

          newState.links[port] = newState.linkFrom
          newState.links[newState.linkFrom] = port

          newState.linkFrom = ''
        }

        break
      }

      if(newState.vlans[newState.currentVlan].trunk.includes(port)){
        (Object.keys(newState.vlans) as any[]).forEach((vid) => {
          newState.vlans[vid].untagged = newState.vlans[vid].untagged.filter((p) => {
            return p !== port
          })
          newState.vlans[vid].tagged = newState.vlans[vid].tagged.filter((p) => {
            return p !== port
          })
          newState.vlans[vid].trunk = newState.vlans[vid].trunk.filter((p) => {
            return p !== port
          })
        })
      }

      newState.vlans[newState.currentVlan].untagged = newState.vlans[newState.currentVlan].untagged.filter((p) => {
        return p !== port
      })
      newState.vlans[newState.currentVlan].tagged = newState.vlans[newState.currentVlan].tagged.filter((p) => {
        return p !== port
      })
      newState.vlans[newState.currentVlan].trunk = newState.vlans[newState.currentVlan].trunk.filter((p) => {
        return p !== port
      })

      switch(newState.brush){
        case 'U':
          newState.vlans[newState.currentVlan].untagged.push(port)
          break;
        case 'T':
          newState.vlans[newState.currentVlan].tagged.push(port)
          break;
        case 'Tr':
          (Object.keys(newState.vlans) as any[]).forEach((vid) => {
            newState.vlans[vid].trunk.push(port)

            if(vid === '1'){
              newState.vlans[vid].untagged.push(port)
            }else{
              newState.vlans[vid].tagged.push(port)
            }
          })
          break;
      }
      break;
    case 'selectBrush':
      newState.brush = (payload as ReducerPayload['selectBrush']).brush
      break;
  }

  return newState
}

const initialConfig: Config = {
  brush: 'N',
  currentVlan: 1,
  vlans: {1: {
    number: 1,
    name: 'Default',
    untagged: [],
    tagged: [],
    trunk: []
  }},
  cabs: [
    {
      name: 'Main Cab',
      switches: [],
      key: uuidv4()
    }
  ],
  inspect: '',
  links: {},
  linkFrom: ''
}

const ConfigStateContext = createContext(initialConfig)
const ConfigDispatchContext = createContext<React.Dispatch<ConfigActions> | undefined>(undefined)

export const ConfigContext: React.FC = ({children}) => {
  const [state, dispatch] = useReducer(configReducer, initialConfig)

  return <ConfigStateContext.Provider value={state}>
    <ConfigDispatchContext.Provider value={dispatch}>
      {children}
    </ConfigDispatchContext.Provider>
  </ConfigStateContext.Provider>
}

export const useConfig = (): Config & {dataFromPort: (port: string) => {cab: Cab, sw: Switch, port: string}} => {
  const config = useContext(ConfigStateContext)

  if(!config){
    throw new Error('`useConfig` can only be called in a child of <ConfigContext />')
  }

  const dataFromPort = (portName: string) => {
    const [cabKey, swKey, port] = portName.split('#')

    const cab = config.cabs.reduce((c, a) => {
      return (a.key === cabKey ? a : c)
    })

    const sw = cab.switches.reduce((s, w) => {
      return (w.key === swKey ? w : s)
    })

    return {cab, sw, port}
  }

  return {...config, dataFromPort}
}

const dispatchFunction = <T extends keyof ReducerPayload>(action: T, dispatch: React.Dispatch<ReducerAction<T>>) => {
  return (payload: ReducerPayload[T]) => {
    dispatch({
      action,
      payload
    })
  }
}

export const useConfigMutations = () => {
  const dispatch = useContext(ConfigDispatchContext)

  if(!dispatch){
    throw new Error('`useConfigMutations` can only be called in a child of <ConfigContext />')
  }

  const addCab = dispatchFunction<'addCab'>('addCab', dispatch)
  const removeCab = dispatchFunction<'removeCab'>('removeCab', dispatch)
  const addVlan = dispatchFunction<'addVlan'>('addVlan', dispatch)
  const removeVlan = dispatchFunction<'removeVlan'>('removeVlan', dispatch)
  const addSwitch = dispatchFunction<'addSwitch'>('addSwitch', dispatch)
  const setActiveVlan = dispatchFunction<'setActiveVlan'>('setActiveVlan', dispatch)
  const brushPort = dispatchFunction<'brushPort'>('brushPort', dispatch)
  const selectBrush = dispatchFunction<'selectBrush'>('selectBrush', dispatch)

  return {
    addCab,
    removeCab,
    addVlan,
    removeVlan,
    addSwitch,
    setActiveVlan,
    brushPort,
    selectBrush
  }
}