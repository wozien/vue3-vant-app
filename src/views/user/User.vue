<template>
  <div class="page user-page">
    <div class="user-center">
      <div class="header" @click="showUserSetting = true">
        <van-image :src="user.avatar" width="50" height="50" fit="cover" round />
        <div class="info">
          <p class="name">{{ user.nickname }}</p>
          <p>{{ user.phone }}</p>
        </div>
        <van-icon name="arrow" color="#646566"></van-icon>
      </div>
      <van-cell-group>
        <van-cell
          :title="user.company.name"
          icon-prefix="ins-icon"
          icon="company"
          to="/companyList?keepSwitch=1"
          is-link
        />
        <van-cell
          :title="curOrg"
          icon-prefix="ins-icon"
          icon="org"
          is-link
          @click="showPicker = true"
        />
        <van-cell
          title="帮助中心"
          icon-prefix="ins-icon"
          icon="help"
          url="https://wiki.insuite.cn/zh/home"
        />
        <van-cell title="联系我们" icon-prefix="ins-icon" icon="contact" @click="onClickContract" />
      </van-cell-group>
      <div class="footer">
        <van-button type="primary" @click="onLogout" size="small" round block hairline
          >退出登录</van-button
        >
      </div>

      <van-popup v-model:show="showPicker" position="bottom" round>
        <van-picker :columns="orgs" @confirm="onSelectOrg" @cancel="showPicker = false" />
      </van-popup>

      <!-- 个人信息编辑页 -->
      <UserSetting v-model:show="showUserSetting" />
    </div>

    <TabBar active="user" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useRouter, Router } from 'vue-router'
import { useStore } from '@/store'
import { Dialog } from 'vant'
import { userLogout, switchUserOrg } from '@/api/user'
import { LocalStorageKeys } from '@/logics/enums/cache'
import UserSetting from './UserSetting.vue'
import TabBar from '@/components/tabbar/TabBar.vue'

export default defineComponent({
  components: {
    UserSetting,
    TabBar
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { onLogout } = useLogout(router)
    const showPicker = ref(false)
    const { orgs, curOrg, setCurOrg } = useOrgs()
    const onSelectOrg = (value: string) => {
      if (value !== curOrg.value) {
        setCurOrg(value)
      }
      showPicker.value = false
    }

    const onClickContract = () => {
      Dialog.alert({
        title: '联系信息',
        messageAlign: 'left',
        message:
          '客服电话: 400-018-7701\n办公邮箱: insuiteservice@inspur.com\n办公地址: 山东省济南市历下区浪潮路1036号浪潮科技园'
      })
    }

    return {
      user: computed(() => store.state.user),
      orgs,
      curOrg,
      showPicker,
      showUserSetting: ref(false),
      onClickContract,
      onLogout,
      onSelectOrg
    }
  }
})

function useOrgs() {
  const store = useStore()
  const orgs = computed(() => store.state.orgs.map(org => org.name))
  const curOrg = computed(() => store.state.curOrg?.name)
  const setCurOrg = async (orgName: string) => {
    const org = store.state.orgs.find(org => org.name === orgName)
    if (org) {
      const res = await switchUserOrg(org.id)
      if (res.ret === 0) {
        store.state.curOrg = org
      }
    }
  }

  return {
    orgs,
    curOrg,
    setCurOrg
  }
}

function useLogout(router: Router) {
  const beforeClose = async (action: string) => {
    if (action === 'confirm') {
      const res = await userLogout()
      if (res.ret === 0) {
        localStorage.removeItem(LocalStorageKeys.token)
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
</script>

<style lang="less" scoped>
.user-center {
  height: calc(100% - 50px);
  position: relative;
  .header {
    background: white;
    display: flex;
    align-items: center;
    padding: 20px;
    margin-bottom: 10px;
    .info {
      flex: 1 1 auto;
      color: @ins-text-color-light-1;
      font-size: 13px;
      margin-left: 14px;
      .name {
        font-size: 16px;
        margin-bottom: 6px;
        color: @ins-text-color;
      }
    }
  }
  &::v-deep(.van-cell) {
    color: @ins-text-color-light-1;
  }

  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    &::v-deep(.van-button) {
      width: 50%;
      margin: 0 auto;
    }
  }
}
</style>
