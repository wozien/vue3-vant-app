<template>
  <Modal v-model:show="showModal" @confirm="onConfirm" @cancel="onCancel">
    <van-cell-group>
      <van-cell title="头像" :clickable="false" is-link center>
        <van-uploader
          ref="uploadRef"
          :max-size="1024 * 1024"
          :after-read="onAfterRead"
          @oversize="onOversize"
        >
          <van-image :src="avatar || user.avatar" width="35" height="35" fit="cover" round />
        </van-uploader>
      </van-cell>
      <van-cell title="姓名" :value="user.nickname"></van-cell>
      <van-cell title="手机" :value="user.phone"></van-cell>
    </van-cell-group>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from '@/store'
import { Toast } from 'vant'
import { uploadUserAvatar } from '@/api/user'
import { setUrlQuery } from '@/utils/url'
import { getFileExt } from '@/utils/index'

function useUploader() {
  const avatar = ref('')
  let curFile: File
  const onAfterRead = (file: any) => {
    curFile = file.file as File
    const ext = getFileExt(curFile.name)
    if (['.jpg', '.jpeg'].includes(ext) === false) {
      Toast('暂只支持 jpg 格式的图片')
      return
    }
    avatar.value = file.content
  }
  const onOversize = () => {
    Toast.fail('文件大小不能超过1Mb')
  }
  const onUpload = async (phone: string) => {
    if (!curFile) {
      Toast('请先选择头像')
      return false
    }
    const res = await uploadUserAvatar(curFile, phone)
    return res
  }
  const reset = () => {
    avatar.value = ''
  }

  return {
    avatar,
    onAfterRead,
    onOversize,
    onUpload,
    reset
  }
}

export default defineComponent({
  props: {
    show: Boolean
  },

  setup(props, { emit }) {
    const store = useStore()

    const showModal = computed({
      get: () => props.show,
      set: newVal => {
        emit('update:show', newVal)
      }
    })

    const uploader = useUploader()
    const onConfirm = async (cb: Function) => {
      try {
        const res = await uploader.onUpload(store.state.user.phone)
        if (res && res.ret === 0) {
          // 重新获取下图像
          store.state.user.avatar = setUrlQuery(store.state.user.avatar, {
            t: new Date().getTime()
          })
          uploader.reset()
          cb()
        } else {
          cb(true)
        }
      } catch (e) {
        cb(true)
      }
    }
    const onCancel = () => {
      uploader.reset()
    }

    return {
      user: computed(() => store.state.user),
      showModal,
      onConfirm,
      onCancel,
      ...uploader
    }
  }
})
</script>

<style lang="less" scoped></style>
