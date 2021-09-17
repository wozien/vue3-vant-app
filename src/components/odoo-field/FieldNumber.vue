<template>
  <van-field
    :label="string"
    :placeholder="placeholder"
    type="number"
    v-model="value"
    :required="isRequired"
    :readonly="isReadonly"
    @change="setNumberValue"
    clearable
    center
  />
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { getPrecision } from '@/utils'
import fieldUtils from '@/logics/core/fieldUtils'
import { DEFAULT_DIGIT } from '@/logics/enums/cache'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { string, placeholder, value, rawValue, isRequired, setValue, curRecord, isReadonly } =
      useFieldCommon(props)

    const precision = computed(() => {
      if (!curRecord.value) return DEFAULT_DIGIT

      const field = curRecord.value.fieldsInfo[props.field.name]
      if (!field) return DEFAULT_DIGIT

      const precision = getPrecision(curRecord.value, field)
      if (precision !== undefined) return precision
      if ('digits' in props.field) return props.field.digits[1]
      return DEFAULT_DIGIT
    })

    const formatValue = (val: string | number) => {
      const field = props.field
      const fieldType = field.options?.relatedType || field.type
      value.value = (fieldUtils.format as any)[fieldType](+val, field, {
        precision: precision.value
      })
    }

    watchEffect(() => {
      formatValue(rawValue.value as number)
    })

    const setNumberValue = () => {
      formatValue(value.value as string)
      setValue(value.value)
    }

    return {
      string,
      placeholder,
      value,
      isRequired,
      isReadonly,
      setNumberValue
    }
  }
})
</script>
