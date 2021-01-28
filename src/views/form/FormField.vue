<template>
  <!-- selection -->
  <Selection v-if="type === 'selection'" v-bind="{field, item, readonly}" />
  <!-- many2one -->
  <Many2One v-else-if="type === 'many2one'" v-bind="{field, item, readonly}"/>
  <!-- reference -->
  <Reference v-else-if="type === 'reference'" v-bind="{field, item, readonly}"/>
  <!-- one2many -->
  <One2Many v-else-if="type === 'one2many'" v-bind="{field, item, readonly}"/>
  <!-- date -->
  <DateField v-else-if="type ==='date' || type === 'datetime'" v-bind="{field, item, readonly}"/>
  <!-- normal -->
  <div v-else v-show="!invisible" class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <!-- boolean -->
    <van-field v-if="type === 'boolean'" :label="string" >
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
      :required="modifiers && !!modifiers.required"
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
      :required="modifiers && !!modifiers.required"
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
import { Many2One, One2Many, Selection, DateField, Reference } from '@/components/odoo-field'

export default defineComponent({
  components: {
    Many2One,
    One2Many,
    Selection,
    DateField,
    Reference
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
      invisible,
      setValue
    } = useFieldCommon(props, store)

    const renderType = computed(() => {
      return getRenderType(type.value)
    })

    return {
      string,
      placeholder,
      type,
      value,
      rawValue,
      curRecord,
      modifiers,
      isReadonly,
      invisible,
      renderType,
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