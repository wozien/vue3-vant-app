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
        <van-checkbox v-model="value" shape="square" :disabled="isReadonly" @change="setValue" />
      </template>
    </van-field>
    <!-- readonly -->
    <van-field
      v-else-if="isReadonly && !isX2Many"
      :readonly="true"
      :required="isRequired"
      :label="string"
      v-model="value"
      center
    />
    <!-- relation field -->
    <component v-else-if="Component" :is="Component" v-bind="{ item, field, mode }" />
    <!-- integer, float -->
    <van-field
      v-else-if="type === 'integer' || type === 'float'"
      :type="renderType"
      :label="string"
      :placeholder="placeholder"
      :required="isRequired"
      v-model="rawValue"
      clearable
      center
      @update:model-value="setNumberValue"
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
      @update:model-value="setValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
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
      setValue,
      setNumberValue
    } = useFieldCommon(props)

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
      return !modifiers.value?.required || !!value.value || type.value === 'boolean'
    }

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
      setValue,
      setNumberValue,
      Component
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
