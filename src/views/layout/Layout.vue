<template>
  <Page>
    <router-view v-title="$route.meta.title" :style="{height: height + 'px'}"> </router-view>
    <van-tabbar v-model="active" v-if="hasTab">
      <van-tabbar-item name="dashboard" icon="home-o" to="/dashboard">首页</van-tabbar-item>
      <van-tabbar-item name="market" icon="apps-o" to="/market">应用</van-tabbar-item>
      <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </Page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    // route里面的属性是reactive的
    const route = useRoute()
    const store = useStore()
    const active = ref('')
    const hasTab = computed(() => !!route.meta.tab)
    const height = computed(() => {
      let res = document.body.clientHeight
      if(hasTab.value) {
        res = res - 50
      }
      return res
    })

    // 加载用户信息
    store.dispatch('setUserInfo')
    store.dispatch('setOrgs')
    
    watchEffect(() => {
      active.value = route.path.substr(1)
    })

    return {
      active,
      hasTab,height
    }
  }
})
</script>
