import { MutationTree } from 'vuex'
import { State, User } from './state'

const mutations: MutationTree<State> = {
  'SET_USER' (state, data) {
    const { company } = data
    const user: User = {
      avatar: data.user_avatar,
      nickname: data.name,
      phone: data.phone_number,
      company: {
        dbName: company?.db_name,
        name: company?.company_name
      }
    }
    state.user = user
  },

  'SET_ORGS' (state, data: {id: number; name: string;}[]) {
    state.orgs = data
    if(data.length) {
      state.curOrg = data[0]
    }
  },

  'SET_CUR_RECORD' (state, id: string) {
    state.curRecordId = id
  }
}

export default mutations