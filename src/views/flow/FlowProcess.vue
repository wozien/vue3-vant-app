<template>
  <div class="flow-process">
    <van-tabs v-model:active="active">
      <van-tab title="流程日志" name="log" />
      <van-tab title="流程图" name="diagram" />
    </van-tabs>
    <!-- van-tab lazy render effect hack -->
    <div class="flow-diagram" v-if="active === 'diagram'">
      <div class="tips">
        <span class="done">已通过节点</span>
        <span class="current">当前节点</span>
        <span>未经过节点</span>
      </div>
      <div class="canvas" ref="canvas"></div>
    </div>
    <div class="flow-log" v-else-if="active === 'log' && list.length">
      <div class="list">
        <div
          v-for="item in list"
          :key="item.nodeId"
          :class="['list-item', item.state && `list-item-${item.state}`]"
        >
          <h2 class="title">{{ item.nodeName }}</h2>
          <div class="content">
            <p>
              {{ item.time }} {{ item.person }}
              <span class="state">{{
                item.state === 'done' ? '审批通过' : item.state === 'returned' ? '审批驳回' : ''
              }}</span>
            </p>
            <p class="opinion" v-if="item.options">{{ item.options }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="no-data">暂无数据</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, onBeforeMount, reactive, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import BpmnJS from 'bpmn-js/lib/Modeler'
import { formatDate } from '@/utils/date'
import { Dialog } from 'vant'
import { callButton } from '@/api/odoo'
import { sessionStorageKeys } from '@/logics/enums/cache'

export default defineComponent({
  name: 'FlowProcess',
  setup() {
    const route = useRoute()
    const state = reactive({
      options: {} as any,
      list: [] as any[],
      active: 'log'
    })
    const canvas = ref(null)

    onBeforeMount(async () => {
      const { model, id } = route.query
      if (model && id) {
        const flowParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.flowParams) || '{}')
        const res = await callButton(model as string, 'workflow_view', [[+id]], {
          context: flowParams
        })
        if (res.ret === 0 && res.data?.args?.length) {
          state.options = res.data.args[0] || {}
        }
      }
    })

    watchEffect(() => {
      if (canvas.value && state.options?.xml) {
        initBpmn(canvas.value, state.options)
      }
    })

    watchEffect(() => {
      if (state.options?.nodelist) {
        state.list = state.options.nodelist.map((item: any) => {
          const date = new Date(item.time.replace(/-/g, '/'))
          const state = item.state == undefined ? '' : item.state ? 'done' : 'returned'
          return {
            ...item,
            state,
            time: formatDate('M-d hh:mm', date)
          }
        })
      }
    })

    return {
      canvas,
      ...toRefs(state)
    }
  }
})

//  bpmn logic
let viewer: any

async function initBpmn(container: any, options: any) {
  container.innerHTML = ''
  viewer = new BpmnJS({ container })

  try {
    await viewer.importXML(options.xml)
    viewer.get('canvas').zoom('fit-viewport', 'center')
    setColor(options)
    disabledEvent()
    bindEvent(container, options)
  } catch (err) {
    // const { warnings, message } = err
    // console.warn('something went wrong:', warnings, message)
  }
}

function setColor(options: any) {
  const colors = {
    default: '#c8c9cc',
    done: '#07c160',
    current: '#1989fa'
  }
  setDefaultColor(colors.default)
  options.oldNodeId && setNodeColor(options.oldNodeId, colors.done)
  options.currentNodeId && setNodeColor(options.currentNodeId, colors.current)
}

function setDefaultColor(color: any) {
  const elements = viewer.get('elementRegistry')._elements
  const nodeObj = { shape: [] }
  for (let key in elements) {
    const element = elements[key].element
    classifyNode(nodeObj, element)
  }
  changeColor(nodeObj, color)
}

function setNodeColor(nodeIds: any, color: any) {
  const registry = viewer.get('elementRegistry')
  const nodeObj = { shape: [] }
  nodeIds.forEach((id: any) => {
    const element = registry.get(id)
    classifyNode(nodeObj, element)
  })
  changeColor(nodeObj, color)
}

function classifyNode(nodeObj: any, element: any) {
  if (element.type === 'bpmn:EndEvent') {
    nodeObj.end = element
  } else if (element.type === 'bpmn:StartEvent') {
    nodeObj.start = element
  } else {
    nodeObj.shape.push(element)
  }
}

function changeColor(nodeObj: any, color: any) {
  const modeling = viewer.get('modeling')
  nodeObj.start && modeling.setColor(nodeObj.start, { stroke: color })
  nodeObj.end && modeling.setColor(nodeObj.end, { stroke: color })
  nodeObj.shape.length && modeling.setColor(nodeObj.shape, { stroke: color })
}

function disabledEvent() {
  const eventBus = viewer.get('eventBus')
  const disableEvents = [
    'element.click',
    'element.dblclick',
    'shape.move.end',
    'shape.move',
    'shape.move.start',
    'shape.move.hover',
    'shape.move.move',
    'contextPad.create',
    'contextPad.getProviders',
    'connect.move',
    'bendpoint.move.move',
    'bendpoint.move.start',
    'bendpoint.move.out',
    'bendpoint.move.hover',
    'bendpoint.move.end',
    'bendpoint.move.cleanup',
    'bendpoint.move.cancel',
    'connectionSegment.move.move',
    'connectionSegment.move.start',
    'connectionSegment.move.out',
    'connectionSegment.move.hove',
    'connectionSegment.move.end',
    'connectionSegment.move.cleanup',
    'connectionSegment.move.cancel'
  ]
  eventBus.off(disableEvents, null)
}

function showNodeInfo(nodeInfos: any) {
  const getMessage = (nodeInfo: any) => {
    return `    审核人: ${nodeInfo.person}
    ${
      nodeInfo.time
        ? `审核时间: ${nodeInfo.time}
    审核状态: ${nodeInfo.state ? '审核通过' : '审核驳回'}`
        : ''
    }
    `
  }
  const message = nodeInfos.map(getMessage).join('\n')
  setTimeout(() => {
    Dialog({
      message,
      messageAlign: 'left'
    })
  }, 200)
}

function bindEvent(container: any, options: any) {
  if (options.nodes) {
    options.nodes.forEach((node: any) => {
      const elem = container.querySelector(`[data-element-id=${node.nodeId}]`)
      elem &&
        elem.addEventListener('touchstart', () => {
          showNodeInfo(node.nodeinfo)
        })
    })
  }
}
</script>

<style lang="less">
.flow-process {
  height: 100%;
  // todo 为啥tab_line定位不对
  .van-tabs .van-tabs__line {
    transform: translateX(94px) translateX(-50%);
  }

  .flow-diagram {
    height: calc(100vh - 44px);
    .tips {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      color: @ins-text-color-light-2;
      font-size: 13px;
      span {
        &::before {
          display: inline-block;
          content: '';
          width: 13px;
          height: 13px;
          background: #c8c9cc;
          margin-right: 6px;
          transform: translateY(2px);
        }
        &.done::before {
          background: #07c160;
        }
        &.current::before {
          background: #1989fa;
        }
      }
    }
    .canvas {
      height: calc(100vh - 84px);

      .bjs-powered-by {
        display: none;
      }
    }
  }

  .flow-log {
    height: calc(100vh - 44px);
    overflow: auto;
    .list {
      .list-item {
        background: #fff;
        margin: 10px;
        border-radius: 3px;
        padding: 10px;
        font-size: 13px;
        color: @ins-text-color-light-1;
        .title {
          color: @ins-text-color;
          font-size: 14px;
          &::before {
            display: inline-block;
            content: '';
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 6px;
            background: @ins-text-color-light-2;
          }
        }

        .content {
          padding: 10px;
          .opinion {
            margin-top: 10px;
            padding: 10px;
            background: #eee;
            border-radius: 4px;
          }
          .state {
            padding-left: 10px;
          }
        }

        &.list-item-done {
          .title::before {
            background: @ins-success-color;
          }
          .content .state {
            color: @ins-success-color;
          }
        }
        &.list-item-returned {
          .title::before {
            background: @ins-error-color;
          }
          .content .state {
            color: @ins-error-color;
          }
        }
      }
    }
  }
}
</style>
