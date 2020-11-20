import { MutationTree } from 'vuex'
import { State, User } from './state'
import Model from '@/assets/js/class/Model'
import View, { ViewType } from '@/assets/js/class/View'

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

  'SET_MODEL' (state, data: any) {
    state.model = new Model(data)
  },

  'SET_VIEWS' (state, data) {
    const views = {} as {[key in ViewType]: View}
    for(let key in data) {
      views[key as ViewType] = new View(data[key])
    }
    state.views = views
  }
}

export default mutations