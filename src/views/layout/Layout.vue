<template>
  <Page>
    <router-view class="view-container"></router-view>
    <van-tabbar v-model="active">
      <van-tabbar-item name="dashboard" icon="home-o" to="/dashboard">首页</van-tabbar-item>
      <van-tabbar-item name="market" icon="apps-o" to="/market">应用</van-tabbar-item>
      <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </Page>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    // route里面的属性是reactive的
    const route = useRoute()
    const active = ref('')
    const store = useStore()

    // 加载用户信息
    store.dispatch('setUserInfo')
    store.dispatch('setOrgs')
    
    watchEffect(() => {
      active.value = route.path.substr(1)
    })

    return {
      active
    }
  }
})
</script>

<style lang="less" scoped>
.view-container {
  height: calc(100vh - 50px);
}
</style>