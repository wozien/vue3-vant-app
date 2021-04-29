<template>
  <div class="register-page">
    <h2 class="title">
      <span>欢迎加入</span>
      <img class="logo-img" src="@/assets/img/insuite-logo.png" />
    </h2>
    <AuthCode v-if="!codeValid" ref="authCodeRef" v-model:phone="account.phone" type="register" />
    <div v-else class="content">
      <LoginInput placeholder="请输入姓名" v-model="account.name" clearable>
        <template #icon>
          <Icon name="username" />
        </template>
      </LoginInput>
      <LoginInput type="password" placeholder="请输入密码" v-model="account.password">
        <template #icon>
          <Icon name="password" />
        </template>
      </LoginInput>
      <LoginInput type="password" placeholder="请确认密码" v-model="account.repassword">
        <template #icon>
          <Icon name="password" />
        </template>
      </LoginInput>
    </div>

    <van-button type="primary" round block @click="confirm" :loading="loading">
      {{ codeValid ? '确定' : '下一步' }}
    </van-button>
    <p v-if="!codeValid" class="skip" @click="$router.push('/login')">已有账号? 直接登录</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import AuthCode from '@/views/system/AuthCode.vue'
import LoginInput from '@/components/login-input/LoginInput.vue'
import useToast from '@/hooks/component/useToast'
import { register } from '@/api/system'
import { useRouter } from 'vue-router'
import { sessionStorageKeys } from '@/logics/enums/cache'

export default defineComponent({
  components: {
    LoginInput,
    AuthCode
  },

  setup() {
    const router = useRouter()
    const { toast } = useToast()
    const account = reactive({
      phone: '',
      name: '',
      password: '',
      repassword: ''
    })
    const loading = ref(false)
    const codeValid = ref(false)
    const authCodeRef = ref()

    let randomCode: string = ''
    const confirm = async () => {
      if (!codeValid.value && authCodeRef.value) {
        loading.value = true
        const res = await authCodeRef.value.authorize('register')
        if (res !== false) {
          codeValid.value = true
          randomCode = res.code
        }
      } else {
        if (!account.name) {
          toast.show('姓名不能为空')
          return
        }
        if (!account.password || !account.repassword) {
          toast.show('密码不能为空')
          return
        }
        if (account.password !== account.repassword) {
          toast.show('两次密码不一致')
          return
        }
        if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$/.test(account.password) === false) {
          toast.show('密码必须包含大小写字母及数字，长度在8到16位之间')
          return
        }
        loading.value = true
        const res = await register(account, randomCode)
        if (res.ret == 0) {
          toast.show('账号注册成功')
          sessionStorage.setItem(sessionStorageKeys.loginAccount, account.phone)
          setTimeout(() => router.push(`/login`), 1000)
        }
      }

      loading.value = false
    }

    return {
      account,
      loading,
      codeValid,
      authCodeRef,
      confirm
    }
  }
})
</script>

<style lang="less" scoped>
.register-page {
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
  .content {
    margin-bottom: 50px;
  }
  .skip {
    .link-text;
    text-align: center;
    padding: 10px 0px;
  }
}
</style>
