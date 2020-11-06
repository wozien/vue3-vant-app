import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import state, { State } from './state'
import actions from './actions'
import mutations from './mutations'

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

const store = createStore<State>({
  state () {
    return state
  },
  actions,
  mutations
})

export function useStore() {
  return baseUseStore(key)
}

export type VuexStore = typeof store

export default store