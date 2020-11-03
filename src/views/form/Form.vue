<template>
  <div class="std-group">
    <h2 class="std-group-title">表头信息</h2>
    <div class="std-group-content">
      <!-- char -->
      <van-field v-model="formData.char1" label="文本1" placeholder="请输入文本1" clearable></van-field>
      <van-field v-model="formData.char2" label="文本2" placeholder="请输入文本2" clearable></van-field>
      <!-- boolean -->
      <van-field label="复选框">
        <template #input>
          <van-checkbox v-model="formData.checkbox" shape="square"></van-checkbox>
        </template>
      </van-field>
      <!-- selection -->
      <van-field 
        v-model="formData.selected"
        label="选择器"
        placeholder="请点击选择"
        @click="showPicker=true"
        arrow-direction="down"
        readonly
        clickable
        is-link 
      />
    </div>
  </div>

  <van-popup v-model:show="showPicker" position="bottom" round>
    <van-picker :columns="selectData" @confirm="onSelect" @cancel="showPicker=false"/>
  </van-popup>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref } from 'vue'

interface FormData {
  char1: string;
  char2: string;
  checkbox: boolean;
  text?: string;
  selected: string;
}

export default defineComponent({
  setup() {
    const formData = reactive<FormData>({
      char1: '',
      char2: '',
      checkbox: false,
      selected: ''
    })
    const showPicker = ref(false)
    const { selectData, onSelect } = useSelect(formData, showPicker)

    return {
      formData,
      showPicker,
      selectData,
      onSelect
    }
  }
})

function useSelect(formData: FormData,  showPicker: Ref<boolean>) {
  const selectData = ['ss1', 'ss2', 'ss3', 'ss4']
  const onSelect = (value: string) => {
    formData.selected = value
    showPicker.value = false
  }

  return {
    selectData,
    onSelect
  }
}

</script>

<style lang="less" scoped>
.std-group {
  &-title {
    padding: 16px;
    color: rgba(69, 90, 100, 0.6);
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
  }
}
</style>