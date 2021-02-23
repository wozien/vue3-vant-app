<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      :clickable="!readonly"
      :is-link="!readonly"
      readonly
      center
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()

    const { type, string, placeholder, value, rawValue, curRecord } = useFieldCommon(props, store)

    return {
      type,
      string,
      placeholder,
      value,
      rawValue,
      curRecord
    }
  }
})
</script>

<style scoped></style>