<template>
  <div class="form-item-field'" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="value"
      :required="isRequired"
      :clickable="!isReadonly"
      :is-link="!isReadonly"
      readonly
      center
      @click="onOpenModal"
    />

    <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm">
      <div class="refer-selector">
        <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
        <div class="list-wrapper">
          <van-cell v-for="item in list" :key="item.id" :title="item.display_name" @click="active=item.id">
            <template #right-icon>
              <van-icon v-if="active === item.id" name="success"></van-icon>
            </template>
          </van-cell>
          <van-empty v-if="!list.length" description="暂无数据"></van-empty>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, Ref, computed, watch } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { fetchMany2OneData } from '@/api/record'
import { Toast } from 'vant'
import { getDomain } from '@/assets/js/class/DataPoint'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { string, placeholder, type, value, isReadonly, isRequired, curRecord, setValue } = useFieldCommon(props, store)
    const { state, onOpenModal } = useModal(props, curRecord)

    const onConfirm = (cb: Function) => {
      if(!state.active) {
        Toast('请选择数据')
        cb(true)
        return
      }
      const item = state.list.find(item => item.id == state.active)
      if(item) {
        value.value = item.display_name
        state.active = 0
        cb()

        // notify change
        setValue(item)
      }
    }

    return {
      string,
      placeholder,
      type,
      value,
      isReadonly,
      isRequired,
      ...toRefs(state),
      onOpenModal,
      onConfirm
    }
  }
})

function useModal(props: any, curRecord: Ref<any>) {
  const state = reactive({
    showModal: false,
    searchValue: '',
    active: 0,
    list: [] as {id:number, display_name: string}[]
  })

  const domain = computed(() => {
    return curRecord && getDomain(curRecord.value.id, { fieldName: props.field?.name })
  })

  const onOpenModal = async () => {
    if(props.mode === 'readonly') return;
    await loadData()
    state.showModal = true
  }

  const loadData = async () => {
    const res = await fetchMany2OneData(props.field?.relation, state.searchValue, domain.value)
    if(res.ret === 0) {
      state.list = res.data.map((item: any) => {
        return {
          id: item[0],
          display_name: item[1]
        }
      })
    }
  }

  watch(() => state.searchValue, () => {
    loadData()
  })

  return {
    state,
    onOpenModal
  }
}
</script>

<style lang="less" scoped>
.refer-selector {
  height: 100%;
  .list-wrapper {
    height: calc(100% - 54px);
    overflow-y: auto;
  }
}
</style>