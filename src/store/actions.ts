import { ActionTree } from 'vuex'
import { State } from './state'
import { fetchUserInfo } from '@/api/user'

const actions: ActionTree<State, State> = {
  async setUserInfo({ commit }) {
    const res = await fetchUserInfo()
    commit('SET_USER', res.data)
  }
}

export default actions