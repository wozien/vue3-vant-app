<template>
  <div class="flow-sign">
    <van-field 
      v-model="receiver"
      label="接收人" 
      placeholder="请选择接收人" 
      readonly is-link
      @click="showPicker=true"
    />
    <van-field name="radio" label="加签方式">
      <template #input>
        <van-radio-group v-model="type" direction="horizontal">
          <van-radio name="1">前加签</van-radio>
          <van-radio name="2">后加签</van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <div class="tip">
      <p>说明</p>
      <p>前加签: 增加前置节点，加签后，任务直接流转到所选用户</p>
      <p>后加签: 增加后续节点，当前节点处理后，流转到所选用户</p>
    </div>
  </div>

  <UserPicker v-model:show="showPicker" @select="onUserSelected"/>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, toRaw } from 'vue'
import UserPicker from '@/components/user-picker/UserPicker.vue'

export default defineComponent({
  components: {
    UserPicker
  },

  setup() {
    const state = reactive({
      type: '1',
      receiver: '',
      showPicker: false,
      selected: {
        members: []
      }
    })

    const onUserSelected = (data: any) => {
      state.selected = data
      state.receiver = calcReceiver(data)
    }

    const getData= () => {
      return {
        type: state.type === '1' ? 'before' : 'after',
        receiver: state.receiver,
        selected: toRaw(state.selected)
      }
    }

    return {
      ...toRefs(state),
      onUserSelected,
      getData
    }
  }
})

function calcReceiver(data: any) {
  const members = data.members || []
  const res = [] as string[]
  members.forEach((mb: any) => res.push(mb.name))
  return res.join(',')
}
</script>

<style lang="less" scoped>
.flow-sign {
  .tip {
    padding: 20px;
    font-size: 12px;
    color: @text-color-light-2;
    p {
      margin-bottom: 8px;
    }
  }
}
</style>