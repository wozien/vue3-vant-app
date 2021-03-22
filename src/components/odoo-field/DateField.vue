<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="value"
      :required="isRequired"
      :clickable="!isReadonly"
      :right-icon="!isReadonly ? 'notes-o' : ''"
      readonly
      center
      @click="onOpen"
    />

    <van-popup v-model:show="showPicker" position="bottom" teleport="body" round>
      <van-datetime-picker 
        v-model="dateValue" 
        :type="type" 
        :formatter="formatter"
        @cancel="showPicker = false" 
        @confirm="onConfirm"/>
    </van-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { string, placeholder, type, value, rawValue, isReadonly, isRequired, setValue } = useFieldCommon(props, store)
    const state = reactive({
      showPicker: false,
      columns: [] as string[],
      dateValue: new Date()
    })

    const onOpen = () => {
      if(isReadonly.value) return
      state.showPicker = true
    }

    const onConfirm = (value: Date) => {
      setValue(value)
      state.showPicker = false
    }

    const formatter = (colType: string, val: string) => {
      if(type.value === 'date') {
        switch(colType) {
          case 'year':  val += '年'; break
          case 'month': val += '月'; break
          case 'day': val += '日'; break
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
      string,
      placeholder,
      type,
      value,
      rawValue,
      isReadonly,
      isRequired,
      ...toRefs(state),
      formatter,
      onOpen,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped></style>