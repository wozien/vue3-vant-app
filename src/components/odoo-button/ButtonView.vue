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
import { defineComponent, PropType, computed, ref, watchEffect, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { Toast } from 'vant'
import { ViewButton } from '@/assets/js/class'
import { callButton } from '@/api/odoo'
import { createModal } from '@/components/modal'
import { flowAgreen } from '@/api/workflow'
import Button from './Button.vue'

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
    const renderButtons = ref<ViewButton[]>([])
    const capsuleButtons = computed(() => {
      return renderButtons.value.slice(0, 4)
    })
    const moreButtons = computed(() => {
      return renderButtons.value.slice(4).map((item: any) => {
        item.text = item.string
        return item
      })
    })

    // 按钮点击入口
    const onButtonClick = async (button: string | ViewButton) => {
      if(typeof button === 'string') {
        button = renderButtons.value.find((btn: ViewButton) => btn.key === button) as ViewButton
      }

      if(button.type === 'event') {
        // TODO 前端写死的按钮
      } else if(button.type === 'object') {
        // call_button
        const { model, id } = route.query
        if(button && model && id) {
          const args = [[+id]]
          const toast = Toast.loading('加载中...')
          const res = await callButton(model as string, button.funcName, args)
          toast.clear()
          if(res.ret === 0) {
            const action = res.data
            handleServiceAction(action, button)
          }
        }
      }
    }

    const onSelect = (item: any) => onButtonClick(item)

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
  // TODO 按钮domain和权限控制

  const mode = readonly === '1' ? 'readonly' : 'more'
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
    if(button.isFlow) {
      handleWorkflowAction(action, button)
    }
  }
}

/**
 * 处理审批按钮
 */
function handleWorkflowAction(action: any, button: ViewButton) {
  switch(button.funcName) {
    case 'workflow_handle':
      handleFlowAgree(action, button); break
  }
}

/**
 * 获取当前审批单据信息
 */
function getFlowParams() {
  const params = JSON.parse(sessionStorage.getItem('FLOW_PARAMS') || '{}')
  return {
    bill_id: params.billId,
    bill_number: params.billNumber,
    task_id: params.taskId,
    process_id: params.processId,
    type: params.type
  }
}

/**
 * 审批同意
 */
function handleFlowAgree(action: any, button: ViewButton) {
  console.log(action, button)
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
    const res = await flowAgreen(state.opinion, Object.assign(action.context || {}, getFlowParams()))
    if(res.ret === 0) {
      Toast('审批成功'); cb()
    } else {
      cb(true)
    }
  }

  createModal({ render, confirm })
}

</script>

<style lang="less">
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
    /deep/ .van-button--small {
      padding: 0px 16px;
      margin-left: 6px;
    }
  }
}
</style>