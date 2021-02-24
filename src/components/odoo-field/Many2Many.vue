<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :clickable="false"
      :is-link="!readonly"
      readonly
      center
      @click="onClick"
    >
      <template #input> 
        <div class="items">
          <span class="empty" v-if="!items.length">{{ placeholder }}</span>
          <van-tag v-for="item in items" 
            :key="item.id" 
            round plain
            :closeable="!readonly"
            @click.prevent
            @close="onTagClose(item.id)"
          >{{ item.display_name }}</van-tag> 
        </div>
      </template>
    </van-field>

    <van-popup v-model:show="showPicker" position="bottom" teleport="body" round>
      <van-picker
        :columns="columns"
        :loading="loading"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs, reactive } from 'vue'
import { useStore } from '@/store'
import _ from 'lodash'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { getDomain } from '@/assets/js/class/DataPoint'
import { fetchMany2OneData } from '@/api/record'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()

    const state = reactive({
      showPicker: false,
      columns: [] as string[],
      loading: false
    })
    const { type, string, placeholder, rawValue, curRecord, setValue } = useFieldCommon(props, store)
    const items = computed(() => {
      if(rawValue.value) {
        return _.map((rawValue.value as any).data, 'data')
      }
      return []
    })
    const domain = computed(() => {
      const res = curRecord.value && getDomain(curRecord.value.id, { fieldName: props.field?.name }) || []
      const backList = items.value.map((item: any) => item.id)
      if(backList.length) {
        res.push(['id', 'not in', backList])
      }
      return res
    })

    const onTagClose = (id: number) => {
      const record = _.find((rawValue.value as any).data, {res_id: id})
      if(record) {
        setValue({
          operation: 'FORGET',
          ids: [record.id]
        })
      }
    }

    const onClick = async () => {
      if(props.readonly) return;
      await loadData()
      state.showPicker = true
    }

    const onConfirm = (item: any) => {
      setValue({
        operation: 'ADD_M2M',
        ids: _.pick(item, ['id', 'display_name'])
      })
      state.showPicker = false
    }

    const loadData = async () => {
      state.loading = true
      const res = await fetchMany2OneData(props.field?.relation as string, '', domain.value)
      if(res.ret === 0) {
        state.columns = res.data.map((item: any) => {
          const [id, display_name] = item
          return {
            id,
            display_name,
            text: display_name
          }
        })
      }
      state.loading = false
    }

    return {
      ...toRefs(state),
      type,
      string,
      placeholder,
      rawValue,
      curRecord,
      items,
      onTagClose,
      onClick,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped>
.items {
  .empty {
    color: @text-color-light-2;
  }
  &::v-deep(.van-tag) {
    margin-right: 6px;
  }
}
</style>