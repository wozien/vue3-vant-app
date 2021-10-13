<template>
  <van-field
    :label="string"
    :placeholder="placeholder"
    v-model="value"
    :required="isRequired"
    :clickable="true"
    right-icon="notes-o"
    readonly
    center
    @click="onOpen"
  />

  <van-popup v-model:show="showPicker" position="bottom" teleport="body" round>
    <van-datetime-picker
      v-model="dateValue"
      :type="type"
      :formatter="formatter"
      :min-date="minDate"
      @cancel="showPicker = false"
      @confirm="onConfirm"
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
    const { string, placeholder, type, value, rawValue, isRequired, setValue } =
      useFieldCommon(props)
    const state = reactive({
      showPicker: false,
      columns: [] as string[],
      dateValue: new Date()
    })

    const onOpen = () => {
      state.showPicker = true
    }

    const onConfirm = (value: Date) => {
      setValue(value)
      state.showPicker = false
    }

    const formatter = (colType: string, val: string) => {
      if (type.value === 'date') {
        switch (colType) {
          case 'year':
            val += '年'
            break
          case 'month':
            val += '月'
            break
          case 'day':
            val += '日'
            break
          // case 'hour': val += '时'; break
          // case 'minute': val += '分'; break
        }
      }
      return val
    }

    watchEffect(() => {
      state.dateValue = (rawValue.value as Date) || new Date()
    })

    return {
      type,
      string,
      placeholder,
      value,
      rawValue,
      isRequired,
      minDate: new Date('1950-01-01'),
      ...toRefs(state),
      formatter,
      onOpen,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped></style>
