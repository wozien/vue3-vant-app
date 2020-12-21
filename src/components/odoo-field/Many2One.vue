<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="realValue"
      :clickable="!readonly"
      :is-link="!readonly"
      readonly
      center
      @click="onOpenModal"
    />

    <Modal v-model:show="showModal" confirm-text="确定" @confirm="onConfirm">
      <div class="list-wrapper">
        <van-search v-model="searchValue" placeholder="输入名称搜索" shape="round"></van-search>
        <van-cell v-for="item in list" :key="item.id" :title="item.name" @click="active=item.id">
          <template #right-icon>
            <van-icon v-if="active === item.id" name="success"></van-icon>
          </template>
        </van-cell>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, toRefs, watchEffect } from 'vue'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { fetchMany2OneData } from '@/api/app'
import { Toast } from 'vant'

type Many2OneValue = [number, string]

export default defineComponent({
  props: {
    ...fieldCommonProps,
    rawValue: {
      type: Object as PropType<Many2OneValue>,
      default: () => [0, '']
    }
  },

  setup(props) {
    const realValue = ref('')
    const { string, placeholder, type } = useFieldCommon(props)
    const { state, onOpenModal } = useModal(props)

    watchEffect(() => {
      if(props.rawValue.length) {
        realValue.value = props.rawValue[1]
      } 
    })

    const onConfirm = (cb: any) => {
    if(!state.active) {
      Toast('请选择数据')
      cb(true)
      return
    }
    const item = state.list.find(item => item.id == state.active)
    if(item) {
      realValue.value = item.name
      state.active = 0
      cb()
    }
  }

    return {
      string,
      placeholder,
      type,
      realValue,
      ...toRefs(state),
      onOpenModal,
      onConfirm
    }
  }
})

function useModal(props: any) {
  const state = reactive({
    showModal: false,
    searchValue: '',
    active: 0,
    list: [] as {id:number, name: string}[]
  })

  const onOpenModal = async () => {
    if(props.readonly) return;
    const res = await fetchMany2OneData(props.field?.relation)
    if(res.ret === 0) {
      state.list = res.data.map((item: any) => {
        return {
          id: item[0],
          name: item[1]
        }
      })
      state.showModal = true
    }
  }

  return {
    state,
    onOpenModal
  }
}
</script>

<style lang="less" scoped>
</style>