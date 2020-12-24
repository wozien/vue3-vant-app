import { GetterTree } from 'vuex'
import { State } from './state'
import { get, DataPointState } from '@/assets/js/class/DataPoint'

const getters: GetterTree<State, State> = {
  curRecord(state): DataPointState | null {
    if(state.curRecordId && state.recordToken) {
      return get(state.curRecordId)
    }
    return null
  }
}

export default getters