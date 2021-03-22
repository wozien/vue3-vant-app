<template>
  <div class="switcher-wrapper">
    <div class="button">
      <van-icon name="arrow-left" @click="onLeft"></van-icon>
      <span> {{ current + 1 }} / {{ total }}</span>
      <van-icon name="arrow" @click="onRight"></van-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watchEffect, watch } from 'vue'
import { useStore } from '@/store'
import { get } from '@/logics/core/dataPoint'

export default defineComponent({
  setup() {
    const store = useStore()

    const state = reactive({
      recordIds: [] as any[],
      current: 0,
      total: 0
    })
    const curRecord = computed(() => store.getters.curRecord)

    const onLeft = () => {
      state.current -= 1
      if(state.current < 0) state.current = state.recordIds.length - 1
    }

    const onRight = () => {
      state.current += 1
      if(state.current === state.recordIds.length) state.current = 0
    }

    watchEffect(() => {
      if(curRecord.value) {
        const recordID = curRecord.value.parentId
        const list = recordID && get(recordID)
        if(list) {
          state.recordIds = list.data.map((record: any) => record.id)
          state.total = state.recordIds?.length || 0
          state.current = state.recordIds.findIndex((id: string) => id === curRecord.value.id)
        }
      }
    })

    watch(() => state.current, (val) => {
      const curRecordId = state.recordIds[val]
      curRecordId && store.commit('SET_CUR_RECORD', curRecordId)
    })

    return {
      ...toRefs(state),
      onLeft,
      onRight
    }
  }
})
</script>

<style lang="less" scoped>
.switcher-wrapper {
  height: 50px;
  overflow: hidden;
  .button {
    background: #fff;
    border-radius: 20px;
    display: flex;
    align-items: center;
    padding: 8px;
    margin: 0 auto;
    width: 120px;
    font-size: 13px;
    box-shadow: 0px 2px 8px 0px #ededed;
    color: @text-color-light-1;
    margin-top: 8px;

    > span {
      flex: 1;
      text-align: center;
    }
  }
}
</style>