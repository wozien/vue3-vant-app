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
// import { useStore } from '@/store'
// import { useRouter } from 'vue-router'
import useContext from '@/assets/js/hooks/useContext'
import { Toast } from 'vant'

interface App {
  id: number;
  name: string;
  icon: string;
  actionId: number;
}

export default defineComponent({
  props: {
    appData: Array as PropType<App[]>
  },

  setup(props) {
    // const store = useStore()
    // const router = useRouter()
    const onClickApp = async ({ id, actionId }: App) => {
      const toast = Toast.loading({
        message: '加载视图...'
      })

      try {
        const { curApp } = useContext(id, actionId)
        if(curApp && !curApp.isLoaded) {
          await curApp.load()
        }
        console.log(curApp)
        // router.push({
        //   name: 'list-view',
        //   query: {
        //     model: store.state.model?.key
        //   }
        // })
      // eslint-disable-next-line no-empty
      }catch(e) {
        console.warn(e.message)
      }
      toast.clear()
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