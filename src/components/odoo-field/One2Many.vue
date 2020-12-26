<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <vxe-table
      :data="tableData" 
      max-height="500"
      empty-text="暂无数据"
       @cell-click="onCellClick"
    >
      <vxe-table-column type="seq" title="#" width="50" fixed="left"></vxe-table-column>
      <vxe-table-column 
        v-for="col in columns" 
        :key="col.field"
        :field="col.field"
        :title="col.title"
        min-width="120"
      />
    </vxe-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, ref } from 'vue'
import { useStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import fieldUtils from '@/assets/js/utils/field-utils'
import { VxeTableEvents } from 'vxe-table'
import _ from 'lodash'

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
    const route = useRoute()
    const router = useRouter()

    const { type, rawValue } = useFieldCommon(props, store)
    const columns = ref<Column[]>([])
    const tableData = ref<any[]>([])

    const onCellClick: VxeTableEvents.CellClick = ({ row }) => {
      if(props.readonly) return
      const record = _.find((rawValue.value as any).data, { res_id: row.id })
      if(record) {
        router.push({
          name: 'view',
          query: Object.assign({}, route.query, {
            model: record.model,
            id: row.id
          })
        })
      }
    }
    
    watchEffect(async () => {
      columns.value = getColumns(rawValue.value)
      tableData.value = getData(rawValue.value)
    })

    return {
      type,
      rawValue,
      columns,
      tableData,
      onCellClick
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