<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <vxe-table :data="tableData">
      <vxe-table-column type="seq" title="#" width="50"></vxe-table-column>
      <vxe-table-column 
        v-for="col in columns" 
        :key="col.field"
        :field="col.field"
        :title="col.title"
      />
    </vxe-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, ref } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import fieldUtils from '@/assets/js/utils/field-utils'

interface Column {
  field: string
  title: string
}

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { type, rawValue } = useFieldCommon(props, store)
    const columns = ref<Column[]>([])
    const tableData = ref<any[]>([])
    
    watchEffect(async () => {
      columns.value = getColumns(rawValue.value)
      tableData.value = getData(rawValue.value)
    })

    return {
      type,
      rawValue,
      columns,
      tableData
    }
  }
})

function getColumns(list: any) {
  let res: Column[] = []
  const fieldsInfo = list.fieldsInfo

  for(let fieldName in fieldsInfo) {
    const field = fieldsInfo[fieldName]
    if(field) {
      res.push({
        field: field.name,
        title: field.string
      } as Column)
    }
  }
  return res
}

function getData(list: any) {
  let res: any[] = []
  if(list) {
    const fieldsInfo = list.fieldsInfo
    res = list.data.map((record: any) => {
      const row = {} as any
      for(let fieldName in record.data) {
        const field = fieldsInfo[fieldName]
        const value = record.data[fieldName]
        if(fieldName === 'id') {
          row[fieldName] = value
        } else {
          row[fieldName] = (fieldUtils.format as any)[field.type](value, field)
        }
      }
      return row
    })
  }
  return res
}
</script>

<style lang="less" scoped></style>