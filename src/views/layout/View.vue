<template>
  <ListView v-if="viewType === 'list'" :curApp="curApp"></ListView>
  <div v-else>表单</div>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount, ref } from 'vue'
import { App, getAppAsync } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import ListView from '../list/List.vue'

export default defineComponent({
  components: {
    ListView
  },
  
  setup() {
    const route = useRoute()
    const { appId, actionId, model } = route.query
    let curApp = ref(new App(0, 0, ''))

    const viewType = computed(() => route.query.viewType)

    onBeforeMount(async () => {
      curApp.value = await getAppAsync(appId as string, actionId as string, model as string)
    })

    return {
      viewType,
      curApp
    }
  }
})
</script>

<style lang="less" scoped></style>