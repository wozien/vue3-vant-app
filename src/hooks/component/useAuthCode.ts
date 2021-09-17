import { reactive, ref, computed } from 'vue'
import { fetchImageCode, fetchMessageCode } from '@/api/system'

/**
 * 图像验证码
 * @returns
 */
function useImageCode() {
  const imageCode = reactive({
    id: '',
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

/**
 * 短信验证码
 * @returns
 */
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

export { useImageCode, useMessageCode }
