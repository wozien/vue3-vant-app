import { ActionTree } from 'vuex'
import { State } from './state'
import { fetchUserInfo, fetchUserOrgs } from '@/api/user'
import { load } from '@/assets/js/class/DataPoint'

const actions: ActionTree<State, State> = {
  async setUserInfo({ commit }) {
    const res = await fetchUserInfo()
    commit('SET_USER', res.data)
  },
  
  async setOrgs({ commit }) {
    const res = await fetchUserOrgs()
    commit('SET_ORGS', res.data)
  },

  async loadRecord({ commit }, params: any) {
    params.type = params.type || 'record'
    const id = await load(params)
    commit('SET_CUR_RECORD', id)
  }
}

export default actions