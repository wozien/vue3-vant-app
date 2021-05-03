<template>
  <div class="form-attachment">
    <header>附件</header>
    <div class="files">
      <div class="file-item" v-for="item in files" :key="item.key" @click="downloadFile(item.key)">
        <van-image
          v-if="item.type === 'image'"
          :src="item.coverImg"
          width="30"
          height="30"
          fit="cover"
          :radius="4"
          @click.stop="previewImg(item)"
        />
        <img v-else :src="item.coverImg" width="30" @click.stop="previewImg(item)" />
        <p class="name">{{ item.name }}</p>
      </div>
      <van-empty v-if="!files.length" description="暂无附件数据"></van-empty>
    </div>
    <footer v-if="$route.query.readonly === '0'">
      <van-button type="primary" block round>上传附件</van-button>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { useStore } from '@/store'
import { fetchAttachment } from '@/api/record'
import { pick } from 'lodash-es'
import useToast from '@/hooks/component/useToast'
import { downloadUrl } from '@/utils'
import { getBaseFullUrl } from '@/utils/url'
import { ImagePreview } from 'vant'

const TOKEN = localStorage.getItem('INSUITE_TOKEN')

type FileType = 'image' | 'pdf' | 'word' | 'ppt' | 'excel' | 'others'
interface File {
  id: number
  key: string
  name: string
  type: FileType
  coverImg: string
}

export default defineComponent({
  props: {
    visible: Boolean
  },

  setup(props) {
    const store = useStore()
    const { toast } = useToast()
    const files = ref<File[]>([])
    const curRecord = computed(() => store.getters.curRecord)

    const loadData = async () => {
      if (curRecord.value) {
        const { model, res_id } = curRecord.value
        const res = await fetchAttachment(model, res_id)
        if (res.ret === 0) {
          const records = res.data?.records || []
          files.value = records.map((row: any) => {
            const type = getFileType(row.mimetype)
            return {
              ...pick(row, ['id', 'key', 'name']),
              type,
              coverImg: getCoverImg(type, row.id)
            } as File
          })
        }
      }
    }

    const previewImg = (file: File): void => {
      if (file.type !== 'image') {
        toast.show('改附件类型不支持预览')
        return
      }
      const previewUrl = getPreviewImg(file.id)
      ImagePreview([previewUrl])
    }

    const downloadFile = (key: string): void => {
      const url = getDownloadUrl(key)
      downloadUrl(url)
    }

    watchEffect(() => {
      if (props.visible) {
        loadData()
      }
    })

    return {
      files,
      previewImg,
      downloadFile
    }
  }
})

function getFileType(mimetype: string): FileType {
  let type: FileType = 'others'
  if (/^image\//.test(mimetype)) {
    type = 'image'
  } else if (mimetype === 'application/pdf') {
    type = 'pdf'
  } else if (~mimetype.search('spreadsheetml')) {
    type = 'excel'
  } else if (~mimetype.search('presentationml')) {
    type = 'ppt'
  } else if (~mimetype.search('wordprocessingml')) {
    type = 'word'
  }
  return type
}

function getCoverImg(type: FileType, fileId?: number): string {
  if (type === 'image' && fileId) {
    return getBaseFullUrl(`/meta/web/image/${fileId}/38x38`, {
      crop: true,
      token: TOKEN
    })
  } else {
    return `/src/assets/img/${type}.png`
  }
}

function getPreviewImg(fileId: number): string {
  return getBaseFullUrl(`/meta/web/image/${fileId}`, {
    unique: 1,
    model: 'ir.attachment',
    token: TOKEN
  })
}

function getDownloadUrl(key: string) {
  return getBaseFullUrl('/meta/mobile/download_attachment', {
    key,
    token: TOKEN
  })
}
</script>

<style lang="less" scoped>
.form-attachment {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: @ins-bg-color;
  color: @ins-text-color-light-1;
  padding: 0px 6px;
  header,
  footer {
    flex: 0 0 auto;
  }
  .files {
    flex: 1;
    overflow-y: auto;
    .file-item {
      background-color: #fff;
      border-radius: 4px;
      margin: 10px;
      padding: 10px;
      color: @ins-text-color-light-1;
      .flex-center;
      .van-image,
      img {
        margin-right: 6px;
      }
      .name {
        flex: 1;
        .ellipsis;
      }
    }
  }
  header {
    padding: 10px 6px;
    border-bottom: @ins-border;
    color: @ins-text-color;
  }
  footer {
    padding: 10px;
    border-top: @ins-border;
  }
}
</style>
