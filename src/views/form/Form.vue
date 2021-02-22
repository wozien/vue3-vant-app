<template>
  <Page name="form-view">
    <div class="header van-hairline--bottom" v-show="showHeader">
      <van-image :src="creator.avatar" width="40" height="40" round/>
      <div class="info">
        <p class="name">{{ creator.name }}</p>
        <p class="time">{{ `${creator.date} 发起` }}</p> 
      </div>
      <div class="right">
        <van-image v-if="state === 'audit'" 
          :src="require('@/assets/img/audit.png')" width="45" height="45" round/>
        <div class="icons">
          <div class="icon">
            <Icon name="file" @click="onClickFile"/>
            <Icon name="message" @click="onClickMessage"/>
          </div>
          <span v-if="state !== 'audit'" class="status">{{ state_name }}</span>
        </div>
      </div>
    </div>
    <div class="form-canvas" :style="{'height': height + 'px'}">
      <FormCanvas :items="curView && curView.items" :fields="fields" ref="formRef"/>
    </div>
    <LineSwitcher v-show="showLineSwitcher"/>
    <ButtonView :buttons="curView && curView.buttons"/>
  </Page>
</template>

<script lang="ts">
import { 
  defineComponent, reactive, computed, watch, toRaw,
  toRefs, watchEffect, onMounted, onBeforeUnmount, provide, ref
} from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { Toast } from 'vant'
import { useStore } from '@/store'
import FormCanvas from './FormCanvas'
import ButtonView from '@/components/odoo-button/ButtonView.vue'
import LineSwitcher from '@/components/line-switcher/LineSwitcher.vue'
import { formatDate } from '@/assets/js/utils/date'
import { viewCommonProps } from '@/assets/js/hooks/view-common'
import { getRecordId } from '@/assets/js/class/DataPoint'
import { sessionStorageKeys } from '@/assets/js/constant'
import { load as loadDataPoint, clean as cleanRecord } from '@/assets/js/class/DataPoint'

export default defineComponent({
  components: {
    FormCanvas,
    ButtonView,
    LineSwitcher
  },

  props: {
    ...viewCommonProps
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
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
      return document.body.clientHeight - 50 - +(showHeader.value && 70) - +(showLineSwitcher.value && 50)
    })
    const curRecord = computed(() => store.getters.curRecord)

    const loadRecord = async (routeQuery?: Record<string, any>) => {
      let { model, id } = routeQuery || route.query
      if(searchFields.value.length && props.fieldsInfo) {
        // datapoint load
        await loadDataPoint({
          type: 'record',
          modelName: model as string,
          res_id: id ? +id: undefined,
          viewType: 'form',
          fieldsInfo: toRaw(props.fieldsInfo)
        })
        setCurRecord()
      }
    }

    const setCurRecord = () => {
      const { subModel, subId } = route.query
      if(subModel) {
        const recordId = getRecordId(subModel as string, subId as string)
        if(recordId) {
          store.commit('SET_CUR_RECORD', recordId)
        } else if(subId && (subId as string).startsWith('virtual_')){
          // 添加明细行后直接刷新，返回表头
          router.back()
        }
        
      } else {
        store.commit('RESET_CUR_RECORD')
        sessionStorage.removeItem(sessionStorageKeys.x2manyCommand)
      }
    }

    const onClickFile = () => Toast('暂不支持附件功能')
    const onClickMessage = () => Toast('暂不支持沟通记录功能')

    // 表体行表单返回主表单
    watchEffect(() => {
      setCurRecord()
    }) 

    watch(searchFields, val => {
      if(val.length) loadRecord()
    })

    watch(curRecord, (val) => {
      if(val && val.creator) {
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

    onBeforeRouteUpdate((to, from) => {
      // 在表单点击创建，重新load数据
      const { viewType: fromViewType, subId: fromSubId } = from.query
      const { viewType, id, subId } = to.query
      if(fromViewType === 'form' && viewType === 'form' && !id && !subId && !fromSubId) {
        loadRecord(to.query)
      }
    })

    onBeforeUnmount(() => {
      store.commit('SET_CUR_RECORD', '')
      cleanRecord()
    })

    provide('canBeSaved', () => {
      return formRef.value?.canBeSaved() && true
    })

    return {
      ...toRefs(data),
      formRef,
      showHeader,
      showLineSwitcher,
      height,
      localData: computed(() => store.state.localData),
      curRecordId: computed(() => store.state.curRecordId),
      curRecord,
      onClickFile,
      onClickMessage
    }
  }
})

</script>

<style lang="less" scoped>
.ins-form-view-page {
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