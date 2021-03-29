<template>
  <van-field
    :label="string" 
    :placeholder="placeholder" 
    v-model="value"
    :required="isRequired"
    :clickable="true"
    :is-link="true"
    readonly
    center
    @click="onOpenModal"
  />

  <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm">
    <div class="m2o-selector">
      <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
      <div class="list-wrapper">
        <van-tree-select 
          :active-id="activeId"
          v-model:main-active-index="mainActiveId"
          :items="items"
          height="100%"
          @click-item="onClickItem"
          @click-nav="onClickNav"
        />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch, watchEffect, computed } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { fetchMany2OneData } from '@/api/record'
import { getDomain } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { 
      string, placeholder, value, rawValue, isRequired, curRecord, setValue 
    } = useFieldCommon(props)
    const { state, onOpenModal } = useModal(props)
    const { toast } = useToast()

    const domain = computed(() => {
      return  curRecord && getDomain(curRecord.value.id, { fieldName: props.field?.name })
    })

    const onConfirm = async (cb: Fn) => {
      const curModel = state.models[state.mainActiveId]
      if(curModel) {
        if(state.activeId !== -1) {
          state.items.forEach(async (item: any) => {
            if(item.model === curModel.model) {
              const select = item.children.find((row: any) => row.id === state.activeId)
              await setValue({
                model: curModel.model,
                id: select.id,
                display_name: select.text
              })
              return false
            }
          })
        } else {
          await setValue(false)
        }
      }
      cb()
    }

    const loadData = async () => {
      const activeModel = state.models[state.mainActiveId]
      toast.loading()
      const res = await fetchMany2OneData(activeModel.model as string, state.searchValue, domain.value)
      state.items.forEach((item: any) => {
        if(item.model === activeModel.model) {
          item.children = res.data.map((row: any) => {
            const [id, name] = row
            return {
              text: name,
              id
            }
          })
        }
      })
      toast.clear()
    }

    const onClickItem = (item: any) => {
      state.activeId = state.activeId === item.id ? -1 : item.id
    }

    const onClickNav = () => {
      state.activeId = -1
      loadData()
    }

    watch(() => state.showModal, (val) => {
      if(!val) return
      if(rawValue.value) {
        const { model, res_id } = rawValue.value as any
        state.activeId = res_id
        if(model) {
          const index = state.models.findIndex((item: any) => item.model === model)
          state.mainActiveId = index === -1 ? 0 : index
        } 
      } else {
        state.activeId = -1
        state.mainActiveId = 0
      }

      loadData()
    })

    watch(() => state.searchValue, () => loadData())

    return {
      string,
      placeholder,
      value,
      rawValue,
      isRequired,
      ...toRefs(state),
      onOpenModal,
      onConfirm,
      onClickItem,
      onClickNav
    }
  }
})

function useModal(props: any) {
  const state = reactive({
    showModal: false,
    searchValue: '',
    models: [] as any[],
    activeId: -1,
    mainActiveId: 0,
    items: [] as any[]
  })

  const onOpenModal = async () => {
    if(props.mode === 'readonly') return
    state.showModal = true
  }

  watchEffect(() => {
    if(props.field?.selection?.length) {
      props.field.selection.forEach(([model, name]: [string, string]) => {
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