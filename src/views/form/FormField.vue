<template>
  <!-- selection -->
  <Selection v-if="type === 'selection'" v-bind="{field, item, readonly}" />
  <!-- many2one -->
  <Many2One v-else-if="type === 'many2one'" v-bind="{field, item, readonly}"/>
  <!-- one2many -->
  <One2Many v-else-if="type === 'one2many'" v-bind="{field, item, readonly}"/>
  <!-- normal -->
  <div v-else class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <!-- boolean -->
    <van-field v-if="type === 'boolean'" :label="string" >
      <template #input>
        <van-checkbox v-model="value" shape="square" :disabled="readonly"/>
      </template>
    </van-field>
    <!-- char, integer, float， text -->
    <van-field v-else
      :type="renderType"
      :label="string" 
      :placeholder="placeholder" 
      :readonly="readonly"
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
import { Many2One, One2Many, Selection } from '@/components/odoo-field'

export default defineComponent({
  components: {
    Many2One,
    One2Many,
    Selection
  },

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { string, placeholder, type, value, rawValue, setValue } = useFieldCommon(props, store)
    const renderType = computed(() => {
      return getRenderType(type.value)
    })

    return {
      string,
      placeholder,
      type,
      value,
      rawValue,
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