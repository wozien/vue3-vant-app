<template>
  <div v-show="!invisible" :class="itemClass" :data-field-name="field && field.name" :data-field-type="type">
    <!-- boolean -->
    <van-field v-if="type === 'boolean'" :label="string" :required="isRequired">
      <template #input>
        <van-checkbox v-model="value" shape="square" :disabled="isReadonly" @change="setValue"/>
      </template>
    </van-field>
    <!-- readonly -->
    <van-field 
      v-else-if="isReadonly && !isX2Many"
      :readonly="true"
      :label="string"
      v-model="value"
      center
    />
    <!-- selection -->
    <Selection v-else-if="type === 'selection'" v-bind="{field, item, mode}" />
    <!-- many2one -->
    <Many2One v-else-if="type === 'many2one'" v-bind="{field, item, mode}" />
    <!-- reference -->
    <Reference v-else-if="type === 'reference'" v-bind="{field, item, mode}" />
    <!-- one2many -->
    <One2Many v-else-if="type === 'one2many'" v-bind="{field, item, mode}"/>
    <!-- many2many -->
    <Many2Many v-else-if="type === 'many2many'" v-bind="{field, item, mode}" />
    <!-- date -->
    <DateField v-else-if="type ==='date' || type === 'datetime'" v-bind="{field, item, mode}"/>
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
      @update:model-value="setValue"
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
import { Many2One, One2Many, Selection, DateField, Reference, Many2Many } from '@/components/odoo-field'

export default defineComponent({
  name: 'FormField',

  components: {
    Many2One,
    One2Many,
    Selection,
    DateField,
    Reference,
    Many2Many
  },

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const {
      string,
      placeholder,
      type,
      value,
      rawValue,
      curRecord,
      modifiers,
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
      'form-item-readonly': props.mode === 'edit' && isReadonly.value
    }))

    const isX2Many = computed(() => props.field?.isX2Many())

    const isSet = () => {
      return !modifiers.value?.required || !!value.value || type.value === 'boolean'
    }

    return {
      string,
      placeholder,
      type,
      value,
      rawValue,
      curRecord,
      modifiers,
      isReadonly,
      isRequired,
      invisible,
      renderType,
      itemClass,
      isSet,
      isX2Many,
      setValue
    }
  }
})

/**
 * 获取字段的渲染vant类型
 */
function getRenderType(type?: string) {
  let realType = 'text'
  switch(type) {
    case 'text': realType = 'textarea'; break
    case 'integer': realType = 'digit'; break
    case 'float': realType = 'number'; break
  }

  return realType
}

</script>