<template>
  <div class="card list-card">
    <header class="van-hairline--bottom">
      <span class="name">{{ name }}</span>
      <span class="state">{{ state }}</span>
    </header>
    <ul class="content">
      <li class="field" v-for="f in fields" :key="f.name">
        <span class="string">{{ f.string }}</span>
        <span class="value">{{ f.value }}</span>
      </li>
    </ul>
    <footer>
      <van-image :src="createImg" width="25" height="25" round></van-image>
      <span class="create">{{ `${creator} ${createDate} 发起` }}</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { RecordRaw } from '@/assets/js/class/Record'

interface ListCardField {
  name: string
  string: string
  value: string | number
}

interface ListCard {
  name: string
  state: string
  fields: ListCardField[]
  creator: string
  createDate: string
  createImg: string
}

export default defineComponent({
  props: {
    recordRaw: {
      type: Object as PropType<RecordRaw>,
      required: true
    }
  },

  setup(props) {
    const cardData = useCard(props.recordRaw)

    return {
      ...cardData
    }
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useCard(raw: RecordRaw): ListCard {
  return {
    name: '报销',
    state: '审核中',
    fields: [
      { name: 'number', string: '单据编号', value: 'BXD202011200001'},
      { name: 'acount', string: '单据金额', value: 900.05},
      { name: 'reason', string: '单据事由', value: '济南总部出差'}
    ],
    creator: '张三',
    createImg: '/img/mm1.jpeg',
    createDate: '9月25日 11:12'
  }
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