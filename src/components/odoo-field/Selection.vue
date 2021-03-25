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
    <van-picker
      :columns="columns"
      @confirm="onConfirm"
      @cancel="showPicker = false"
    />
  </van-popup>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { string, placeholder, value, isRequired, setValue } = useFieldCommon(props)
    const state = reactive({
      showPicker: false,
      columns: [] as string[]
    })

    const onOpen = () => {
      state.showPicker = true
    }

    const onConfirm = (value: string) => {
      const item = (props.field?.selection || []).find((item: any) => item[1] === value)
      item && setValue(item[0])
      state.showPicker = false
    }

    watchEffect(() => {
      if(props.field?.selection) {
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