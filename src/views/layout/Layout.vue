<template>
  <div class="layout-page">
    <router-view v-title="$route.meta.title" :style="{height: contentHeight + 'px'}" v-slot="{ Component }"> 
      <keep-alive :exclude="['View']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <van-tabbar v-model="active" v-if="hasTab">
      <van-tabbar-item name="dashboard" icon="home-o" to="/dashboard">首页</van-tabbar-item>
      <van-tabbar-item name="market" icon="apps-o" to="/market">应用</van-tabbar-item>
      <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'
import { isWechatAgent } from '@/utils/helper'

export default defineComponent({
  setup() {
    // route里面的属性是reactive的
    const route = useRoute()
    const store = useStore()

    const active = ref('')
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
      if(hasTab.value)  // nothing todo, just help to trigger effect 
      if(isWechatAgent({ iphone: true })) {
        // ios 微信客户端需要延时计算高度
        setTimeout(() => {
          calcHeight()
        }, 0)
      } else calcHeight()
    })

    return {
      active,
      hasTab,
      contentHeight
    }
  }
})
</script>

<style lang="less" scoped>
.layout-page {
  .app-page;
}
</style>
