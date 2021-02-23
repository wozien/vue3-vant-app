<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="value"
      :clickable="!readonly"
      :is-link="!readonly"
      readonly
      center
      @click="onOpenModal"
    />

    <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm">
      <div class="m2o-selector">
        <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
        <div class="list-wrapper">
          <van-tree-select 
            v-model:active-id="activeId"
            v-model:main-active-index="mainActiveId"
            :items="items"
            height="100%"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch, watchEffect, computed } from 'vue'
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
    const { string, placeholder, type, value, rawValue, setValue, curRecord } = useFieldCommon(props, store)
    const { state, onOpenModal } = useModal(props)

    const domain = computed(() => {
    return  curRecord && getDomain(curRecord.value.id, { fieldName: props.field?.name })
  })

    const onConfirm = (cb: Function) => {
      if(state.activeId === -1) {
        Toast('请选择数据')
        cb(true); return
      }

      const curModel = state.models[state.mainActiveId]
      if(curModel) {
        state.items.forEach((item: any) => {
          if(item.text === curModel.name) {
            const select = item.children.find((row: any) => row.id === state.activeId)
            setValue({
              model: curModel.model,
              id: select.id,
              display_name: select.text
            })
            return false
          }
        })
      }
      cb()
    }

    const loadData = async (model?: string) => {
      if(!model) {
        const activeModel = state.models[state.mainActiveId]
        model = activeModel.model
      }
      const res = await fetchMany2OneData(model as string, state.searchValue, domain.value)
      state.items.forEach((item: any) => {
        if(item.model === model) {
          item.children = res.data.map((row: any) => {
            const [id, name] = row
            return {
              text: name,
              id
            }
          })
        }
      })
    }

    watch(rawValue, val => {
      const { model } = val as any
      if(model) {
        const index = state.models.findIndex((item: any) => item.model === model)
        state.mainActiveId = index
      }
    })

    watch(() => state.mainActiveId, async (val) => {
      const activeModel = state.models[val]
      state.activeId = -1
      if(activeModel) {
        await loadData(activeModel.model)
      }
    })

    watch(() => state.searchValue, () => loadData())

    return {
      string,
      placeholder,
      type,
      value,
      rawValue,
      ...toRefs(state),
      onOpenModal,
      onConfirm
    }
  }
})

function useModal(props: any) {
  const state = reactive({
    showModal: false,
    searchValue: '',
    models: [] as any[],
    activeId: -1,
    mainActiveId: -1,
    items: [] as any[]
  })

  const onOpenModal = async () => {
    if(props.readonly) return
    state.showModal = true
  }

  watchEffect(() => {
    if(props.field?.selection?.length) {
      props.field.selection.forEach((row: any) => {
        const [model, name] = row
        if(model && name) {
          state.models.push({ model, name })
          state.items.push({ text: name, model, children: [] })
        }
      })
    }
  })

  return {
    state,
    onOpenModal
  }
}
</script>

<style lang="less" scoped>
.m2o-selector {
  height: 100%;
  .list-wrapper {
    height: calc(100% - 54px);
    overflow-y: auto;
  }
}
</style>