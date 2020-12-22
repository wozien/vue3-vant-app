<template>
  <!-- selection -->
  <!-- many2one -->
  <Many2One v-if="type === 'many2one'" v-bind="{field, item, rawValue, readonly}"/>
  <!-- one2many -->
  <One2Many v-else-if="type === 'one2many'" v-bind="{field, item, readonly}" :raw-value="[]"/>
  <!-- date -->
  <!-- boolean -->
  <!-- normal -->
  <div v-else class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      :readonly="readonly"
      v-model="value"
      clearable
      center
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { Many2One, One2Many } from '@/components/odoo-field'

type Many2OneValue = [number, string]

export default defineComponent({
  components: {
    Many2One,
    One2Many
  },

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { string, placeholder, type, value, rawValue } = useFieldCommon(props, store)

    return {
      string,
      placeholder,
      type,
      value,
      rawValue,
    }
  }
})

// function isNormal(type: string) {
//   const types = ['selection', 'many2one', 'one2many', 'date', 'datetime', 'boolean']
//   return !types.includes(type)
// }

</script>