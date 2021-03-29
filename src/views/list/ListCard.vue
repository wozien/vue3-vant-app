<template>
  <div class="list-card" @click="onClickCard">
    <header class="van-hairline--bottom">
      <span class="name">{{ name }}</span>
      <span :class="['state', stateType && `state-${stateType}`]">{{ state }}</span>
    </header>
    <ul class="content">
      <li class="field" v-for="f in fields" :key="f.name">
        <span class="string">{{ f.string }}</span>
        <span class="value">{{ f.value }}</span>
      </li>
    </ul>
    <footer>
      <van-image v-if="createImg" :src="createImg" width="25" height="25" round lazy-load />
      <span v-if="creator" class="create">{{ `${creator} ${createDate} 发起` }}</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { each } from 'lodash-es'
import { defineComponent, PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FieldsInfo, FieldInfo } from '@/logics/types'
import ListRecord from '@/logics/class/ListRecord'
import { formatDate } from '@/utils/date'
import { sessionStorageKeys } from '@/logics/enums/cache'
import fieldUtils from '@/logics/core/fieldUtils'

interface ListCardField {
  name: string
  string: string
  value: string | number
}

interface ListCard {
  id: number
  name: string
  state: string
  stateType?: string
  fields: ListCardField[]
  creator: string
  createDate: string
  createImg: string,
  [key: string]: any
}

export default defineComponent({
  props: {
    appName: String,
    record: {
      type: Object as PropType<ListRecord | ListCard>,
      required: true
    },
    fieldsInfo: {
      type: Object as PropType<FieldsInfo>,
      default: () => {}
    } 
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const cardData = useCard(props.record, props.fieldsInfo, props.appName)

    const onClickCard = () => {
      const query = {
        id: cardData.id,
        readonly: 1,
        viewType: 'form'
      } as any

      if(cardData.isFlow) {
        // 工作流
        sessionStorage.setItem(sessionStorageKeys.flowParams, JSON.stringify(cardData.context))
        sessionStorage.removeItem(sessionStorageKeys.loadParams)
        query.model = cardData.model
      } 
      
      router.push({
        name: 'view',
        query: Object.assign({}, route.query, query)
      })
    }

    return {
      ...cardData,
      onClickCard
    }
  }
})

function useCard(record: ListRecord | ListCard, fieldsInfo: FieldsInfo, appName?:string) {
  if(!(record instanceof ListRecord)) return record
  const res: ListCard = {
    id: record.id,
    name: appName || '',
    state: record.state,
    stateType: '',
    creator: record.creator.name,
    createImg: record.creator.avatar || '/img/avatar.png',
    createDate: formatDate('M月d日 hh:mm', record.creator.time),
    fields: []
  }
  
  each(fieldsInfo, (field: FieldInfo) => {
    if(field.modifiers?.invisible) return;
    const fieldItem: ListCardField = {
      name: field.name,
      string: field.string || '',
      value: ''
    }
    res.fields.push(fieldItem)

    const fieldType = field.type
    let fieldValue = record.raw[field.name]
    if(fieldType === 'date' || fieldType === 'datetime') {
      // to Date Obj
      fieldValue = (fieldUtils.parse as any)[fieldType](fieldValue, field)
    }

    if(fieldType === 'many2many' || fieldType === 'one2many') {
      fieldItem.value = Array.isArray(fieldValue) ? fieldValue.join(',') : ''
    } else {
      fieldItem.value = (fieldUtils.format as any)[fieldType](fieldValue, field, { format: fieldType === 'boolean' })
    }
  })

  return res
}

</script>

<style lang="less" scoped>
.list-card {
  .card;
  min-height: 60px;
  margin: 10px;
  font-size: 13px;
  header {
    display: flex;
    padding-bottom: 6px;
    .name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    .state {
      color: @info-color;
      &-error {
        color: @error-color;
      }
    }
  }
  .content {
    padding: 8px 4px;
    color: @text-color-light-1;
    font-size: 13px;
    .field {
      display: flex;
      margin-bottom: 4px;
      .string {
        flex: 0 0 100px;
      }
      .value {
        flex: 1;
        text-align: right;
      }
    }
  }
  footer {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: @text-color-light-2;
    .create {
      margin-left: 6px;
    }
  }
}
</style>