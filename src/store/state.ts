import Model from '@/assets/js/class/Model'
import View, { ViewType } from '@/assets/js/class/View'

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
  model?: Model;
  views?: { [key in ViewType]: View }
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
  orgs: []
}

export default state