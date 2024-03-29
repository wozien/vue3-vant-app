<template>
  <div v-if="widget === 'many2many_tags'">
    <van-field
      :label="string"
      :required="isRequired"
      :clickable="false"
      :is-link="!isReadonly"
      readonly
      center
      @click="onClick"
    >
      <template #input>
        <div class="items">
          <span class="empty" v-if="!items.length">{{ placeholder }}</span>
          <van-tag
            v-for="item in items"
            :key="item.id"
            round
            plain
            :closeable="!isReadonly"
            @click.prevent
            @close="onTagClose(item.id)"
            >{{ item.display_name }}</van-tag
          >
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

  <One2Many v-else v-bind="{ field, item, mode }" />
</template>

<script lang="ts">
import { defineComponent, computed, toRefs, reactive } from 'vue'
import { find, map, pick } from 'lodash-es'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { getDomain } from '@/logics/core/dataPoint'
import { fetchMany2OneData } from '@/api/record'
import One2Many from './One2Many.vue'
import { Toast } from 'vant'

export default defineComponent({
  components: {
    One2Many
  },

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const state = reactive({
      showPicker: false,
      columns: [] as string[],
      loading: false
    })
    const { string, placeholder, rawValue, curRecord, isReadonly, isRequired, setValue } =
      useFieldCommon(props)
    const widget = computed(() => props.item?.widget)
    const items = computed(() => {
      if (rawValue.value) {
        return map((rawValue.value as any).data, 'data')
      }
      return []
    })
    const domain = computed(() => {
      const res =
        (curRecord.value && getDomain(curRecord.value.id, { fieldName: props.field?.name })) || []
      const backList = items.value.map((item: any) => item.id)
      if (backList.length) {
        res.push(['id', 'not in', backList])
      }
      return res
    })

    const onTagClose = (id: number) => {
      const record = find((rawValue.value as any).data, { res_id: id })
      if (record) {
        setValue({
          operation: 'FORGET',
          ids: [record.id]
        })
      }
    }

    const onClick = async () => {
      if (isReadonly.value) return
      await loadData()
      if (state.columns.length) {
        state.showPicker = true
      } else {
        Toast(`暂无${string.value}数据`)
      }
    }

    const onConfirm = (item: any) => {
      if (item) {
        setValue({
          operation: 'ADD_M2M',
          ids: pick(item, ['id', 'display_name'])
        })
      }
      state.showPicker = false
    }

    const loadData = async () => {
      state.loading = true
      const res = await fetchMany2OneData(props.field?.relation as string, '', '', domain.value)
      if (res.ret === 0) {
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
      string,
      placeholder,
      widget,
      rawValue,
      curRecord,
      isReadonly,
      isRequired,
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
    color: @ins-text-color-light-2;
  }
  &::v-deep(.van-tag) {
    margin-right: 6px;
  }
}
</style>
