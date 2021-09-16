<template>
  <div class="auth-code">
    <LoginInput v-model="account" placeholder="请输入手机号" clearable>
      <template #icon>
        <Icon name="account" />
      </template>
    </LoginInput>
    <LoginInput v-model="imgCode" placeholder="请输入图形验证码" clearable>
      <template #icon>
        <Icon name="imgcode" />
      </template>
      <template #suffix>
        <img :src="imageCodeUrl" alt="" @click="loadImageCode" class="image-code" />
      </template>
    </LoginInput>
    <LoginInput v-model="smsCode" placeholder="请输入短信验证码" clearable>
      <template #icon>
        <Icon name="smscode" />
      </template>
      <template #suffix>
        <span class="message-code" @click="onClickPhoneCode">{{ timeContent }}</span>
      </template>
    </LoginInput>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRef, PropType } from 'vue'
import LoginInput from '@/components/login-input/LoginInput.vue'
import useToast from '@/hooks/component/useToast'
import { forgetAuthorize, getUserCount } from '@/api/system'
import { isLegalPhone } from '@/utils'
import { useImageCode, useMessageCode } from '@/hooks/component/useAuthCode'

export default defineComponent({
  components: {
    LoginInput
  },

  props: {
    phone: String,
    type: {
      type: String as PropType<'register' | 'forget'>,
      default: 'forget'
    }
  },
  emits: ['update:phone'],

  setup(props, { emit }) {
    const { toast } = useToast()
    const imgCode = ref('')
    const smsCode = ref('')
    const account = computed<string>({
      get() {
        return props.phone || ''
      },
      set(val) {
        emit('update:phone', val)
      }
    })
    const { imageCode, loadImageCode } = useImageCode()
    const { time, timeContent, sendMessageCode } = useMessageCode()

    const checkEmpty = (type?: 'sms' | 'auth') => {
      let errMsg = ''
      if (!account.value) {
        errMsg = '手机号不能为空'
      }
      if (!isLegalPhone(account.value)) {
        errMsg = '手机号格式不正确'
      } else if (!imgCode.value) {
        errMsg = '图形验证码不能为空'
      } else if (!smsCode.value && type !== 'sms') {
        errMsg = '手机验证码不能为空'
      }
      if (errMsg) {
        toast.show(errMsg)
        return true
      }
      return false
    }

    const onClickPhoneCode = async () => {
      if (time.value > 0 || checkEmpty('sms')) return

      const res = await getUserCount(account.value)
      if (res.ret == 0 && res.data.code == 200) {
        const { count } = res.data
        if (count === 0 && props.type === 'forget') {
          toast.show('该账号还未注册，快去注册吧')
          return
        } else if (count >= 1 && props.type === 'register') {
          toast.show('该账号已经存在，请返回登录')
          return
        }
      } else {
        return
      }

      if (imageCode.expire) {
        loadImageCode()
        imgCode.value = smsCode.value = ''
        toast.show('图形验证码已过期')
      } else {
        const res = await sendMessageCode({
          imgCode: imgCode.value,
          imgCodeId: imageCode.id,
          account: account.value
        })
        if (res) {
          imageCode.expire = true
        }
      }
    }

    const authorize = async () => {
      if (!checkEmpty('auth')) {
        const res = await forgetAuthorize(account.value, smsCode.value, props.type)
        if (res.ret === 0 && res.data.code == 200) {
          return {
            code: res.data.random_code,
            token: res.data.token
          }
        }
      }
      return false
    }

    return {
      account,
      imgCode,
      smsCode,
      imageCodeUrl: toRef(imageCode, 'url'),
      timeContent,
      loadImageCode,
      authorize,
      onClickPhoneCode
    }
  }
})
</script>

<style lang="less" scoped>
.auth-code {
  margin-bottom: 50px;
  .image-code {
    width: 80px;
  }
  .message-code {
    color: #1d8ee8;
    font-size: 14px;
  }
}
</style>
