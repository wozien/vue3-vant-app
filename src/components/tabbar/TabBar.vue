<template>
  <van-tabbar :modelValue="active">
    <van-tabbar-item name="dashboard" icon="wap-home-o" to="/dashboard">首页</van-tabbar-item>
    <van-tabbar-item name="market" icon="apps-o" to="/market">应用</van-tabbar-item>
    <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    active: {
      type: String,
      default: 'dashboard'
    }
  }
})
</script>
