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
          <Icon name="file"/>
          <Icon name="message"/>
        </div>
        <span class="status">{{ record && record.state }}</span>
      </div>
    </div>
    <div class="form-canvas" :style="{'height': height + 'px'}">
      <FormCanvas :items="curView && curView.items" :record="record" :view-fields="viewFields"/>
    </div>
    <ButtonView :buttons="curView && curView.buttons"/>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, PropType, watch, onMounted } from 'vue'
import { Record, Field, View, Model } from '@/assets/js/class'
import { useRoute, useRouter } from 'vue-router'
import FormCanvas from './FormCanvas'
import ButtonView from '@/components/odoo-button/ButtonView.vue'
import { fetchRecord } from '@/api/app'
import { formatDate } from '@/assets/js/utils/date'

export default defineComponent({
  components: {
    FormCanvas,
    ButtonView
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
    const router = useRouter()
    const record = ref<Record>()
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
    const isReadonly = computed(() => route.query.readonly as string === '1')
    const height = computed(() => {
      const res = document.body.clientHeight - 50
      return isReadonly.value ? res - 70 : res
    })

    const loadRecord = async () => {
      const { model, id } = route.query
      if(searchFields.value.length && model && id) {
        const res = await fetchRecord(model as string, +id, searchFields.value)
        record.value = new Record(res.data)
      }
    }

    const onEditForm = () => {
      router.push({
        name: 'view',
        query: Object.assign({}, route.query, {
          readonly: 0
        })
      })
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
      isReadonly,
      searchFields,
      height,
      onEditForm
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