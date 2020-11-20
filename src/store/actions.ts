import { ActionTree } from 'vuex'
import { State } from './state'
import { fetchUserInfo, fetchUserOrgs } from '@/api/user'
import { fetchAppModel, fetchAppView } from '@/api/app'

const actions: ActionTree<State, State> = {
  async setUserInfo({ commit }) {
    const res = await fetchUserInfo()
    commit('SET_USER', res.data)
  },
  
  async setOrgs({ commit }) {
    const res = await fetchUserOrgs()
    commit('SET_ORGS', res.data)
  },

  async setModel({ commit }, { appId, actionId }) {
    const res = await fetchAppModel(appId, actionId)
    commit('SET_MODEL', res.data)
  },

  async setViews({ commit }, { appId, actionId }) {
    const res = await fetchAppView(appId, actionId)
    commit('SET_VIEWS', res.data)
  }
}

export default actions