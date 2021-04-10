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
          :src="require('@/assets/img/audit.png')"
          width="45"
          height="45"
          round
        />
        <div class="icons">
          <div class="icon">
            <Icon name="file" @click="onClickFile" />
            <Icon name="message" @click="onClickMessage" />
          </div>
          <span v-if="state !== 'audit'" class="status" @click="toProcessView">{{
            state_name
          }}</span>
        </div>
      </div>
    </div>
    <div class="form-canvas" :style="{ height: formContentHeight + 'px' }">
      <FormCanvas :items="curView && curView.items" :fields="fields" ref="formRef" />
    </div>
    <LineSwitcher v-show="showLineSwitcher" />
    <ButtonView :buttons="curView && curView.buttons" />
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
  ref,
} from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { useStore } from '@/store'
import FormCanvas from './FormCanvas'
import ButtonView from '@/components/odoo-button/ButtonView.vue'
import LineSwitcher from '@/components/line-switcher/LineSwitcher.vue'
import { formatDate } from '@/helpers/date'
import { viewCommonProps } from '@/hooks/component/useView'
import { getRecordId } from '@/logics/core/dataPoint'
import { sessionStorageKeys } from '@/logics/enums/cache'
import { load as loadDataPoint, clean as cleanRecord, isDirty } from '@/logics/core/dataPoint'
import useToast from '@/hooks/component/useToast'
import { isWechatAgent } from '@/helpers/utils'

export default defineComponent({
  components: {
    FormCanvas,
    ButtonView,
    LineSwitcher,
  },

  props: {
    ...viewCommonProps,
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { toast } = useToast()

    const data = reactive({
      creator: {
        name: '',
        avatar: '',
        date: '',
      },
      state: '',
      state_name: '',
    })
    const formRef = ref()
    const formContentHeight = ref(0)
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
    const curRecord = computed(() => store.getters.curRecord)

    const calcHeight = () => {
      const headerHeight = showHeader.value ? 70 : 0
      const switchLineHeight = showLineSwitcher.value ? 50 : 0
      const buttonHeight = 50
      formContentHeight.value =
        document.body.clientHeight - headerHeight - switchLineHeight - buttonHeight
    }

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
          fieldsInfo: toRaw(props.fieldsInfo),
        })
        setCurRecord()
        toast.clear()
      }
    }

    const setCurRecord = () => {
      const { subModel, subId } = route.query
      if (subModel) {
        const recordId = getRecordId(subModel as string, subId as string)
        if (recordId) {
          store.commit('SET_CUR_RECORD', recordId)
        } else if (subId && (subId as string).startsWith('virtual_')) {
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
        query: Object.assign({}, route.query),
      })
    }

    const onClickFile = () => Toast('暂不支持附件功能')
    const onClickMessage = () => Toast('暂不支持沟通记录功能')

    // 表体行表单返回主表单
    watchEffect(() => {
      setCurRecord()
    })

    watchEffect(() => {
      if (isWechatAgent({ iphone: true })) {
        setTimeout(() => {
          calcHeight()
        }, 0)
      } else calcHeight()
    })

    watch(searchFields, (val) => {
      if (val.length) loadRecord()
    })

    watch(curRecord, (val) => {
      if (val && val.creator) {
        data.creator = {
          name: val.creator.name,
          avatar: val.creator.avatar || '/img/avatar.png',
          date: formatDate('M月d日 hh:mm', val.creator.date),
        }
        data.state = val.state
        data.state_name = val.state_name
      }
    })

    onMounted(() => {
      loadRecord()
    })

    onBeforeRouteUpdate(async (to, from) => {
      const { viewType: fromViewType, subId: fromSubId } = from.query
      const { viewType, id, subId } = to.query
      if (fromViewType === 'form') {
        if (viewType === 'list' && route.query.readonly === '0') {
          // 表单回到列表,校验是否又未保存操作
          const dirty = isDirty(curRecord.value.id)
          if (dirty) {
            const bool = await Dialog.confirm({
              message: '是否确定放弃表单修改？',
              closeOnPopstate: false,
            })
              .then(() => true)
              .catch(() => false)
            return bool
          }
        }

        if (viewType === 'form' && !id && !subId && !fromSubId) {
          // 点击创建
          loadRecord(to.query)
        }
      }
    })

    onBeforeUnmount(() => {
      store.commit('SET_CUR_RECORD', '')
      cleanRecord()
    })

    const canBeSaved = () => formRef.value?.canBeSaved() && true
    provide('canBeSaved', canBeSaved)

    return {
      ...toRefs(data),
      formRef,
      showHeader,
      showLineSwitcher,
      formContentHeight,
      localData: computed(() => store.state.localData),
      curRecordId: computed(() => store.state.curRecordId),
      curRecord,
      toProcessView,
      onClickFile,
      onClickMessage,
    }
  },
})
</script>

<style lang="less" scoped>
.form-view {
  height: 100%;
  .header {
    height: 70px;
    background: #fff;
    padding: 0px 14px;
    display: flex;
    align-items: center;
    .info {
      flex: 1;
      padding: 0px 10px;
      .name {
        font-size: 14px;
        color: @text-color-light-1;
        margin-bottom: 2px;
      }
      .time {
        font-size: 12px;
        color: @text-color-light-2;
      }
    }
    .right {
      display: flex;
      align-items: center;
      .icons {
        margin-left: 10px;
        .icon {
          text-align: right;
        }
        .status {
          color: @info-color;
          font-size: 13px;
        }
      }
    }
  }
  .form-canvas {
    // height: calc(100vh - 120px);
    overflow: auto;
  }
}
</style>
