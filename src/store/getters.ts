import { GetterTree } from 'vuex'
import { State } from './state'
import { get, DataPointState } from '@/assets/js/class/DataPoint'

const getters: GetterTree<State, State> = {
  curRecord(state): DataPointState | null {
    return get(state.curRecordId)
  }
}

export default getters