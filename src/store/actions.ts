import { ActionTree } from 'vuex'
import { State } from './state'
import { fetchUserInfo, fetchUserOrgs } from '@/api/user'
import { fetchAppModel, fetchAppView, fetchAction } from '@/api/app'

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
  },

  async setAction({ commit }, actionId) {
    const res = await fetchAction(actionId)
    commit('SET_ACTION', res.data)
  },

  async loadApp({ dispatch }, { appId, actionId }) {
    await Promise.all([
      dispatch('setAction', actionId),
      dispatch('setModel', { appId, actionId }),
      dispatch('setViews', { appId, actionId })
    ])
  }
}

export default actions