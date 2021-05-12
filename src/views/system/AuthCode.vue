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
import { defineComponent, reactive, ref, computed, toRef, PropType } from 'vue'
import LoginInput from '@/components/login-input/LoginInput.vue'
import useToast from '@/hooks/component/useToast'
import { fetchImageCode, fetchMessageCode, forgetAuthorize, getUserCount } from '@/api/system'
import { isLegalPhone } from '@/utils'

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
      if (!account.value) {
        toast.show('手机号不能为空')
        return true
      }
      if (!isLegalPhone(account.value)) {
        toast.show('手机号格式不正确')
        return true
      } else if (!imgCode.value) {
        toast.show('图形验证码不能为空')
        return true
      } else if (!smsCode.value && type !== 'sms') {
        toast.show('手机验证码不能为空')
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

function useImageCode() {
  const imageCode = reactive({
    id: 0,
    url: '',
    expire: false
  })

  const loadImageCode = async () => {
    const res = await fetchImageCode()
    if (res.ret === 0) {
      imageCode.id = res.data.image_id
      imageCode.url = res.data.image_url
      imageCode.expire = false
    }
  }
  loadImageCode()

  return {
    imageCode,
    loadImageCode
  }
}

function useMessageCode() {
  const time = ref(0)
  const timeContent = computed(() => {
    return time.value ? `${time.value}s 重新获取` : '获取验证码'
  })

  let timer: any
  const sendMessageCode = async (payload: any) => {
    if (time.value > 0) return
    const res = await fetchMessageCode(payload)
    if (res.ret === 0) {
      time.value = 60
      timer = setInterval(() => {
        time.value ? --time.value : clearInterval(timer)
      }, 1000)
      return true
    }
    return false
  }

  return {
    time,
    timeContent,
    sendMessageCode
  }
}
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
