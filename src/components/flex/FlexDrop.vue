<template>
  <div class="form-item-field" :data-dbname="field && field.name" :data-type="type">
    <van-field
      :label="string" 
      :placeholder="placeholder" 
      v-model="value"
      :required="isRequired"
      :clickable="!isReadonly"
      :is-link="!isReadonly"
      readonly
      center
      @click="onClickFlex"
    />

    <Modal v-model:show="showModal" @confirm="onConfirm">
      <FlexDropForm :flex-fields="flexFields" ref="flexFormRef"/>
    </Modal>
  </div>
</template>

<script lang="ts">
import { last } from 'lodash-es'
import { defineComponent, ref } from 'vue'
import { useStore } from '@/store'
import useFieldCommon, { fieldCommonProps } from '@/assets/js/hooks/field-common'
import { findDataPoint, getRecordData, notifyChanges } from '@/assets/js/class/DataPoint'
import { Toast } from 'vant'
import { fetchFlexFields } from '@/api/record'
import FlexDropForm from './FlexDropForm'

export default defineComponent({
  components: {
    FlexDropForm
  },

  props: {
    ...fieldCommonProps
  },

  setup(props) {
    const store = useStore()
    const { string, placeholder, type, value, isReadonly, isRequired, curRecord, setValue } = useFieldCommon(props, store)
    const showModal = ref(false)
    const flexFields = ref<any[]>([])
    const flexFormRef = ref()
    let oldDependId: any

    const onClickFlex = async () => {
      if(isReadonly.value) return;
      const attrs = props.item?.attrs || {}
      if(attrs.depend_field) {
        const domain = [...getDependDomain(attrs.depend_field, curRecord.value.id), curRecord.value.model]
        
        if(domain[1] && domain[1] !== oldDependId) {
          const toast = Toast.loading({ forbidClick: true })
          const res = await fetchFlexFields(domain)
          if(res.ret === 0) {
            flexFields.value = res.data
            showModal.value = true
          }
          toast.clear()
        }
      } else {
        Toast('请先选择关联字段')
      }
    }

    const onConfirm = async (cb: Function) => {
      const changes = flexFormRef.value.getChanges()
      // console.log(changes)
      // emit onchange
      await notifyChanges(curRecord.value.id, {
        [props.field?.name as string]: changes.names,
        flex: changes.flex
      })
      store.commit('SET_RECORD_TOKEN')
      cb()
    }

    return {
      string,
      placeholder,
      type,
      value,
      isReadonly,
      isRequired,
      setValue,
      curRecord,
      showModal,
      flexFields,
      flexFormRef,
      onClickFlex,
      onConfirm
    }
  }
})

function getDependDomain(depend: string, recordID: string): any[] {
  const deps = depend.split('.')
  let len = deps.length

  while(--len && recordID) {
    const record = findDataPoint(recordID)
    if(record) {
      recordID = record.parentId as string
    }
  }

  const data = getRecordData(recordID, last(deps) as string)
  return data ? [data.model, data.res_id] : []
}

</script>
