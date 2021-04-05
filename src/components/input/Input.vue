<template>
  <div class="ins-input-wrapper">
    <slot name="icon" class="ins-input__icon"></slot>
    <input :type="inputType" v-model="inputValue" class="ins-input" v-bind="$attrs" />
    <van-icon
      class="ins-input__icon"
      v-if="inputValue && clearable"
      name="clear"
      color="#666"
      @click="onClearValue"
    />
    <van-icon
      class="ins-input__icon"
      v-if="type === 'password' && inputValue"
      :name="inputType === 'password' ? 'closed-eye' : 'eye-o'"
      size="20"
      color="#646566"
      @click="toggleEyeIcon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'

type InputType = 'text' | 'password' | 'tel' | 'number'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<InputType>,
      default: 'text',
    },
    clearable: Boolean,
    modelValue: String,
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const inputType = ref<InputType>(props.type)
    const inputValue = computed({
      get() {
        return props.modelValue
      },
      set(val) {
        emit('update:modelValue', val)
      },
    })

    const toggleEyeIcon = () => {
      inputType.value = inputType.value === 'text' ? 'password' : 'text'
    }

    const onClearValue = () => {
      emit('update:modelValue', '')
    }

    return {
      inputType,
      inputValue,
      toggleEyeIcon,
      onClearValue,
    }
  },
})
</script>

<style lang="less" scoped>
.ins-input-wrapper {
  border-bottom: @ins-border;
  padding: 8px 0px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  .ins-input {
    flex: 1;
    outline: none;
    border: none;
    color: @ins-text-color;
    font-size: 14px;
  }
  .ins-input__icon {
    flex: 0 0 auto;
    margin-right: 8px;
  }
}
</style>
