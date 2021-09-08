import { ActionTree } from 'vuex'
import { State } from './state'
import { fetchUserInfo, fetchUserOrgs } from '@/api/user'
import { fetchPrecision } from '@/api/system'

const actions: ActionTree<State, State> = {
  async setUserInfo({ commit }) {
    const res = await fetchUserInfo()
    commit('SET_USER', res.data)
  },

  async setPrecision({ commit }) {
    const res = await fetchPrecision()
    commit('SET_PRECISION', res.data)
  },

  async setOrgs({ commit }) {
    const res = await fetchUserOrgs()
    commit('SET_ORGS', res.data)
  }
}

export default actions
