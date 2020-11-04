<template>
  <div class="dashboard">dashboard</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'

export default defineComponent({

  setup() {
    const store = useStore()

    store.dispatch('setUserInfo')

    return {
      user: computed(() => store.state.user)
    }
  }
})
</script>

<style lang="less" scoped></style>