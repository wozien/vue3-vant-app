<template>
  <van-field
    :label="string" 
    :placeholder="placeholder" 
    v-model="value"
    :required="isRequired"
    :clickable="true"
    :is-link="true"
    readonly
    center
    @click="onOpenModal"
  />

  <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm" @cancel="onCancel">
    <div class="m2o-selector">
      <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
      <div class="list-wrapper">
        <van-cell v-for="item in list" :key="item.id" :title="item.display_name" @click="onClickItem(item.id)">
          <template #right-icon>
            <van-icon v-if="active === item.id" name="success"></van-icon>
          </template>
        </van-cell>
        <van-empty v-if="!list.length" description="暂无数据"></van-empty>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, Ref, computed, watch } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/hooks/component/useField'
import { fetchMany2OneData } from '@/api/record'
import { getDomain } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'

export default defineComponent({
  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const { string, placeholder, value, rawValue, isRequired, curRecord, setValue } = useFieldCommon(props)
    const { state, onOpenModal } = useModal(props, curRecord)

    const onClickItem = (id: number) => {
      state.active = state.active === id ? 0 : id
    }

    const onConfirm = async (cb: Fn) => {
      const item = state.list.find(item => item.id == state.active)
      if(item) {
        // notify change
        await setValue(item)
      } else {
        await setValue(false)
      }
      cb()
    }

    const onCancel = () => {
      if(rawValue.value) {
        state.active = (rawValue.value as any).res_id
      }
    }

    watch(rawValue, (val: any) => {
      if(val) {
        state.active = val.res_id
      }
    }, { immediate: true })

    return {
      string,
      placeholder,
      value,
      isRequired,
      ...toRefs(state),
      onOpenModal,
      onClickItem,
      onConfirm,
      onCancel
    }
  }
})

function useModal(props: any, curRecord: Ref<any>) {
  const { toast } = useToast()
  const state = reactive({
    showModal: false,
    searchValue: '',
    active: 0,
    list: [] as {id:number, display_name: string}[]
  })

  const domain = computed(() => {
    return curRecord && getDomain(curRecord.value.id, { fieldName: props.field?.name })
  })

  const onOpenModal = async () => {
    state.showModal = true
    await loadData()
  }

  const loadData = async () => {
    toast.loading()
    const res = await fetchMany2OneData(props.field?.relation, state.searchValue, domain.value)
    if(res.ret === 0) {
      state.list = res.data.map((item: any) => {
        return {
          id: item[0],
          display_name: item[1]
        }
      })
    }
    toast.clear()
  }

  watch(() => state.searchValue, () => {
    loadData()
  })

  return {
    state,
    onOpenModal
  }
}
</script>

<style lang="less" scoped>
.m2o-selector {
  height: 100%;
  .list-wrapper {
    height: calc(100% - 54px);
    overflow-y: auto;
  }
}
</style>