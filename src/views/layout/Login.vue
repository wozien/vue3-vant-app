<template>
  <div class="login-page">
    <h2 class="title">欢迎使用 inSuite</h2>
    <div class="info">
      <LoginInput type="tel" placeholder="手机号" v-model="account.phone" clearable>
        <template #icon>
          <Icon name="account"/>
        </template>
      </LoginInput>
      <LoginInput type="password" placeholder="密码" v-model="account.password">
        <template #icon>
          <Icon name="password"/>
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
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { userLogin } from '@/api/user'
import { LocalStorageKeys } from '@/logics/enums/cache'
import LoginInput from '@/components/input/Input.vue'

function useLogin() {
  const loading = ref(false)
  const account = reactive({
    phone: '',
    password: ''
  })
  const router = useRouter()

  const login = async () => {
    const { phone, password } = account 
    if(!phone || !password) {
      Toast('手机号或者密码不能为空'); return
    } else if(!/^\d{11}$/.test(phone)) {
      Toast('手机号格式不正确'); return
    }

    loading.value = true
    const wxOpenId = localStorage.getItem(LocalStorageKeys.wxOpenId)
    const res = await userLogin(phone, password, wxOpenId)
    loading.value = false
    if(res.ret === 0) {
      const { access_token } = res.data
      localStorage.setItem(LocalStorageKeys.token, access_token)
      router.push('/companyList')
    }
  }
  return { loading, account, login }
}

export default defineComponent({
  components: {
    LoginInput
  },

  setup() {
    return {
      ...useLogin(),
      forget: () => Toast('暂不支持'),
      register: () => Toast('暂不支持'),
    }
  }
})

</script>

<style lang="less" scoped>
.login-page {
  .app-page;
  background: white;
  padding: 60px 36px;
  .title {
    color: @primary-color;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .info {
    overflow: hidden;
    margin-bottom: 20px;
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
        color: @text-color-light-1;
        border-right: @border;
      }
      &.register {
        color: @primary-color;
      }
    }
  }
}
</style>