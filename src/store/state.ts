
interface User {
  avatar: string;
  nickname: string;
  phone: string;
  companyName?: string;
}

// define your typings for the store state
export interface State {
  user: User;
}

const state: State = {
  user: {
    avatar: '',
    nickname: '',
    phone: ''
  }
}

export default state