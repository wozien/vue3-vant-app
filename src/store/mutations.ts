import { MutationTree } from 'vuex'
import { State, User } from './state'
import { uuid } from '@/assets/js/utils/tools'
import { rootID } from '@/assets/js/class/DataPoint'

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
    if(data && data.length) {
      state.curOrg = data[0]
    }
  },

  'SET_CUR_RECORD' (state, id: string) {
    state.curRecordId = id
  },

  'RESET_CUR_RECORD' (state) {
    // 重置当前curRecordId为表头的，在表体回到表头的场景将会调用
    // 但是需要排除从列表进入表头, 在列表的时候curRecordId为空
    if(state.curRecordId) {
      state.curRecordId = rootID
    }
  },

  'SET_RECORD_TOKEN' (state) {
    state.recordToken = uuid(12)
  }
}

export default mutations