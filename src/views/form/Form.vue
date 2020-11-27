<template>
  <Page name="form-view">
    <div class="header van-hairline--bottom" v-show="$route.query.readonly == 1">
      <van-image :src="creator.avatar" width="40" height="40" round/>
      <div class="info">
        <p class="name">{{ creator.name }}</p>
        <p class="time">{{ `${creator.date} 发起` }}</p> 
      </div>
      <div class="right">
        <div class="icon">
          <Icon name="file"/>
          <Icon name="message"/>
        </div>
        <span class="status">{{ record && record.state }}</span>
      </div>
    </div>
    <div class="form-canvas">
      <FormCanvas :items="curView && curView.items"/>
    </div>
    <div class="button-wrapper van-hairline--top">
      <van-button size="small" round>编辑</van-button>
      <van-button type="primary" size="small" round>提交</van-button>
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, PropType, watch, onMounted } from 'vue'
import { Record, Field, View, Model } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import FormCanvas from './FormCanvas'
import { fetchRecord } from '@/api/app'
import { formatDate } from '@/assets/js/utils/date'

export default defineComponent({
  components: {
    FormCanvas
  },

  props: {
    viewFields: {
      type: Array as PropType<Field[]>
    },
    curView: Object as PropType<View>,
    curModel: Object as PropType<Model>
  },

  setup(props) {
    const route = useRoute()
    const record = ref<Record | null>(null)
    const creator = reactive({
      name: '',
      avatar: '',
      date: ''
    })
    const searchFields = computed(() => {
      let res: string[] = []
      if(props.viewFields?.length) {
        for(let field of props.viewFields) {
          if(field && field.name) res.push(field.name)
        }
      }
      return res
    })

    const loadRecord = async () => {
      const { model, id } = route.query
      if(searchFields.value.length && model && id) {
        const res = await fetchRecord(model as string, +id, searchFields.value)
        record.value = new Record(res.data)
      }
    }

    watch(searchFields, val => {
      if(val.length) loadRecord()
    })

    watch(record, (val) => {
      if(val && val.creator) {
        creator.name = val.creator.name
        creator.avatar = val.creator.avatar || '/img/mm1.jpeg'
        creator.date = formatDate('M月d日 hh:mm', val.creator.time)
      }
    })

    onMounted(() => {
      loadRecord()
    })

    return {
      record,
      creator,
      searchFields
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
    height: calc(100vh - 120px);
    overflow: auto;
  }
  .button-wrapper {
    height: 50px;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0px 10px;
    /deep/ .van-button--small {
      padding: 0px 16px;
      margin-left: 6px;
    }
  }
}
</style>