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

    <div class="add-row" v-if="!readonly">
      <van-button size="small" icon="plus" block round @click="onAddRow">添加明细行</van-button>
    </div> 
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent, ref, nextTick, watchEffect } from 'vue'
import { useStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import fieldUtils from '@/assets/js/utils/field-utils'
import { VxeTableEvents } from 'vxe-table'
import { sessionStorageKeys } from '@/assets/js/constant'
import { notifyChanges } from '@/assets/js/class/DataPoint'

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

    const { type, rawValue, curRecord } = useFieldCommon(props, store)
    const columns = ref<Column[]>([])
    const tableData = ref<any[]>([])

    // 表体行点击
    const onCellClick: VxeTableEvents.CellClick = ({ row }) => {
      // if(props.readonly) return
      const record = _.find((rawValue.value as any).data, { res_id: row.id })
      if(record) {
        // 把表体操作在session中
        storeX2ManyCommand('UPDATE')
        router.push({
          name: 'view',
          query: Object.assign({}, route.query, {
            subModel: record.model,
            subId: row.id
          })
        })
      }
    }

    // 添加明细行
    const onAddRow = async () => {
      await notifyChanges(curRecord.value.id, {
        [props.field?.name as string]: {
          operation: 'CREATE'
        }
      })
      store.commit('SET_RECORD_TOKEN')

      nextTick(() => {
        // 获取最后一条表体记录的res_id
        const lastRecord = _.last((rawValue.value as any).data || [])
        if(lastRecord) {
          router.push({
            name: 'view',
            query: Object.assign({}, route.query, {
              subModel: props.field?.relation,
              subId: (lastRecord as any).res_id
            })
          })
        }
      })
    }

    const storeX2ManyCommand = (type: string) => {
      const commandInfo = {
        type,
        recordID: curRecord.value.id,
        fieldName: props.field?.name
      }
      sessionStorage.setItem(sessionStorageKeys.x2manyCommand, JSON.stringify(commandInfo))
    }

    watchEffect(() => {
      columns.value = getColumns(rawValue.value)
      tableData.value = getData(rawValue.value)
    })

    return {
      type,
      rawValue,
      columns,
      tableData,
      onCellClick,
      onAddRow
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
  if(list && list.data) {
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
      if(!row.id) {
        row.id = record.res_id
      }
      row.recordID = record.id
      return row
    })
  }
  return res
}
</script>

<style lang="less" scoped>
.add-row {
  padding: 10px 6px;
}
</style>