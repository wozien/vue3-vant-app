<template>
  <div class="app-list">
    <div v-for="item in list" :key="item.id" class="app" @click="onClickApp(item)">
      <div class="img-wrapper">
        <img class="img" :src="item.icon">
      </div>
      <span class="name van-multi-ellipsis--l2">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { addAppCount } from '@/api/app'
import { sessionStorageKeys } from '@/logics/enums/cache'
import { getAppAsync } from '@/logics/class/App'

interface AppRaw {
  id: number;
  name: string;
  icon: string;
  action_id: number;
  model_key: string;
}

export default defineComponent({
  props: {
    appData: Array as PropType<AppRaw[]>
  },

  setup(props) {
    const router = useRouter()
  
    const onClickApp = async ({ id, action_id: actionId, model_key: modelKey }: AppRaw) => {
      const loadParams = {
        model: modelKey,
        menuId: id,
        actionId,
      }
      sessionStorage.setItem(sessionStorageKeys.loadParams, JSON.stringify(loadParams))

      const toast = Toast.loading({ message: '加载视图...', duration: 0 })
      try {
        const [app] = await Promise.all([
          getAppAsync(modelKey, id + '', actionId),
          addAppCount(id)
        ]) 
        
        const hasList = app.views && 'list' in app.views
        router.push({
          name: 'view',
          query: {
            model: modelKey,
            viewType: hasList ? 'list' : 'form'
          }
        }).then(() => {
          toast.clear()
        })
      } catch(e) {
        toast.clear()
      }
    }

    return {
      list: props.appData,
      onClickApp
    }
  }
})
</script>

<style lang="less" scoped>
.app-list {
  overflow: hidden;
  padding-top: 14px;
  display: flex;
  flex-wrap: wrap;
  .app {
    width: 80px;
    margin-bottom: 20px;
    .column-flex;
    .img-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 8px;
      .img {
        transform-origin: center center;
        transform: scale(1.2);
        width: 100%;
        height: 100%;
      }
    }
    .name {
      font-size: 13px;
      color: @text-color-light-1;
      text-align: center;
    }
  }
}
</style>