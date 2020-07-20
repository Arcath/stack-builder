import React, {useCallback} from 'react'
import styled from '@emotion/styled'
import {useForm} from 'react-hook-use-form'
import {useDropzone} from 'react-dropzone'

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
    <Data />
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
  const {inspect, links, dataFromPort, brush} = useConfig()
  const {selectBrush, brushPort} = useConfigMutations()

  if(inspect === ''){
    return <></>
  }

  const {trunk, cab, sw, port, untagged, tagged} = dataFromPort(inspect)

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
    <p>Untagged: {untagged.join(', ')}</p>
    <p>Tagged: {tagged.join(', ')}</p>
    {linked ? <p onClick={() => {
      if(brush !== 'I'){
        selectBrush({brush: 'I'})
      }

      brushPort({port: links[inspect]})
    }}>Linked to {link.cab.name} - {link.sw.name} - {link.port}</p> : ''}
  </div>
}

const Data: React.FC = () => {
  const {cf} = useConfig()
  const {reset, set} = useConfigMutations()

  return <div>
    <h3>Data</h3>
    <Brush active={false} onClick={() => {
      reset({})
    }}>Clear Data</Brush>
    <Brush active={false} onClick={() => {
      const json = JSON.stringify(cf)
      const blob = new Blob([json], {type: 'text/json'})

      const a = document.createElement('a')
      a.download = 'stack.json'
      a.href = URL.createObjectURL(blob)
      a.dataset.downloadurl = ['json', a.download, a.href].join(':')
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setTimeout(() => {
        URL.revokeObjectURL(a.href)
      }, 1500)
    }}>Download</Brush>
    <Dropzone onComplete={(json) => {
      set({json})
    }}>
      <Brush active={false}>Upload</Brush>
    </Dropzone>
  </div>
}

interface DropzoneProps{
  onComplete: (json: string) => void
}

export const Dropzone: React.FC<DropzoneProps> = ({onComplete, children}) => {
  const onDrop = useCallback(acceptedFiles => {
    const fileReader = new FileReader()
    const fileToRead = acceptedFiles[0]

    fileReader.readAsBinaryString(fileToRead)

    fileReader.onload = (event: any) => {
      onComplete(event.target.result)
    }
  }, [onComplete])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop file here</p> :
          children
      }
    </div>
  )
}