<template>
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
    >
      <template v-if="col.fieldType === 'boolean'" #default="{ row }">
        <van-checkbox v-model="row[col.field]" :disabled="true" shape="square" />
      </template>
      <template v-else-if="col.fieldType === 'many2many'" #default="{ row }">
        <van-tag v-for="item in row[col.field]" :key="item.id" round plain style="margin-right: 6px">
          {{ item.display_name }}
        </van-tag>
      </template>
    </vxe-table-column>
  </vxe-table>

  <div class="add-row" v-if="!isReadonly && !isMany2Many">
    <van-button icon="plus" size="small" type="primary" round block plain @click="onAddRow">添加明细行</van-button>
  </div> 
</template>

<script lang="ts">
import { last, map, find, pick, isEmpty } from 'lodash-es'
import { defineComponent, ref, computed, nextTick, watchEffect } from 'vue'
import { useStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import fieldUtils from '@/logics/core/fieldUtils'
import { VxeTableEvents } from 'vxe-table'
import { sessionStorageKeys } from '@/logics/enums/cache'
import { notifyChanges, DataPointState, evalModifiers } from '@/logics/core/dataPoint'

interface Column {
  field: string
  title: string
  fieldType: string
}

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const { rawValue, curRecord, isReadonly } = useFieldCommon(props)
    const columns = ref<Column[]>([])
    const tableData = ref<any[]>([])
    const isMany2Many = computed(() => props.item?.widget === 'many2many')

    // 表体行点击
    const onCellClick: VxeTableEvents.CellClick = ({ row }) => {
      // m2m 字段暂时只给查看
      if(isMany2Many.value) return   

      const record = find((rawValue.value as any).data, { res_id: row.id })
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
        const lastRecord = last((rawValue.value as any).data || [])
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
      columns.value = getColumns(rawValue.value as DataPointState)
      tableData.value = getData(rawValue.value as DataPointState)
    })

    return {
      isMany2Many,
      isReadonly,
      rawValue,
      columns,
      tableData,
      onCellClick,
      onAddRow
    }
  }
})

function getColumns(list: DataPointState) {
  let res: Column[] = []
  const fieldsInfo = list.fieldsInfo

  for(let fieldName in fieldsInfo) {
    const field = fieldsInfo[fieldName]
    if(field) {
      let modifiers = field.modifiers ? pick(field.modifiers, ['invisible', 'columnInvisible']) : {}
      if(!isEmpty(modifiers)) {
        modifiers = evalModifiers(list.id, modifiers)
      }

      if(!modifiers || (!modifiers.column_invisible && !modifiers.invisible)) {
        res.push({
          field: field.name,
          title: field.string,
          fieldType: field.type
        } as Column)
      }
    }
  }
  return res
}

function getData(list: DataPointState) {
  let res: any[] = []
  if(list && list.data) {
    const fieldsInfo = list.fieldsInfo
    res = list.data.map((record: any) => {
      const row = {} as any
      for(let fieldName in record.data) {
        const field = fieldsInfo[fieldName]
        if(!field) continue
        let value = record.data[fieldName]
        if(fieldName === 'id') {
          row[fieldName] = value
        } else if(field.type === 'many2many' || field.type === 'one2many') {
          value = map((value as any).data, 'data')
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
  padding: 15px 50px 10px;
}
</style>