<template>
  <Page name="form-view">
    <div class="header van-hairline--bottom" v-show="isReadonly">
      <van-image :src="creator.avatar" width="40" height="40" round/>
      <div class="info">
        <p class="name">{{ creator.name }}</p>
        <p class="time">{{ `${creator.date} 发起` }}</p> 
      </div>
      <div class="right">
        <div class="icon">
          <Icon name="file" @click="onClickFile"/>
          <Icon name="message" @click="onClickMessage"/>
        </div>
        <span class="status">{{ state_name }}</span>
      </div>
    </div>
    <div class="form-canvas" :style="{'height': height + 'px'}">
      <FormCanvas :items="curView && curView.items" :fields="fields"/>
    </div>
    <ButtonView :buttons="curView && curView.buttons"/>
  </Page>
</template>

<script lang="ts">
import { 
  defineComponent, reactive, computed, watch, toRaw,
  toRefs, watchEffect, onMounted, onBeforeUnmount 
} from 'vue'
import _ from 'lodash'
import { useRoute } from 'vue-router'
import { Toast } from 'vant'
import { useStore } from '@/store'
import FormCanvas from './FormCanvas'
import ButtonView from '@/components/odoo-button/ButtonView.vue'
import { formatDate } from '@/assets/js/utils/date'
import { viewCommonProps } from '@/assets/js/hooks/view-common'
import { getRecordId } from '@/assets/js/class/DataPoint'
import { sessionStorageKeys } from '@/assets/js/constant'

export default defineComponent({
  components: {
    FormCanvas,
    ButtonView
  },

  props: {
    ...viewCommonProps
  },

  setup(props) {
    const route = useRoute()
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
    const searchFields = computed(() => {
      return props.fieldsInfo ? Object.keys(props.fieldsInfo) : []
    })
    const isReadonly = computed(() => route.query.readonly as string === '1')
    const height = computed(() => {
      const res = document.body.clientHeight - 50
      return isReadonly.value ? res - 70 : res
    })
    const curRecord = computed(() => store.getters.curRecord)

    const loadRecord = async () => {
      const loadParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.loadParams) || '{}')
      let { model, id } = loadParams
      if(!model) {
        model = route.query.model as string
        id = route.query.id as string
      }
      if(searchFields.value.length && model) {
        // datapoint load
        await store.dispatch('loadRecord', {
          modelName: model,
          res_id: id ? +id: undefined,
          viewType: 'form',
          fieldsInfo: toRaw(props.fieldsInfo)
        })
        setCurRecord()
      }
    }

    const setCurRecord = () => {
      const { model, id } = route.query
      if(model && id) {
        const recordId = getRecordId(model as string, id as string)
        recordId && store.commit('SET_CUR_RECORD', recordId)
      }
    }

    const onClickFile = () => Toast('暂不支持附件功能')
    const onClickMessage = () => Toast('暂不支持沟通记录功能')

    // 穿透表体切换当前的datapoint数据
    watchEffect(() => {
      setCurRecord()
    }) 

    watch(searchFields, val => {
      if(val.length) loadRecord()
    })

    watch(() => route.query.id, (val, oldVal) => {
      // 点击创建重新load数据
      if(!val && oldVal) {
        loadRecord()
      }
    })

    watch(curRecord, (val) => {
      if(val && val.creator) {
        data.creator = {
          name: val.creator.name,
          avatar: val.creator.avatar || '/img/mm1.jpeg',
          date: formatDate('M月d日 hh:mm', val.creator.date)
        }
        data.state = val.state
        data.state_name = val.state_name
      }
    })

    onMounted(() => {
      loadRecord()
    })

    onBeforeUnmount(() => {
      const loadParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.loadParams) || '{}')
      sessionStorage.setItem(sessionStorageKeys.loadParams, JSON.stringify(_.omit(loadParams, 'id')))
    })

    return {
      ...toRefs(data),
      isReadonly,
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
      .icon {
        text-align: right;
      }
      .status {
        color: @info-color;
        font-size: 13px;
      }
    }
  }
  .form-canvas {
    // height: calc(100vh - 120px);
    overflow: auto;
  }
}
</style>