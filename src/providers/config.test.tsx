import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {ConfigContext, useConfig, useConfigMutations} from './config'

describe('Config Provider', () => {
  it('should provide config', () => {
    const TestComponent: React.FC = () => {
      const {cabs, vlans} = useConfig()
      const {addCab, addVlan} = useConfigMutations()

      return <>
        <p>
          There is {cabs.length} Cabs.
        </p>
        <p>
          There are {Object.keys(vlans).length} VLANS.
        </p>
        <button onClick={() => {
          addCab({name: 'test'})
        }}>Add Cab</button>
        <button onClick={() => {
          addVlan({name: 'Test', number: 10})
        }}>Add VLAN</button>
      </>
    }

    const {getByText} = render(<ConfigContext><TestComponent /></ConfigContext>)
    
    expect(getByText(/^There is/)).toHaveTextContent('There is 0 Cabs.')

    fireEvent.click(getByText(/Add Cab/))

    expect(getByText(/^There is/)).toHaveTextContent('There is 1 Cabs.')

    expect(getByText(/^There are/)).toHaveTextContent('There are 1 VLANS')

    fireEvent.click(getByText(/Add VLAN/))

    expect(getByText(/^There are/)).toHaveTextContent('There are 2 VLANS')
  })
})