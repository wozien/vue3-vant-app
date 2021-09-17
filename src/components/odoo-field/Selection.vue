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
    @click="onOpen"
  />

  <van-popup v-model:show="showPicker" position="bottom" teleport="body" round>
    <van-picker :columns="columns" @confirm="onConfirm" @cancel="showPicker = false" />
  </van-popup>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect, computed } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { fetchSelection } from '@/api/record'
import { getDomain, getContext } from '@/logics/core/dataPoint'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    let params = ''
    const { string, placeholder, value, isRequired, setValue, curRecord } = useFieldCommon(props)
    const state = reactive({
      showPicker: false,
      columns: [] as string[]
    })

    const domain = computed(() => {
      return curRecord.value && getDomain(curRecord.value.id, { fieldName: props.field.name })
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

    const onOpen = async () => {
      // 加载数据包
      const method = props.item.attrs.method

      if (method?.checked && curRecord.value) {
        const stringDomain = domain.value ? JSON.stringify(domain.value) : ''

        // 重复的domain不发请求了
        if (stringDomain !== params) {
          const funcName = method.value
          const res = await fetchSelection(
            funcName,
            curRecord.value.model,
            domain.value,
            context.value
          )
          state.columns = res.data.map((item: any) => item[1])
          params = stringDomain
        }
      }
      state.showPicker = true
    }

    const onConfirm = (value: string) => {
      const item = (props.field?.selection || []).find((item: any) => item[1] === value)
      item && setValue(item[0])
      state.showPicker = false
    }

    watchEffect(() => {
      if (props.field?.selection) {
        state.columns = props.field?.selection.map((item: any) => item[1])
      }
    })

    return {
      string,
      placeholder,
      value,
      isRequired,
      ...toRefs(state),
      onOpen,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped></style>
