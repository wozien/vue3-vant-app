<template>
  <ListView v-if="viewType === 'list'" :curApp="curApp"></ListView>
  <div v-else>表单</div>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount, ref } from 'vue'
import { App, getApp } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import ListView from '../list/List.vue'

export default defineComponent({
  components: {
    ListView
  },
  
  setup() {
    const route = useRoute()
    const { appId, actionId } = route.query
    let curApp = ref(new App(0, 0))

    const viewType = computed(() => route.query.viewType)

    onBeforeMount(async () => {
      curApp.value = await getApp(appId, actionId)
    })

    return {
      viewType,
      curApp
    }
  }
})
</script>

<style lang="less" scoped></style>