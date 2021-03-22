import { MutationTree } from 'vuex'
import { State, User } from './state'
import { uuid } from '@/utils/tools'
import { rootID } from '@/logics/core/dataPoint'

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
      },
      context: data.context
    }
    state.user = user
  },

  'SET_ORGS' (state, data: {id: number; name: string;}[]) {
    state.orgs = data
    if(data && data.length) {
      state.curOrg = data[0]
    }
  },

  'SET_CUR_RECORD' (state, id: string) {
    state.curRecordId = id
  },

  'RESET_CUR_RECORD' (state) {
    rootID && (state.curRecordId = rootID)
  },

  'SET_RECORD_TOKEN' (state) {
    state.recordToken = uuid(12)
  }
}

export default mutations