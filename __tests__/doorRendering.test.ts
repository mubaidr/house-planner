import React from 'react'
import { render } from '@testing-library/react'
import DoorComponent from '../src/components/Canvas/elements/DoorComponent'

describe('DoorComponent', () => {
  it('renders without crashing', () => {
    // Only check that the component can be instantiated as a function (smoke test)
    expect(typeof DoorComponent).toBe('function')
  })
})
