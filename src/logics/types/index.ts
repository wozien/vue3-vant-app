import Action from '../class/Action'
import ListRecord from '../class/ListRecord'
import App from '../class/App'
import { default as Model, Fields } from '../class/Model'
import { default as View, ViewType, ViewButton } from '../class/View'
import { default as Field, FieldsInfo, FieldInfo } from '../class/Field'
import { default as Item, StudioItem } from '../class/ViewItem'

// Domain
type DomainOpertor = '=' | '!=' | '>' | '<' | '>=' | '<='
type DomainContionOpt = '&' | '|'
type DomainCondition = [string, DomainOpertor, number | string]
export type DomainArr = Array<DomainContionOpt | DomainCondition>

// modifiers
export type ModifierKey = 'readonly' | 'required' | 'invisible' | 'column_invisible' | 'no_row_add'
export type Modifiers = {
  [key in ModifierKey]?: Boolean | DomainArr
}

export type {
  Fields,
  FieldInfo,
  FieldsInfo,
  ViewType,
  ViewButton,
  StudioItem,
  Action,
  App,
  ListRecord,
  Model,
  View,
  Field,
  Item
}
