<template>
  <div class="forget-page">
    <AuthCode v-if="!codeValid" ref="authCodeRef" v-model:phone="account.phone" />
    <div v-else class="content">
      <LoginInput type="password" placeholder="请输入新密码" v-model="account.password">
        <template #icon>
          <Icon name="password" />
        </template>
      </LoginInput>
      <LoginInput type="password" placeholder="请确认新密码" v-model="account.repassword">
        <template #icon>
          <Icon name="password" />
        </template>
      </LoginInput>
    </div>

    <van-button type="primary" round block @click="confirm" :loading="loading">
      {{ codeValid ? '确定' : '下一步' }}
    </van-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import LoginInput from '@/components/login-input/LoginInput.vue'
import AuthCode from './AuthCode.vue'
import useToast from '@/hooks/component/useToast'
import { modifyPassward } from '@/api/system'
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
      password: '',
      repassword: ''
    })
    const loading = ref(false)
    const codeValid = ref(false)
    const authCodeRef = ref()

    let randomCode: string = ''
    let token: string = ''
    const confirm = async () => {
      if (!codeValid.value && authCodeRef.value) {
        loading.value = true
        const res = await authCodeRef.value.authorize('forget')
        if (res !== false) {
          codeValid.value = true
          randomCode = res.code
          token = res.token
        }
      } else {
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
        const res = await modifyPassward(account, randomCode, token)
        if (res.ret === 0) {
          toast.show('密码修改成功')
          sessionStorage.setItem(sessionStorageKeys.loginAccount, account.phone)
          setTimeout(() => router.push(`/login`), 1000)
        }
      }

      loading.value = false
    }

    return {
      account,
      codeValid,
      loading,
      authCodeRef,
      confirm
    }
  }
})
</script>

<style lang="less" scoped>
.forget-page {
  .app-page;
  background: white;
  padding: 46px 30px;
  .content {
    margin-bottom: 50px;
  }
}
</style>
