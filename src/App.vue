<template>
  <router-view v-title="$route.meta.title"></router-view>
</template>

<style lang="less">
#app {
  height: 100%;
  position: relative;
  overflow: hidden;
  .page {
    height: 100%;
    position: relative;
  }
}
</style>
