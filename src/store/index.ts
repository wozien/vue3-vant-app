import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import actions from './actions'
import mutations from './mutations'

interface User {
  avatar: string;
  nickname: string;
  phone: string;
}

// define your typings for the store state
export interface State {
  user: User;
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

const store = createStore<State>({
  state () {
    return {
      user: {
        avatar: '',
        nickname: '',
        phone: ''
      }
    }
  },
  actions,
  mutations
})

export function useStore() {
  return baseUseStore(key)
}

export default store