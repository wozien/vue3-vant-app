<template>
  <div class="flow-sign">
    <van-field 
      v-model="receiver"
      label="接收人" 
      placeholder="请选择接收人" 
      readonly is-link
      @click="showSelector=true"
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

  <UserPicker v-model:show="showSelector"/>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import UserPicker from '@/components/user-picker/UserPicker.vue'

export default defineComponent({
  components: {
    UserPicker
  },

  setup() {
    const state = reactive({
      type: '1',
      receiver: '',
      showSelector: false
    })

    return {
      ...toRefs(state)
    }
  }
})
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