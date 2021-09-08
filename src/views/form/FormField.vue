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
          @update:model-value="debounceSetValue"
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
    <component
      v-else-if="Component"
      :is="Component"
      ref="component"
      v-bind="{ item, field, mode }"
    />
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
      @update:model-value="debounceSetValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import templateRef from '@/hooks/core/templateRef'
import { getFieldComponent } from '@/components/odoo-field'

export default defineComponent({
  name: 'FormField',

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const {
      string,
      placeholder,
      type,
      widget,
      value,
      rawValue,
      modifiers,
      isReadonly,
      isRequired,
      invisible,
      debounceSetValue
    } = useFieldCommon(props)
    const component = templateRef('component')

    const renderType = computed(() => {
      return getRenderType(type.value)
    })
    const itemClass = computed(() => ({
      'form-item-field': true,
      [`form-item-${type.value}`]: type.value === 'one2many',
      'form-item-readonly': props.mode === 'edit' && isReadonly.value
    }))
    const isX2Many = computed(() => props.field?.isX2Many())
    const Component = computed(() => {
      if (props.field && props.item) {
        return getFieldComponent(props.field.type, props.item.widget)
      }
      return null
    })

    const isSet = () => {
      if (!modifiers.value?.required) return true
      if (component.value && 'isSet' in component.value) return (component.value as any).isSet()
      return !!value.value || type.value === 'boolean'
    }

    const needFormat = computed(() => {
      return isX2Many.value || props.field?.isNumber()
    })

    return {
      string,
      placeholder,
      type,
      widget,
      value,
      rawValue,
      isReadonly,
      isRequired,
      invisible,
      renderType,
      itemClass,
      isSet,
      isX2Many,
      debounceSetValue,
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
