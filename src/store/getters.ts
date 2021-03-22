import { GetterTree } from 'vuex'
import { State } from './state'
import { DataPointState } from '@/logics/types/dataPoint'
import { get } from '@/logics/core/dataPoint'

const getters: GetterTree<State, State> = {
  curRecord(state): DataPointState | null {
    if(state.curRecordId && state.recordToken) {
      return get(state.curRecordId)
    }
    return null
  }
}

export default getters