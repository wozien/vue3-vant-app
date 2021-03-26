
import { Toast } from 'vant'
import { ref, watchEffect } from 'vue'

export default function(bindRef?: boolean) {
  const toastShow = (msg: string) => Toast(msg)
  const toastLoading = (msg?: string) => {
    Toast.loading({
      duration: 0,
      forbidClick: true,
      message: msg || '加载中...'
    })
  }
  const toastClear = () => Toast.clear()

  let loading = ref(false)
  if(bindRef) {
    watchEffect(() => {
      loading.value ? toastLoading() : toastClear()
    })
  }

  return {
    toast: {
      show: toastShow,
      loading: toastLoading,
      clear: toastClear
    },
    loading
  }
}