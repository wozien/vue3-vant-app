
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