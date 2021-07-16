<template>
  <div class="form-view">
    <div class="header van-hairline--bottom" v-show="showHeader">
      <van-image :src="creator.avatar" width="40" height="40" fit="cover" round />
      <div class="info">
        <p class="name">{{ creator.name }}</p>
        <p class="time">{{ `${creator.date} 发起` }}</p>
      </div>
      <div class="right">
        <van-image
          v-if="state === 'audit'"
          @click="toProcessView"
          :src="imgUrl"
          width="45"
          height="45"
          round
        />
        <div class="icons">
          <div class="icon">
            <Icon
              v-if="curModel && curModel.type === 'document'"
              name="related"
              @click="openPopup('related')"
            />
            <Icon name="file" @click="openPopup('attachment')" />
            <Icon name="message" @click="openPopup('chat')" />
          </div>
          <p v-if="state !== 'audit'" class="status" @click="toProcessView">{{ state_name }}</p>
        </div>
      </div>
    </div>
    <div class="form-canvas" :style="{ height: height + 'px' }">
      <FormCanvas :items="curView && curView.items" :fields="fields" ref="formRef" />
    </div>
    <LineSwitcher v-show="showLineSwitcher" />
    <ButtonView :buttons="curView && curView.buttons" />

    <van-popup
      v-model:show="showPopup"
      position="bottom"
      :style="{ height: '95%' }"
      :duration="0.2"
      :close-on-popstate="true"
      closeable
      round
    >
      <FormChat v-if="popupType === 'chat'" :visible="showPopup"></FormChat>
      <FormRelated v-else-if="popupType === 'related'" :visible="showPopup"></FormRelated>
      <FormAttachment v-else :visible="showPopup" ref="attachRef"></FormAttachment>
    </van-popup>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  watch,
  toRaw,
  toRefs,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  provide,
  ref
} from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { Dialog } from 'vant'
import { useStore } from '@/store'
import FormCanvas from './FormCanvas'
import ButtonView from '@/components/odoo-button/ButtonView.vue'
import LineSwitcher from '@/components/line-switcher/LineSwitcher.vue'
import FormChat from './FormChat.vue'
import FormAttachment from './FormAttachment.vue'
import FormRelated from './FormRelated.vue'
import { formatDate } from '@/utils/date'
import { viewCommonProps } from '@/hooks/component/useView'
import { getRecordId } from '@/logics/core/dataPoint'
import { sessionStorageKeys } from '@/logics/enums/cache'
import { load as loadDataPoint, clean as cleanRecord, isDirty } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'
import imgUrl from '@/assets/img/audit.png'

export default defineComponent({
  components: {
    FormCanvas,
    ButtonView,
    LineSwitcher,
    FormChat,
    FormAttachment,
    FormRelated
  },

  props: {
    ...viewCommonProps
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { toast } = useToast()
    const { showPopup, popupType, openPopup } = useFormPopup()

    const data = reactive({
      creator: {
        name: '',
        avatar: '',
        date: ''
      },
      state: '',
      state_name: ''
    })
    const formRef = ref()
    const attachRef = ref()
    const searchFields = computed(() => {
      return props.fieldsInfo ? Object.keys(props.fieldsInfo) : []
    })
    const showHeader = computed(() => {
      const { readonly, subModel } = route.query
      return readonly === '1' && !subModel
    })
    const showLineSwitcher = computed(() => {
      return !!route.query.subModel
    })
    const height = computed(() => {
      return (
        document.body.clientHeight -
        50 -
        +(showHeader.value && 70) -
        +(showLineSwitcher.value && 50)
      )
    })
    const curRecord = computed(() => store.getters.curRecord)

    const loadRecord = async (routeQuery?: Record<string, any>) => {
      let { model, id } = routeQuery || route.query
      if (searchFields.value.length && props.fieldsInfo) {
        toast.loading('数据加载中...')
        // datapoint load
        await loadDataPoint({
          type: 'record',
          modelName: model as string,
          res_id: id ? +id : undefined,
          viewType: 'form',
          fieldsInfo: toRaw(props.fieldsInfo)
        })
        setCurRecord()
        toast.clear()
      }
    }

    const setCurRecord = () => {
      const subModel = route.query.subModel as string
      const subId = route.query.subId as string
      if (subModel) {
        const recordId = getRecordId(subModel, subId)
        if (recordId) {
          store.commit('SET_CUR_RECORD', recordId)
        } else if (subId && subId.startsWith('virtual_')) {
          // 添加明细行后直接刷新，返回表头
          router.back()
        }
      } else {
        store.commit('RESET_CUR_RECORD')
        sessionStorage.removeItem(sessionStorageKeys.x2manyCommand)
      }
    }

    const toProcessView = () => {
      const { type } = route.query
      if (!type) return
      router.push({
        name: 'flow-process',
        query: Object.assign({}, route.query)
      })
    }

    // 表体行表单返回主表单
    watchEffect(() => {
      setCurRecord()
    })

    watch(searchFields, val => {
      if (val.length) loadRecord()
    })

    watch(curRecord, val => {
      if (val && val.creator) {
        data.creator = {
          name: val.creator.name,
          avatar: val.creator.avatar || '/img/avatar.png',
          date: formatDate('M月d日 hh:mm', val.creator.date)
        }
        data.state = val.state
        data.state_name = val.state_name
      }
    })

    onMounted(() => {
      loadRecord()
    })

    onBeforeRouteUpdate(async (to, from) => {
      const { viewType: fromViewType, id: fromId, subId: fromSubId } = from.query
      const { viewType, id, subId } = to.query
      if (fromViewType === 'form') {
        if (viewType === 'list' && route.query.readonly === '0') {
          // 表单回到列表,校验是否又未保存操作
          const dirty = isDirty(curRecord.value.id)
          if (dirty) {
            const bool = await Dialog.confirm({
              message: '是否确定放弃表单修改？',
              closeOnPopstate: false
            })
              .then(() => true)
              .catch(() => false)
            return bool
          }
        }

        if (viewType === 'form') {
          if (!id && !subId && !fromSubId) {
            // 点击创建
            loadRecord(to.query)
          } else if (id && fromId && id !== fromId && to.query.model === from.query.model) {
            // 同个模型下的关联查看
            loadRecord(to.query)
          }
        }
      }
    })

    onBeforeUnmount(() => {
      store.commit('SET_CUR_RECORD', '')
      cleanRecord()
    })

    const canBeSaved = () => formRef.value?.canBeSaved() && true
    provide('canBeSaved', canBeSaved)
    provide('openPopup', openPopup)
    provide('flushAttach', (recordID: number) => {
      if (attachRef.value) {
        attachRef.value.flush(recordID)
      }
    })

    return {
      ...toRefs(data),
      formRef,
      attachRef,
      showHeader,
      showLineSwitcher,
      height,
      localData: computed(() => store.state.localData),
      curRecordId: computed(() => store.state.curRecordId),
      curRecord,
      imgUrl,
      showPopup,
      popupType,
      toProcessView,
      openPopup
    }
  }
})

function useFormPopup() {
  const showPopup = ref(false)
  const popupType = ref('')

  const openPopup = (type: string) => {
    popupType.value = type
    showPopup.value = true
  }

  onBeforeRouteUpdate(() => {
    if (showPopup.value) {
      showPopup.value = false
    }
  })

  return {
    showPopup,
    popupType,
    openPopup
  }
}
</script>

<style lang="less" scoped>
.form-view {
  height: 100%;
  .header {
    height: 70px;
    background: #fff;
    padding: 0px 14px;
    .user-info;

    .right {
      display: flex;
      align-items: center;
      .icons {
        margin-left: 10px;
        .icon {
          text-align: right;
        }
        .status {
          color: @ins-info-color;
          font-size: 13px;
          text-align: right;
          padding-right: 8px;
          padding-top: 2px;
        }
      }
    }
  }
  .form-canvas {
    // height: calc(100vh - 120px);
    overflow: auto;
  }

  &::v-deep(.van-popup__close-icon) {
    font-size: 16px;
  }
  &::v-deep(.van-popup__close-icon--top-right) {
    top: 10px;
    right: 12px;
  }
}
</style>
