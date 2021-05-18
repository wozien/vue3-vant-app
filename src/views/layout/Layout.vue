<template>
  <router-view v-title="$route.meta.title" v-slot="{ Component }">
    <transition :name="transitionName">
      <keep-alive :exclude="['View', 'Flow', 'FlowProcess']">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from '@/store'

export default defineComponent({
  setup() {
    const store = useStore()
    const transitionName = ref('')

    // 加载用户信息
    store.dispatch('setUserInfo')
    store.dispatch('setOrgs')

    return {
      transitionName
    }
  },
  watch: {
    $route(to, from) {
      const { index = 0 } = to.meta
      const { index: fromIndex = 0 } = from.meta

      if (index > fromIndex) {
        this.transitionName = 'forward'
      } else if (index < fromIndex) {
        this.transitionName = 'back'
      } else {
        this.transitionName = ''
      }
    }
  }
})
</script>

<style lang="less">
.forward-enter-active,
.forward-leave-active,
.back-enter-active,
.back-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  width: 100%;
}

.forward-enter-from,
.back-leave-to {
  opacity: 0.8;
  transform: translate(100%);
}

.forward-leave-to,
.back-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
