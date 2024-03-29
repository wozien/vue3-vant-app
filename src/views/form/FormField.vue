<template>
  <div
    v-show="!invisible"
    :class="itemClass"
    :data-field-name="field && field.name"
    :data-field-type="type"
    :data-widget="widget"
  >
    <!-- boolean -->
    <van-field v-if="type === 'boolean'" :label="string" :required="isRequired">
      <template #input>
        <van-checkbox
          v-model="value"
          shape="square"
          :disabled="isReadonly"
          @update:model-value="setValue"
        />
      </template>
    </van-field>
    <!-- readonly -->
    <van-field
      v-else-if="isReadonly && !needFormat"
      :readonly="true"
      :required="isRequired"
      :label="string"
      v-model="value"
      center
    />
    <!-- relation field -->
    <component v-else-if="Component" :is="Component" v-bind="{ item, field, mode }" />
    <!-- char, text -->
    <van-field
      v-else
      :type="renderType"
      :label="string"
      :placeholder="placeholder"
      :required="isRequired"
      v-model="value"
      clearable
      center
      @change="setValue(value)"
      @clear="setValue(value)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { getFieldComponent } from '@/components/odoo-field'

export default defineComponent({
  name: 'FormField',

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const route = useRoute()
    const {
      string,
      placeholder,
      type,
      widget,
      value,
      isReadonly,
      isRequired,
      invisible,
      setValue
    } = useFieldCommon(props)

    const renderType = computed(() => {
      return getRenderType(type.value)
    })
    const itemClass = computed(() => ({
      'form-item-field': true,
      [`form-item-${type.value}`]: type.value === 'one2many',
      'form-item-readonly': route.query.readonly === '0' && isReadonly.value
    }))
    const Component = computed(() => {
      if (props.field && props.item) {
        return getFieldComponent(props.field.type, props.item.widget)
      }
      return null
    })
    const needFormat = computed(() => {
      if (props.field) {
        return props.field.isX2Many() || props.field.isNumber()
      }
      return false
    })

    return {
      string,
      placeholder,
      type,
      widget,
      value,
      isReadonly,
      isRequired,
      invisible,
      renderType,
      itemClass,
      setValue,
      Component,
      needFormat
    }
  }
})

/**
 * 获取字段的渲染vant类型
 */
function getRenderType(type?: string) {
  let realType = 'text'
  switch (type) {
    case 'text':
      realType = 'textarea'
      break
    case 'integer':
      realType = 'digit'
      break
    case 'float':
      realType = 'number'
      break
  }

  return realType
}
</script>
