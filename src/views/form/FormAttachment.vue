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
        <van-icon
          name="delete"
          v-if="$route.query.readonly === '0'"
          size="18px"
          color="#ccc"
          @click.stop="deleteFile(item)"
        />
      </div>
      <van-empty v-if="!files.length" description="暂无附件数据"></van-empty>
    </div>
    <footer v-if="$route.query.readonly !== '1'">
      <van-uploader
        :max-size="10 * 1024 * 1024"
        :accept="fileAccept.join(',')"
        @oversize="onOversize"
        :after-read="onAfterRead"
      >
        <van-button type="primary" block round>上传附件</van-button>
      </van-uploader>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { useStore } from '@/store'
import { reject } from 'lodash-es'
import { fetchAttachment, uploadAttachment, flushAttachment } from '@/api/record'
import { pick } from 'lodash-es'
import useToast from '@/hooks/component/useToast'
import { downloadUrl } from '@/utils'
import { getBaseFullUrl } from '@/utils/url'
import { ImagePreview, Dialog } from 'vant'

const TOKEN = localStorage.getItem('INSUITE_TOKEN')

type FileType = 'image' | 'pdf' | 'word' | 'ppt' | 'excel' | 'others'
interface FileItem {
  id: number
  key: string
  name: string
  type: FileType
  coverImg: string
}

const FILE_ACCEPT = [
  'image/*',
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //.docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx,
  '.doc,.docx,.xls,.xlsx,.ppt,.pptx'
]

export default defineComponent({
  props: {
    visible: Boolean
  },

  setup(props) {
    const store = useStore()
    const { toast } = useToast()
    const files = ref<FileItem[]>([])
    let delFileIds: number[] = []
    let addFileIds: number[] = []
    const curRecord = computed(() => store.getters.curRecord)

    const loadData = async () => {
      if (curRecord.value) {
        const { model, res_id } = curRecord.value
        if (isNaN(+res_id)) return
        const res = await fetchAttachment(model, res_id)
        if (res.ret === 0) {
          const records = res.data?.records || []
          files.value = records.map((row: any) => {
            const type = getFileType(row.mimetype)
            return {
              ...pick(row, ['id', 'key', 'name']),
              type,
              coverImg: getCoverImg(type, row.id)
            } as FileItem
          })
        }
      }
    }

    const previewImg = (file: FileItem): void => {
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

    const deleteFile = (item: FileItem) => {
      Dialog.confirm({
        message: '是否确定删除附件 ' + item.name
      })
        .then(() => {
          const index = files.value.findIndex(file => file.id === item.id)
          ~index && files.value.splice(index, 1)
          if (addFileIds.includes(item.id)) {
            addFileIds = reject(addFileIds, item.id)
          } else {
            delFileIds.push(item.id)
          }
        })
        .catch(() => {})
    }

    const onAfterRead = async (data: any) => {
      if (files.value.length === 10) {
        toast.show('最多只能上传10个附件')
        return
      }

      const file = data.file as File
      if (file) {
        toast.loading('附件上传中')
        const res = await uploadAttachment(curRecord.value.model, file)
        toast.clear()
        if (res.ret === 0 && res.data.length) {
          const { id, filename, key, minetype } = res.data[0]
          const type = getFileType(minetype || file.type || file.name)
          const fileItem: FileItem = {
            id,
            key,
            type,
            name: filename,
            coverImg: getCoverImg(type, id)
          }
          files.value.unshift(fileItem)
          addFileIds.push(id)
        }
      }
    }

    const onOversize = () => {
      toast.show('文件大小不能超过10Mb')
    }

    const flush = async (recordID: number) => {
      await Promise.all([
        ...delFileIds.map(id => flushAttachment(id, +recordID, 'unlink')),
        ...addFileIds.map(id => flushAttachment(id, +recordID))
      ])
      delFileIds = addFileIds = []
    }

    watchEffect(() => {
      if (props.visible && !delFileIds.length && !addFileIds.length) {
        loadData()
      }
    })

    return {
      files,
      fileAccept: FILE_ACCEPT,
      previewImg,
      downloadFile,
      deleteFile,
      onAfterRead,
      onOversize,
      flush
    }
  }
})

function getFileType(mimetype: string): FileType {
  let type: FileType = 'others'
  if (/^image\//.test(mimetype)) {
    type = 'image'
  } else if (mimetype === 'application/pdf') {
    type = 'pdf'
  } else if (~mimetype.search('spreadsheetml') || /\.xls(x)?$/.test(mimetype)) {
    type = 'excel'
  } else if (~mimetype.search('presentationml') || /\.ppt(x)?$/.test(mimetype)) {
    type = 'ppt'
  } else if (~mimetype.search('wordprocessingml') || /\.doc(x)?$/.test(mimetype)) {
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
    return `/img/${type}.png`
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
    &::v-deep(.van-uploader) {
      display: block;
      .van-uploader__input-wrapper {
        width: 100%;
      }
    }
  }
}
</style>
