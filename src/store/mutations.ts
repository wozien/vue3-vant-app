import { MutationTree } from 'vuex'
import { State } from './index'

const mutations: MutationTree<State> = {
  'SET_USER' (state, data) {
    const user = {
      avatar: data.user_avatar,
      nickname: data.user_info?.name,
      phone: data.user_info?.phone_number
    }

    state.user = user
  }
}

export default mutations