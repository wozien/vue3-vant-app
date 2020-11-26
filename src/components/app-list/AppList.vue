<template>
  <div class="app-list">
    <div v-for="item in list" :key="item.id" class="app" @click="onClickApp(item)">
      <img :src="item.icon">
      <span class="name van-multi-ellipsis--l2">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Notify } from 'vant'
import { addAppCount } from '@/api/app'

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
      const toast = Toast.loading({
        message: '加载视图...'
      })

      await addAppCount(id)
      router.push({
        name: 'view',
        query: {
          model: modelKey,
          appId: id,
          actionId,
          viewType: 'list'
        }
      }).catch(e => {
        Notify({
          type: 'danger',
          message: e.message
        })
      }).finally(() => toast.clear())
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
    img {
      width: 45px;
      height: 45px;
      margin-bottom: 6px;
    }
    .name {
      font-size: 13px;
      color: @text-color-light-1;
      text-align: center;
    }
  }
}
</style>