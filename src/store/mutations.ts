import { MutationTree } from 'vuex'
import { State } from './state'

const mutations: MutationTree<State> = {
  'SET_USER' (state, data) {
    const user = {
      avatar: data.user_avatar,
      nickname: data.user_info?.name,
      phone: data.user_info?.phone_number,
    }

    Object.assign(state.user, user)
  },

  'SET_USER_COMPANY' (state, name: string) {
    state.user.companyName = name
  }
}

export default mutations