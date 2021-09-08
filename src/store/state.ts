import type { DataPoint, DataPointId } from '@/logics/types/dataPoint'
import { localData } from '@/logics/core/dataPoint'
interface Company {
  dbName: string
  name: string
}

export interface Org {
  id: number
  name: string
}

interface CurrencyPrecision {
  id: number
  price_precision: number
  amount_precision: number
}

interface UnitPrecision {
  id: number
  qty_precision: number
}

export interface Precision {
  'mdm.currency': CurrencyPrecision[]
  'mdm.unit': UnitPrecision[]
}

export interface User {
  avatar: string
  nickname: string
  phone: string
  company: Company
  context: Recordable
  precision: Precision
}

// define your typings for the store state
export interface State {
  user: User
  orgs: Org[]
  curOrg?: Org
  localData: {
    [key: string]: DataPoint
  }
  curRecordId: DataPointId
  recordToken: string
}

const state: State = {
  user: {
    avatar: '',
    nickname: '',
    phone: '',
    company: {
      dbName: '',
      name: ''
    },
    precision: {
      'mdm.currency': [],
      'mdm.unit': []
    },
    context: {
      lang: 'zh_CN'
    }
  },
  orgs: [],
  localData: localData,
  curRecordId: '',
  recordToken: 'QadfRnvl8Tkb'
}

export default state
