<template>
  <!-- selection -->
  <Selection v-if="type === 'selection'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- many2one -->
  <Many2One v-else-if="type === 'many2one'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- reference -->
  <Reference v-else-if="type === 'reference'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- one2many -->
  <One2Many v-else-if="type === 'one2many'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- many2many -->
  <Many2Many v-else-if="type === 'many2many'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- date -->
  <DateField v-else-if="type ==='date' || type === 'datetime'" v-bind="{field, item, mode}" v-show="!invisible"/>
  <!-- normal -->
  <div v-else v-show="!invisible" class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <!-- boolean -->
    <van-field v-if="type === 'boolean'" :label="string" :required="isRequired">
      <template #input>
        <van-checkbox v-model="value" shape="square" :disabled="isReadonly" @change="setValue"/>
      </template>
    </van-field>
    <!-- readonly -->
    <van-field 
      v-else-if="isReadonly"
      :readonly="true"
      :label="string"
      v-model="value"
      center
    />
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
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
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
    const store = useStore()
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
    } = useFieldCommon(props, store)

    const renderType = computed(() => {
      return getRenderType(type.value)
    })

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
      isSet,
      setValue
    }
  }
})

/**
 * 获取字段的渲染vant类型
 */
function getRenderType(type: string) {
  let realType = 'text'
  switch(type) {
    case 'text': realType = 'textarea'; break
    case 'integer': realType = 'digit'; break
    case 'float': realType = 'number'; break
  }

  return realType
}

</script>