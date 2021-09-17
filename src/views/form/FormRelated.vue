<template>
  <div class="form-related">
    <header>关联单据</header>
    <div class="content">
      <ListCard v-for="item in list" :key="item.key" :record="item" />
      <van-empty v-if="!list.length" description="暂无关联单据数据" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue'
import { useStore } from '@/store'
import { fetchFormRelated } from '@/api/record'
import ListCard, { ListCardItem } from '@/views/list/ListCard.vue'
import { formatDate, str2Date } from '@/utils/date'

export default defineComponent({
  components: {
    ListCard
  },

  props: {
    visible: Boolean
  },

  setup(props) {
    const store = useStore()
    const list = ref<ListCardItem[]>([])
    const curRecord = computed(() => store.getters.curRecord)

    const loadData = async () => {
      const { model, res_id } = curRecord.value
      if (model && res_id) {
        const res = await fetchFormRelated(model, res_id)
        if (res.ret === 0) {
          list.value = res.data.map((row: any) => toListCardData(row))
        }
      }
    }

    watchEffect(() => props.visible && loadData())

    return {
      list
    }
  }
})

/**
 * 数据包转换
 */
function toListCardData(data: any = {}): ListCardItem {
  const { id, display_name, model, action_id, create_date, odoo_data = {}, create_user } = data
  const res: ListCardItem = {
    id,
    model,
    name: display_name,
    actionId: action_id,
    key: `${model}_${action_id}_${id}`,
    creator: create_user?.name,
    createDate: formatDate('M月d日 hh:mm', str2Date(create_date)),
    createImg: '',
    state: '',
    fields: [
      { name: 'number', string: '单据编号', value: odoo_data.number || '暂无' },
      { name: 'biz_date', string: '业务日期', value: odoo_data.biz_date || '' }
    ]
  }

  return res
}
</script>

<style lang="less" scoped>
.form-related {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: @ins-bg-color;
  color: @ins-text-color-light-1;
  padding: 0px 6px;
  header {
    flex: 0 0 auto;
    padding: 10px 6px;
    border-bottom: @ins-border;
    color: @ins-text-color;
  }
  .content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
