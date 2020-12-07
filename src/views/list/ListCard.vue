<template>
  <div class="card list-card" @click="onClickCard">
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
      <van-image v-if="createImg" :src="createImg" width="25" height="25" round></van-image>
      <span v-if="creator" class="create">{{ `${creator} ${createDate} 发起` }}</span>
    </footer>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent, PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Record, Field } from '@/assets/js/class'
import { formatDate } from '@/assets/js/utils/date'

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
      type: Object as PropType<Record | ListCard>,
      required: true
    },
    viewFields: {
      type: Array as PropType<Field[]>,
      default: () => []
    }
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const cardData = useCard(props.record, props.viewFields, props.appName)

    const onClickCard = () => {
      if(cardData.isFlow) {
        // 工作流
        sessionStorage.setItem('FLOW_PARAMS', JSON.stringify(
          _.pick(cardData, ['processId', 'taskId', 'type', 'billNumber'])
        ))
        router.push({
          name: 'view',
          query: {
            viewType: 'form',
            id: cardData.id,
            readonly: 1,
            model: cardData.model
          }
        })
      } else {
        router.push({
          name: 'view',
          query: Object.assign({}, route.query, {
            viewType: 'form',
            id: cardData.id,
            readonly: 1
          })
        })
      }
    }

    return {
      ...cardData,
      onClickCard
    }
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useCard(record: Record | ListCard, viewFields: Field[], appName?:string) {
  if(!(record instanceof Record)) return record
  const res: ListCard = {
    id: record.id,
    name: appName || '',
    state: record.state,
    stateType: '',
    creator: record.creator.name,
    createImg: record.creator.avatar || '/img/mm1.jpeg',
    createDate: formatDate('M月d日 hh:mm', record.creator.time),
    fields: []
  }
  
  viewFields.forEach(field => {
    const fieldItem: ListCardField = {
      name: field.name,
      string: field.string,
      value: ''
    }
    const fieldValue = record.raw[field.name]
    if(field.type === 'selection' && field.selection?.length) {
      for(let [key, value] of field.selection) {
        if(key === fieldValue) {
          fieldItem.value = value; break
        }
      }
    } else if(field.type === 'many2one') {
      const [, value] = fieldValue
      fieldItem.value = value
    } else {
      fieldItem.value = fieldValue
    }
    res.fields.push(fieldItem)
  })

  return res
}

</script>

<style lang="less" scoped>
.list-card {
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
        flex: 1;
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