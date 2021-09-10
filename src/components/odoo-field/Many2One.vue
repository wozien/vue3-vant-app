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

  <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm" @cancel="onCancel">
    <div class="m2o-selector">
      <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
      <div class="list-wrapper">
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.display_name"
          @click="onClickItem(item.id)"
        >
          <template #right-icon>
            <van-icon v-if="active === item.id" name="success"></van-icon>
          </template>
        </van-cell>
        <van-empty v-if="!list.length" description="暂无数据"></van-empty>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, Ref, computed, watch } from 'vue'
import useFieldCommon, { fieldCommonProps, FieldCommonPropsType } from '@/hooks/component/useField'
import { fetchMany2OneData } from '@/api/record'
import { getDomain, DataPoint, getRecordData } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'
import { isObject } from 'lodash-es'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { string, placeholder, value, rawValue, isRequired, curRecord, setValue, widget } =
      useFieldCommon(props)
    const { state, onOpenModal } = useModal(props, curRecord)

    const onClickItem = (id: number) => {
      state.active = state.active === id ? 0 : id
    }

    const onConfirm = async (cb: Fn) => {
      const item = state.list.find(item => item.id == state.active)
      if (item) {
        // notify change
        await setValue(widget.value === 'pschar2one' ? item.display_name : item)
      } else {
        await setValue(false)
      }
      cb()
    }

    const onCancel = () => {
      if (rawValue.value) {
        state.active = (rawValue.value as any).res_id
      }
    }

    watch(
      rawValue,
      (val: any) => {
        if (val) {
          state.active = typeof val === 'string' ? val : val.res_id
        } else {
          state.active = 0
        }
      },
      { immediate: true }
    )

    return {
      string,
      placeholder,
      value,
      isRequired,
      ...toRefs(state),
      onOpenModal,
      onClickItem,
      onConfirm,
      onCancel
    }
  }
})

function getFileNames(curRecord: DataPoint, fieldKeys: string[]) {
  const fieldsInfo = curRecord.fieldsInfo
  return Object.keys(fieldsInfo).filter(fieldName => {
    return (
      fieldsInfo[fieldName].fieldKey && fieldKeys.includes(fieldsInfo[fieldName].fieldKey as string)
    )
  })
}

function useModal({ field, item }: FieldCommonPropsType, curRecord: Ref<any>) {
  const { toast } = useToast()
  const state = reactive({
    showModal: false,
    searchValue: '',
    active: 0,
    list: [] as { id: number; display_name: string }[]
  })

  const domain = computed(() => {
    return curRecord && getDomain(curRecord.value.id, { fieldName: field.name })
  })

  const onOpenModal = async () => {
    state.showModal = true
    await loadData()
  }

  const loadData = async () => {
    let relation,
      context = Object.create(null)
    if (item.widget === 'pschar2one') {
      relation = 'ps.char2one.model'
      const depend_field = item.attrs.depend_field
      if (depend_field) {
        const dpField = (curRecord.value as DataPoint).fieldsInfo[depend_field]
        if (dpField) {
          context.depend_field_info = {
            relation: dpField.relation,
            type: dpField.type
          }
          context.module = item.attrs.module
          context.disable_state_filter = true
        }
      }
    } else {
      relation = field.relation as string
      // 筛选函数
      let { depend_fields, depend_method } = item.attrs
      if (item.attrs.method && item.attrs.method.checked) {
        depend_fields = item.attrs.method.depend_fields
        depend_method = item.attrs.method.depend_method
      }

      if (depend_fields) {
        const fieldNames = Array.isArray(depend_fields)
          ? getFileNames(curRecord.value, depend_fields)
          : depend_fields.split(',')
        const dependObj = {
          fields: Object.create(null),
          methods: depend_method || '',
          relation_model: relation
        }
        fieldNames.forEach((fieldName: string) => {
          const data = getRecordData(curRecord.value.id, fieldName)
          dependObj.fields[fieldName] = isObject(data) && data ? (data as any).data : data
        })
        context.dependObj = dependObj
        context.field_name = field.name
      }
    }

    toast.loading()
    const res = await fetchMany2OneData(
      relation,
      curRecord.value.model,
      state.searchValue,
      domain.value,
      context
    )
    if (res.ret === 0) {
      state.list = res.data.map((item: any) => {
        return {
          id: item[0],
          display_name: item[1]
        }
      })
    }
    toast.clear()
  }

  watch(
    () => state.searchValue,
    () => {
      loadData()
    }
  )

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
