<template>
  <div class="layout-page">
    <router-view
      v-title="$route.meta.title"
      :style="{ height: contentHeight + 'px' }"
      v-slot="{ Component }"
    >
      <transition :name="transitionName">
        <keep-alive :exclude="['View', 'Flow']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
    <van-tabbar v-model="active" v-if="hasTab">
      <van-tabbar-item name="dashboard" icon="wap-home-o" to="/dashboard">首页</van-tabbar-item>
      <van-tabbar-item name="market" icon="apps-o" to="/market">应用</van-tabbar-item>
      <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect, watch } from 'vue'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'
import { isWechatAgent } from '@/helpers/utils'

let refreshed = false

export default defineComponent({
  setup() {
    // route里面的属性是reactive的
    const route = useRoute()
    const store = useStore()

    const active = ref('')
    const transitionName = ref('')
    const contentHeight = ref(document.body.clientHeight)
    const hasTab = computed(() => !!route.meta.tab)

    const calcHeight = () => {
      let height = hasTab.value ? document.body.clientHeight - 50 : document.body.clientHeight
      contentHeight.value = height
    }

    // 加载用户信息
    store.dispatch('setUserInfo')
    store.dispatch('setOrgs')

    watchEffect(() => {
      active.value = route.path.substr(1)
    })

    watchEffect(() => {
      if (hasTab.value) {
        // nothing todo, just help to trigger effect
      }
      if (isWechatAgent({ iphone: true })) {
        // ios 微信客户端需要延时计算高度
        setTimeout(() => {
          calcHeight()
        }, 0)
      } else calcHeight()
    })

    watch(
      [
        () => route.fullPath,
        () => route.meta.pageIndex as number,
        () => route.query.viewType as string,
      ],
      ([path, index = 0, viewType], [oldPath, oldIndex = 0, oldViewType]) => {
        if (!refreshed) {
          refreshed = true
          return
        }
        console.log(oldPath, path)
        if (path !== oldPath && index !== oldIndex) {
          if (index > oldIndex) {
            transitionName.value = 'forward'
          } else {
            transitionName.value = 'back'
          }
        } else if (viewType === 'form' && oldViewType === 'list') {
          transitionName.value = 'forward'
        } else if (viewType === 'list' && oldViewType === 'form') {
          transitionName.value = 'back'
        } else {
          transitionName.value = ''
        }
      }
    )

    return {
      active,
      transitionName,
      hasTab,
      contentHeight,
    }
  },
})
</script>

<style lang="less" scoped>
.layout-page {
  .app-page;
  overflow: hidden;
}

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
  opacity: 0.5;
  transform: translate(100%);
}

.forward-leave-to,
.back-enter-from {
  opacity: 0.5;
  transform: translateX(-100%);
}
</style>
