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
import { Item, Field, View, Model, getApp } from '@/assets/js/class'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { fetchRecord } from '@/api/app'

interface Column {
  field: string
  title: string
}

export default defineComponent({
  props: {
    ...fieldCommonProps,
    rawValue: Array
  },

  setup(props) {
    const { type } = useFieldCommon(props)
    const columns = ref<Column[]>()
    const tableData = ref([])
    
    watchEffect(async () => {
      columns.value = getColumns(props)
      tableData.value = await getData(props, columns.value)
    })

    return {
      type,
      columns,
      tableData
    }
  }
})

function getColumns(props: any) {
  const field = props.field as Field
  const item = props.item as Item
  let subView = item?.subView
  let res: Column[] = []

  if(item && field && subView?.length) {
    const curApp = getApp()
    const model = curApp.getModel(field.relation) as Model
    if(subView[0]) {
      res = (subView[0] as View).items.map((item: Item) => {
        const f = model.getField(item.fieldKey)
        return {
          field: f?.name,
          title: f?.string
        } as Column
      })
    }
  }

  return res
}

async function getData(props: any, columns: Column[]) {
  const field = props.field as Field
  if(field && field.relation && props.rawValue) {
    const searchFields = columns.map(col => col.field)
    const res = await fetchRecord(field.relation, Array.from(props.rawValue), searchFields)
    if(res.ret === 0) {
      const rawData = res.data;
      if(rawData.length) {
        return rawData.map((row: any) => {
          for(let key in row) {
            // m2o
            if(Array.isArray(row[key])) {
              row[key] = row[key][1]
            }
          }
          return row
        })
      }
    }
  }
  return []
}
</script>

<style lang="less" scoped></style>