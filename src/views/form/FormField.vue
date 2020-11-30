<template>
  <!-- selection -->
  <!-- many2one -->
  <Many2One v-if="type === 'many2one'" v-bind="{field, item, rawValue, readonly}"/>
  <!-- one2many -->
  <!-- date -->
  <!-- boolean -->
  <!-- normal -->
  <div v-else class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      :readonly="readonly"
      v-model="rawValue"
      clearable
      center
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue'
import { Item, Field, Record } from '@/assets/js/class'
import useFieldCommon from '@/assets/js/hooks/useFieldCommon'
import { Many2One } from '@/components/odoo-field'

type Many2OneValue = [number, string]

export default defineComponent({
  components: {
    Many2One
  },

  props: {
    item: Object as PropType<Item>,
    field: Object as PropType<Field>,
    record: Object as PropType<Record>,
    readonly: Boolean
  },

  setup(props) {
    const rawValue = ref<string | Many2OneValue>('')
    const { string, placeholder, type } = useFieldCommon(props)

    watchEffect(() => {
      if(props.record && props.field && props.item) {
        let recordRaw = props.record.raw;
        if(Array.isArray(recordRaw)) {
          recordRaw = recordRaw[0]
        }
        let val = recordRaw[props.field.name]
        rawValue.value = val === false && isNormal(type.value) ? '' : val
      }
    })

    return {
      string,
      placeholder,
      type,
      rawValue,
    }
  }
})

function isNormal(type: string) {
  const types = ['selection', 'many2one', 'one2many', 'date', 'datetime', 'boolean']
  return !types.includes(type)
}

</script>