import { DataPoint, DataPointId, localData } from '@/assets/js/class'
interface Company {
  dbName: string;
  name: string;
}

export interface Org {
  id: number;
  name: string;
}

export interface User {
  avatar: string;
  nickname: string;
  phone: string;
  company: Company;
}

// define your typings for the store state
export interface State {
  user: User;
  orgs: Org[];
  curOrg?: Org;
  localData: {
    [key: string]: DataPoint
  },
  curRecordId: DataPointId
}

const state: State = {
  user: {
    avatar: '',
    nickname: '',
    phone: '',
    company: {
      dbName: '',
      name: ''
    }
  },
  orgs: [],
  localData: localData,
  curRecordId: ''
}

export default state