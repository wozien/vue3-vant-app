<template>
  <div class="user-center">
    <div class="header">
      <van-image :src="user.avatar" width="50" height="50" fit="cover" round />
      <div class="info">
        <p class="name">{{ user.nickname }}</p>
        <p>{{ user.phone }}</p>
      </div>
      <Icon  name="set" size="24"/>
    </div>
    <van-cell-group>
      <van-cell :title="user.companyName" icon-prefix="ins-icon" icon="company" to="/companyList" is-link />
      <van-cell title="帮助中心" icon-prefix="ins-icon" icon="help" url="https://wiki.insuite.cn/zh/home" is-link/>
      <van-cell title="联系我们" icon-prefix="ins-icon" icon="contact" @click="onClickContract"/>
    </van-cell-group>
    <div class="footer">
      <van-button round block @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter, Router } from 'vue-router'
import { useStore } from '@/store'
import { Dialog } from 'vant'
import { userLogout } from '@/api/user'

function useLogout(router: Router) {
  const beforeClose = async (action: string) => {
    if(action === 'confirm') {
      const res = await userLogout()
      if(res.ret === 0) {
        localStorage.removeItem('INSUITE_TOKEN')
        router.push('/login')
      }
    }
    return true
  }

  const onLogout = () => {
    Dialog.confirm({
      message: '确定退出当前用户?',
      beforeClose
    }).catch(() => {})
  }

  return { onLogout }
}

export default defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()
    const onClickContract = () => {
      Dialog.alert({
        title: '联系信息',
        messageAlign: 'left',
        message: '客服电话: 400-018-7701\n办公邮箱: insuiteservice@inspur.com\n办公地址: 山东省济南市历城区东八区企业公馆A7-1'
      })
    }
    const { onLogout } = useLogout(router)

    return {
      user: computed(() => store.state.user),
      onClickContract,
      onLogout
    }
  }
})
</script>

<style lang="less" scoped>
.user-center {
  position: relative;
  .header {
    background: white;
    display: flex;
    align-items: center;
    padding: 20px 24px;
    margin-bottom: 10px;
    .info {
      flex: 1 1 auto;
      color: @text-color-light-1;
      font-size: 13px;
      margin-left: 14px;
      .name {
        font-size: 16px;
        margin-bottom: 6px;
        color: @text-color;
      }
    }
  }
  /deep/ .van-cell {
    color: @text-color-light-1;
  }

  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px 16px;
  }
}
</style>