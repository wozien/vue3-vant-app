<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="value"
      :required="isRequired"
      :clickable="!isReadonly"
      :is-link="!isReadonly"
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
    const { string, placeholder, type, value, isReadonly, isRequired, setValue } = useFieldCommon(props, store)
    const state = reactive({
      showPicker: false,
      columns: [] as string[]
    })

    const onOpen = () => {
      if(isReadonly.value) return
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
      type,
      value,
      isReadonly,
      isRequired,
      ...toRefs(state),
      onOpen,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped></style>