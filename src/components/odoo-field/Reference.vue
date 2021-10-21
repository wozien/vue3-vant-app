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
import { defineComponent, reactive, toRefs, watch, computed, onBeforeMount } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { fetchMany2OneData, fetchSelection } from '@/api/record'
import { getDomain, getContext } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'
import Domain from '@/logics/odoo/Domain'
import pyUtils from '@/logics/odoo/py_utils'

const arrayToString = Domain.prototype.arrayToString
const stringToArray = Domain.prototype.stringToArray

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const state = reactive({
      showModal: false,
      searchValue: '',
      models: [] as any[],
      activeId: -1,
      mainActiveId: 0,
      items: [] as any[]
    })
    const { string, placeholder, value, rawValue, isRequired, curRecord, setValue } =
      useFieldCommon(props)
    const { toast } = useToast()
    const domain = computed(() => {
      if (curRecord.value) {
        const commonDomain = getDomain(curRecord.value.id, { fieldName: props.field?.name })
        return commonDomain
      }
      return []
    })
    const selectionDomain = computed(() => {
      const domain = props.item?.options.selection_domain
      return (
        curRecord.value &&
        getDomain(curRecord.value.id, { fieldName: props.field?.name, domain: domain || [] })
      )
    })
    const context = computed(() => {
      return (
        curRecord &&
        getContext(curRecord.value.id, {
          viewType: curRecord.value.viewType,
          fieldName: props.field.name
        })
      )
    })

    const onConfirm = async (cb: Fn) => {
      const curModel = state.models[state.mainActiveId]
      if (curModel) {
        if (state.activeId !== -1) {
          state.items.forEach(async (item: any) => {
            if (item.model === curModel.model) {
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
      const activeModel = state.models[state.mainActiveId].model
      let combineDomain = domain.value
      let specialDomain = props.item?.options.domain
      if (specialDomain && specialDomain[activeModel]) {
        specialDomain = getDomain(curRecord.value.id, {
          fieldName: props.field?.name,
          domain: specialDomain[activeModel] || []
        })
        // 合并公用和私有的domain
        combineDomain = stringToArray(
          pyUtils.assembleDomains(
            [arrayToString(domain.value), arrayToString(specialDomain)],
            'AND'
          )
        )
      }

      toast.loading()
      const res = await fetchMany2OneData(
        activeModel as string,
        '',
        state.searchValue,
        combineDomain,
        context.value
      )
      state.items.forEach((item: any) => {
        if (item.model === activeModel) {
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

    let params = ''
    const onOpenModal = async () => {
      if (props.mode === 'readonly') return
      const method = props.item.attrs.method

      if (method?.checked && curRecord.value) {
        const stringDomain = selectionDomain.value ? JSON.stringify(selectionDomain.value) : ''

        // 重复的domain不发请求了
        if (stringDomain !== params) {
          const funcName = method.value
          const res = await fetchSelection(
            funcName,
            curRecord.value.model,
            selectionDomain.value,
            context.value
          )
          if (res.ret === 0) {
            formatSelection(res.data)
            params = stringDomain
          }
        }
      }
      state.showModal = true
    }

    const formatSelection = (selection: any) => {
      state.models = []
      state.items = []
      selection.forEach(([model, name]: [string, string]) => {
        if (model && name) {
          state.models.push({ model, name })
          state.items.push({ text: name, model, children: [] })
        }
      })
    }

    watch(
      () => state.showModal,
      val => {
        if (!val) return
        if (rawValue.value) {
          const { model, res_id } = rawValue.value as any
          state.activeId = res_id
          if (model) {
            const index = state.models.findIndex((item: any) => item.model === model)
            state.mainActiveId = index === -1 ? 0 : index
          }
        } else {
          state.activeId = -1
          state.mainActiveId = 0
        }

        loadData()
      }
    )

    watch(
      () => state.searchValue,
      () => loadData()
    )

    onBeforeMount(() => {
      if (props.field?.selection?.length) {
        formatSelection(props.field.selection)
      }
    })

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
