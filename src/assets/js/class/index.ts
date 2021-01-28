
import { DomainArr } from './Domain'

export type ModifierKey = 'readonly' | 'required' | 'invisible' | 'column_invisible'
export type Modifiers = {
  [key in ModifierKey]?: Boolean | DomainArr
}

export * from './Action'
export * from './Model'
export * from './View'
export * from './Field'
export * from './Item'
export * from './Domain'
export * from './App'
export * from './Record'
export * from './DataPoint'

export { default as Action } from './Action'
export { default as Model } from './Model'
export { default as View } from './View'
export { default as Field } from './Field'
export { default as Item } from './Item'
export { default as Domain } from './Domain'
export { default as App } from './App'
export { default as Record } from './Record'