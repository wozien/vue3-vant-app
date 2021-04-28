<template>
  <div class="ins-input-wrapper">
    <slot name="icon" class="ins-input__icon"></slot>
    <input :type="inputType" v-model="inputValue" class="ins-input" v-bind="$attrs" />
    <van-icon
      class="ins-input__icon"
      v-if="inputValue && clearable"
      name="clear"
      color="#B0B2BC"
      @click="onClearValue"
    />
    <van-icon
      class="ins-input__icon"
      v-if="type === 'password' && inputValue"
      :name="inputType === 'password' ? 'closed-eye' : 'eye-o'"
      size="20"
      color="#B0B2BC"
      @click="toggleEyeIcon"
    />
    <slot name="suffix" class="ins-input__suffix"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'

type InputType = 'text' | 'password' | 'tel' | 'number'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<InputType>,
      default: 'text'
    },
    clearable: Boolean,
    modelValue: String
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
      }
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
      onClearValue
    }
  }
})
</script>

<style lang="less" scoped>
.ins-input-wrapper {
  border-bottom: 1px solid #eee;
  padding: 8px 0px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  .ins-input {
    flex: 1;
    .reset-input;
  }
  .ins-input__icon,
  .ins-input__suffix {
    flex: 0 0 auto;
    margin-right: 8px;
  }
}
</style>
