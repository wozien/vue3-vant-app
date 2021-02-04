<template>
  <div class="ins-button-wrapper van-hairline--top">
    <van-popover 
      v-if="moreButtons.length"
      v-model:show="showPopover" 
      :actions="moreButtons" 
      placement="top-start"
      @select="onSelect"
    >
      <template #reference>
        <van-icon name="ellipsis" />
        <!-- <van-button size="small" round>更多</van-button>  -->
      </template>
    </van-popover>

    <div class="button-capsules">
      <Button 
        v-for="(button, index) in capsuleButtons" 
        :key="button.key" 
        :button="button"
        :is-primary="index === 0"
        @click="onButtonClick"
      />
    </div>
  </div>
</template>

<script lang="tsx">
import { defineComponent, PropType, computed, ref, watchEffect, reactive, toRaw, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import store, { useStore } from '@/store'
import { Toast, Dialog } from 'vant'
import { ViewButton } from '@/assets/js/class'
import { callButton } from '@/api/odoo'
import { createModal } from '@/components/modal'
import { flowAgreen, flowReturn, flowSign, flowCirculate } from '@/api/workflow'
import Button from './Button.vue'
import FlowSign from '@/views/flow/FlowSign.vue'
import FlowProcess from '@/views/flow/FlowProcess.vue'
import UserSelect from '@/components/user-picker/UserSelect.vue'
import { 
  save, isDirty, isNew, discardChanges, rootID, notifyChanges, 
  findDataPoint, DataPoint, copyRecord, get, reload
} from '@/assets/js/class/DataPoint'
import { sessionStorageKeys } from '@/assets/js/constant'
import { deleteRecord } from '@/api/record'

export default defineComponent({
  components: {
    Button
  },

  props: {
    buttons: {
      type: Object as PropType<ViewButton[]>,
      default: () => []
    }
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const renderButtons = ref<ViewButton[]>([])
    const capsuleButtons = computed(() => {
      return renderButtons.value.slice(0, 3)
    })
    const moreButtons = computed(() => {
      return renderButtons.value.slice(3).map((item: any) => {
        item.text = item.string
        return item
      })
    })
    const curRecord = computed(() => store.getters.curRecord)
    const canBeSaved = inject<Function>('canBeSaved')

    // 按钮点击入口
    const onButtonClick = async (button: string | ViewButton) => {

      if(typeof button === 'string') {
        button = renderButtons.value.find((btn: ViewButton) => btn.key === button) as ViewButton
      }

      button.loading = true
      if(button.type === 'event') {
        // 前端写死的按钮
        switch(button.funcName) {
          case 'edit':
            onEdit(); break
          case 'save':
            await onSave(); break
          case 'cancel':
            onCancel(); break
          case 'create': 
            onCreate(); break
          case 'copy': 
            await onCopy(); break
          case 'back':
            router.back(); break
          case 'saveLine':
            onSaveLine(); break
          case 'insertLine': 
            await onInsertLine(); break
          case 'newLine':
            await onNewLine(); break
          case 'deleteLine':
            onDeleteLine(); break
          case 'copyLine':
            await onCopyLine(); break

        }
      } else if(button.type === 'object') {    
        // call_button
        const { model, id } = route.query
        if(button && model && id) {
          const args = [[+id]]
          const toast = Toast.loading('加载中...')
          const res = await callButton(model as string, button.funcName, args, Object.assign({}, {context: getFlowParams()}))
          toast.clear()
          if(res.ret === 0) {
            const action = res.data
            
            if(button.funcName === 'svc_std_pre_physical_delete') {
              // 删除特殊处理
              onDelete(action);
            } else {
              handleServiceAction(action, button)
              await reload()
              store.commit('SET_RECORD_TOKEN')
            }
          }
        }
      }

      button.loading = false
    }

    const onSelect = (item: any) => onButtonClick(item)

    // 编辑
    const onEdit = () => {
      router.replace({
        name: 'view',
        query: Object.assign({}, route.query, {
          readonly: 0
        })
      })
    }
    // 保存
    const onSave = async () => {
      const canSaved = canBeSaved && canBeSaved(); 
      if(!canSaved) {
        Toast('存在必录项未填'); return;
      }
      const res = await save(store.state.curRecordId)
      let query = Object.assign({}, route.query, { readonly: 1 })
      if(res === true || res.ret === 0) {
        Toast('保存成功')
        if(res !==true && res.data &&  (!query.id || (query.id as string).startsWith('virtual_'))) {
          store.commit('SET_RECORD_TOKEN')
          query.id = res.data
        }
        router.replace({
          name: 'view',
          query
        })
      }
    }
    // 行保存
    const onSaveLine = () => {
      const canSaved = canBeSaved && canBeSaved(); 
      if(!canSaved) {
        Toast('存在必录项未填'); return;
      }
      router.back()
    }
    // 取消
    const onCancel = () => {
      const recordId = curRecord.value.id
      const dirty = isDirty(recordId)
      const back = () => {
        const isNewRecord = isNew(recordId)
        if(isNewRecord) {
          router.back()
        } else {
          router.replace({
            name: 'view',
            query: Object.assign({}, route.query, {
              readonly: 1
            })
          })
        }
      }

      if(dirty) {
        Dialog.confirm({
          message: '是否确定放弃表单修改？'
        }).then(() => {
          discardChanges(recordId)
          store.commit('SET_RECORD_TOKEN')
          back()
        }).catch(() => {})
      } else {
        back()
      }
    }
    // 创建
    const onCreate = () => {
      const loadParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.loadParams) || '{}')
      sessionStorage.setItem(sessionStorageKeys.loadParams, JSON.stringify(_.omit(loadParams, 'id')))

      router.replace({
        name: 'view',
        query: {
          model: route.query.model,
          viewType: 'form',
          id: ''
        }
      })
    }
    // 删除
    const onDelete = (action: any) => {
      const record = curRecord.value
      Dialog.confirm({
        message: '确实是否删除该表单记录?'
      }).then(async () => {
        const res = await deleteRecord(record.model, record.res_id, action.context || {})
        if(res.ret === 0) {
          Toast('删除成功')
          router.back()
        }
      }).catch(() => {})
    }
    // 复制
    const onCopy = async () => {
      const record = await copyRecord(curRecord.value.id)
      store.commit('SET_RECORD_TOKEN')
      router.replace({
        name: 'view',
        query: Object.assign({}, route.query, {
          readonly: 0,
          id: record.res_id
        })
      })
    }
    // 行插入
    const onInsertLine = async () => {
      const list = get(curRecord.value.parentId)
      const rowIndex = _.findIndex((list as any).data || [], (record: any) => record.id === curRecord.value.id)
      await onNewLine(rowIndex !== -1 ? +rowIndex : undefined)
    }
    // 保存并新增
    const onNewLine = async (rowIndex?: number) => {
      const field = getX2MField()
      if(field) {
        const command: any = {
          operation: 'CREATE'
        }
        rowIndex !== undefined && (command.position = rowIndex)
        await notifyChanges(rootID, { [field.name]: command })
        const list = get(curRecord.value.parentId)
        if(list) {
          const resIds = (list as any).res_ids || []
          const id = rowIndex !== undefined ? resIds[rowIndex] : _.last(resIds)
          if(id) {
            router.replace({
              name: 'view',
              query: Object.assign({}, route.query, {
                subId: id
              })
            })
          }
        }
      }
    }
    // 行删除
    const onDeleteLine = async () => {
      const field = getX2MField()
      if(field) {
        // ignore m2m
        await notifyChanges(rootID, {
          [field.name]: {
            operation: 'DELETE',
            ids: [curRecord.value.id]
          }
        })
        router.back()
      }
    }
    // 行复制
    const onCopyLine = async () => {
      const field = getX2MField()
      if(field) {
        await notifyChanges(rootID, {
          [field.name]: {
            operation: 'COPY_O2M',
            id: curRecord.value.id
          }
        })
        const list = get(curRecord.value.parentId)
        if(list) {
          const id = _.last((list as any).res_ids || [])
          if(id) {
            router.replace({
              name: 'view',
              query: Object.assign({}, route.query, {
                subId: id
              })
            })
          }
        }
      }
    }
  
    const getX2MField = () => {
      const subModel = route.query.subModel as string
      const record = findDataPoint(rootID) as DataPoint
      if(record) {
        const fieldsInfo = record.fieldsInfo
        const field = _.find(_.values(fieldsInfo), { relation: subModel })
        return field
      }
    }

    watchEffect(() => {
      const res = calcButtons(props.buttons, route.query.readonly as string)
      renderButtons.value = res
    })

    return {
      showPopover: ref(false),
      capsuleButtons,
      moreButtons,
      onButtonClick,
      onSelect
    }
  }
})

/**
 * 计算显示的按钮
 */
function calcButtons(buttons: ViewButton[], readonly: string): ViewButton[]{
  const mode = readonly === '1' ? 'readonly' : 'edit'
  // TODO visible domain 计算
  return buttons.filter((btn: ViewButton) => btn.mode === mode)
}

/**
 * 处理服务器返回的action
 */
function handleServiceAction(action: any, button: ViewButton) {
  if('notify_toast' in action) {
    const message = action.notify_toast.message
    Toast(message)
  } else if(action.type === 'ir.actions.act_window' && action.target === 'new') {
    // 返回向导视图
    if(button.isFlow) {
      handleWorkflowAction(action, button)
    }
  } else if(action.type === 'ir.actions.cus_function') {
    switch(action.funcName) {
      case '_handleSign': 
        handleFlowSign(action); break
      case '_handleConsult':
        handleFlowConsult(action); break
      case '_handleViewProcess':
        handleFlowViewProcess(action); break
      default:
        Toast('暂不支持'); break
    }
  } else {
    Toast('暂不支持')
  }
}

/**
 * 处理审批按钮
 */
function handleWorkflowAction(action: any, button: ViewButton) {
  switch(button.funcName) {
    case 'workflow_handle':
      handleFlowAgree(action); break
    case 'workflow_back_getInfo':
      handleFlowReturn(action); break
  }
}

/**
 * 获取当前审批单据信息
 */
function getFlowParams() {
  const params = JSON.parse(sessionStorage.getItem(sessionStorageKeys.flowParams) || '{}')
  return params
}

/**
 * 审批同意
 */
function handleFlowAgree(action: any) {
  const state = reactive({
    opinion: ''
  })
  const render = () => (
    <van-field v-model={state.opinion} rows="4" label="审批意见" type="textarea" maxlength="50"
    placeholder="请输入审批意见" show-word-limit autosize/>
  )
  const confirm = async (cb: Function) => {
    if(!state.opinion) {
      Toast('审批意见不能为空'); cb(true); return
    }
    const res = await flowAgreen(state.opinion, Object.assign(getFlowParams(), action.context || {}))
    if(res.ret === 0) {
      await reload()
      store.commit('SET_RECORD_TOKEN')
      Toast('审批成功'); cb()
    } 
  }

  createModal({ render, confirm, hideFooter: false })
}

/**
 * 审批打回
 */
function handleFlowReturn(action: any) {
  const context = action.context
  const nodes = (context?.res?.res || []).map((item: any) => {
    const pairs = Object.entries(item)
    if(pairs.length) {
      return {
        key: pairs[0][0],
        value: pairs[0][1]
      }
    }
  })
  const columns = nodes.map((node: any) => node.value)
  const state = reactive({
    node: '',
    nodeKey: '',
    opinion: '',
    showPicker: false
  })
  const onSelectNode = (val: string) => {
    const node = nodes.find((item: any) => item.value === val)
    if(node) {
      state.node = node.value
      state.nodeKey = node.key
      state.showPicker = false
    }
  }

  const render = () => (
    <div>
      <van-field v-model={state.node} label="退回节点" readonly is-link placeholder="请选择节点" onClick={()=>state.showPicker=true}/>
      <van-field v-model={state.opinion} rows="4" label="打回意见" type="textarea" maxlength="50"
      placeholder="请输入打回意见" show-word-limit autosize/>
      <van-popup v-model={[state.showPicker, 'show']} position="bottom" round>
        <van-picker columns={columns} onConfirm={onSelectNode} onCancel={() => state.showPicker=false} />
      </van-popup>
    </div>
  )

  const confirm = async (cb: Function) => {
    if(!state.nodeKey) {
      Toast('退回节点不能为空'); cb(true); return
    }
    const res = await flowReturn(state.nodeKey, state.opinion, Object.assign(getFlowParams(), context))
    if(res.ret === 0) {
      await reload()
      store.commit('SET_RECORD_TOKEN')
      Toast('退回成功'); cb()
    } 
  }

  createModal({ render, confirm, hideFooter: false })
}

/**
 * 流程加签
 */
function handleFlowSign(action: any) {
  const signRef = ref(null)
  const render = () => <FlowSign ref={signRef}/>

  const confirm = async (cb: Function) => {
    if(signRef.value) {
      const data = (signRef.value as any).getData()
      let errorMsg = '';
      if(!data || !data.type) {
        errorMsg = '请选择加签方式'
      } else if(!data.receiver) {
        errorMsg = '请选择接收人'
      }

      if(errorMsg) {
        Toast(errorMsg); cb(true); return
      }
      const res = await flowSign(data.type, data.selected, Object.assign(action.context || {}, getFlowParams()))
      if(res.ret === 0) {
        Toast('加签成功'); cb()
      }
    }
  }

  createModal({ render, confirm, hideFooter: false })
}

/**
 * 流程传阅
 */
function handleFlowConsult(action: any) {
  const state = reactive({
    selected: { members: [], roles: [] }
  })
  const render = () => {
    return <UserSelect v-model={[state.selected, 'selected']}/>
  }

  const confirm = async (cb: Function) => {
    const selected = toRaw(state.selected)
    if(!selected.members || !selected.members.length) {
      Toast('请选择传阅人'); cb(true); return
    }
    const res = await flowCirculate(selected, Object.assign(action.context || {}, getFlowParams()))
    if(res.ret === 0) {
      Toast('传阅成功'); cb()
    }
  }

  createModal({ render, confirm, hideFooter: false })
}

/**
 * 查看全流程
 */
function handleFlowViewProcess(action: any) {
  const params = action.args[0] || {}
  const render = () => {
    return <FlowProcess options={params}/>
  }
  const confirm = () => {}

  createModal({ render, confirm, hideFooter: true })
}

</script>

<style lang="less" scoped>
.ins-button-wrapper {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  .more {
    flex: 0 0 50px;
  }
 
  .button-capsules {
    flex: 1;
    display: flex;
    flex-direction: row-reverse;
    // justify-content: flex-end;
    &::v-deep(.van-button--small) {
      padding: 0px 16px;
      margin-left: 6px;
    }
  }
}
</style>