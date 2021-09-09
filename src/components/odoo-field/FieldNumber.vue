<template>
  <van-field
    :label="string"
    :placeholder="placeholder"
    type="number"
    v-model="value"
    :required="isRequired"
    :readonly="isReadonly"
    @change="setValue(value)"
    clearable
    center
  />
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { getPrecision } from '@/utils'
import fieldUtils from '@/logics/core/fieldUtils'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { string, placeholder, value, rawValue, isRequired, setValue, curRecord, isReadonly } =
      useFieldCommon(props)

    const precision = computed(() => {
      if (!curRecord.value) return 2

      const field = curRecord.value.fieldsInfo[props.field.name]
      if (!field) return 2

      const precision = getPrecision(curRecord.value, field)
      if (precision !== undefined) return precision
      if ('digits' in props.field) return props.field.digits[1]
      return 2
    })

    watchEffect(() => {
      const field = props.field
      const fieldType = field.options?.relatedType || field.type
      value.value = (fieldUtils.format as any)[fieldType](rawValue.value, field, {
        precision: precision.value
      })
    })

    const isSet = () => {
      return !!value.value
    }

    return {
      string,
      placeholder,
      value,
      isRequired,
      isReadonly,
      isSet,
      setValue
    }
  }
})
</script>
