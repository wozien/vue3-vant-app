<template>
  <div class="login-page">
    <h2 class="title">
      <span>欢迎使用</span>
      <img class="logo-img" src="@/assets/img/insuite-logo.png" />
    </h2>
    <div class="info">
      <LoginInput type="tel" placeholder="请输入手机号" v-model="account.phone" clearable>
        <template #icon>
          <Icon name="account" />
        </template>
      </LoginInput>
      <LoginInput type="password" placeholder="请输入密码" v-model="account.password">
        <template #icon>
          <Icon name="password" />
        </template>
      </LoginInput>
      <LoginInput v-if="showCode" v-model="imgCode" placeholder="请输入图形验证码" clearable>
        <template #icon>
          <Icon name="imgcode" />
        </template>
        <template #suffix>
          <img :src="imageCodeUrl" alt="" @click="loadImageCode" class="image-code" />
        </template>
      </LoginInput>
    </div>
    <van-button type="primary" round block @click="login" :loading="loading">登录</van-button>
    <div class="footer">
      <span class="forget" @click="forget">忘记密码</span>
      <span class="register" @click="register">立即注册</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { userLogin } from '@/api/user'
import { LocalStorageKeys } from '@/logics/enums/cache'
import LoginInput from '@/components/login-input/LoginInput.vue'
import { isLegalPhone } from '@/utils'
import { sessionStorageKeys } from '@/logics/enums/cache'
import { useImageCode } from '@/hooks/component/useAuthCode'

function useLogin() {
  const router = useRouter()
  const loading = ref(false)
  const account = reactive({
    phone: sessionStorage.getItem(sessionStorageKeys.loginAccount) || '',
    password: ''
  })
  const imgCode = ref('')
  const showCode = ref(false)
  const { imageCode, loadImageCode } = useImageCode()
  sessionStorage.removeItem(sessionStorageKeys.loginAccount)

  const login = async () => {
    const { phone, password } = account
    let errMsg
    if (!phone || !password) {
      errMsg = '手机号或者密码不能为空'
    } else if (!isLegalPhone(phone)) {
      errMsg = '手机号格式不正确'
    } else if (showCode.value && imgCode.value === '') {
      errMsg = '请输入图形验证码'
    }
    if (errMsg) {
      Toast(errMsg)
      return
    }

    loading.value = true
    const wxOpenId = localStorage.getItem(LocalStorageKeys.wxOpenId)
    const res = await userLogin(phone, password, wxOpenId, imgCode.value, imageCode.id)
    loading.value = false
    if (res.ret === 0) {
      const { access_token } = res.data
      localStorage.setItem(LocalStorageKeys.token, access_token)
      router.push('/companyList')
    } else {
      const { code, login_failed_times, refresh_image_code } = res.error as any
      if (refresh_image_code === 1 && showCode.value) loadImageCode()

      if (code === 400 && login_failed_times >= 3) {
        showCode.value = true
      } else if (code === 403) {
        showCode.value = false
      }
    }
  }
  return {
    loading,
    account,
    imgCode,
    showCode,
    imageCodeUrl: toRef(imageCode, 'url'),
    loadImageCode,
    login
  }
}

export default defineComponent({
  components: {
    LoginInput
  },

  setup() {
    const router = useRouter()

    return {
      ...useLogin(),
      forget: () => router.push('/forget'),
      register: () => router.push('/register')
    }
  }
})
</script>

<style lang="less" scoped>
.login-page {
  .app-page;
  background: white;
  padding: 46px 30px;
  .title {
    color: @ins-primary-color;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    .logo-img {
      vertical-align: middle;
      width: 103px;
      transform: translateY(-4px);
      margin-left: 8px;
    }
  }
  .info {
    overflow: hidden;
    margin-bottom: 30px;
    .image-code {
      width: 80px;
    }
  }
  .footer {
    text-align: center;
    font-size: 13px;
    margin-top: 20px;
    span {
      padding: 0px 10px;
      display: inline-block;
      cursor: pointer;
      &.forget {
        color: @ins-text-color-light-1;
        border-right: 1px solid @ins-border-color;
      }
      &.register {
        color: @ins-primary-color;
      }
    }
  }
}
</style>
