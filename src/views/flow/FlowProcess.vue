<template>
  <div class="flow-process">
    <van-tabs v-model:active="active">
      <van-tab title="流程日志" name="log"/>
      <van-tab title="流程图" name="diagram"/>
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
        <div v-for="item in list" :key="item.nodeId" :class="['list-item', item.state && 'list-item-done']">
          <h2 class="title">{{ item.nodeName }}</h2>
          <div class="content">
            <p> {{ item.time }} {{ item.person }} <span class="state">{{ item.state ? '审批通过' : '审批驳回' }}</span></p>
            <p class="opinion">{{ item.options }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="no-data">暂无数据</p>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue'
import BpmnJS from 'bpmn-js/lib/Modeler'
import { formatDate } from '@/assets/js/utils/date'

export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },

  setup(props) {
    const canvas = ref(null)
    const list = ref([])
    const active = ref('log')

    watchEffect(() => {
      if(canvas.value && props.options.xml) {
        initBpmn(canvas.value, props.options)
      }
    })

    watchEffect(() => {
      if(props.options.nodelist) {
        list.value = props.options.nodelist.map(item => {
          const date = new Date(item.time.replace(/-/g, '/'))
          return {
            ...item,
            time: formatDate('M-d hh:mm', date)
          }
        })
      }
    })

    return {
      canvas,
      list,
      active
    }
  }
}

//  bpmn logic
let viewer

async function initBpmn(container, options) {
  container.innerHTML = ''
  viewer = new BpmnJS({ container })

  try {
    await viewer.importXML(options.xml)
    viewer.get('canvas').zoom('fit-viewport', 'center')
    setColor(options)
    disabledEvent(options)
    bindEvent(container, options)
  } catch(err) {
    const { warnings, message } = err
    console.warn('something went wrong:', warnings, message)
  }
}

function setColor(options) {
  const colors = {
    default: '#c8c9cc',
    done: '#07c160',
    current: '#1989fa'
  }
  setDefaultColor(colors.default)
  options.oldNodeId && setNodeColor(options.oldNodeId, colors.done)
  options.currentNodeId && setNodeColor(options.currentNodeId, colors.current)
}

function setDefaultColor(color) {
  const elements = viewer.get('elementRegistry')._elements
  const nodeObj = { shape: [] }
  for(let key in elements) {
    const element = elements[key].element
    classifyNode(nodeObj, element)
  }
  changeColor(nodeObj, color)
}

function setNodeColor(nodeIds, color) {
  const registry = viewer.get('elementRegistry')
  const nodeObj = { shape: [] }
  nodeIds.forEach(id => {
    const element = registry.get(id)
    classifyNode(nodeObj, element)
  })
  changeColor(nodeObj, color)
}

function classifyNode(nodeObj, element) {
  if(element.type === 'bpmn:EndEvent') {
    nodeObj.end = element
  } else if(element.type === 'bpmn:StartEvent') {
    nodeObj.start = element
  } else {
    nodeObj.shape.push(element)
  }
}

function changeColor(nodeObj, color) {
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
                        ];                   
  eventBus.off(disableEvents, null)
}

function bindEvent(container, options) {
  if(options.nodes) {
    options.nodes.forEach(node => {
      const elem = container.querySelector(`[data-element-id=${node.nodeId}]`)
      elem && elem.addEventListener('touchend', () => {
        console.log(node.nodeId)
      })
    })
  }
}

</script>

<style lang="less">
.flow-process{
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
      color: @text-color-light-2;
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

      .bjs-powered-by{
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
        color: @text-color-light-1;
        .title {
          color: @text-color;
          font-size: 14px;
          &::before {
            display: inline-block;
            content: '';
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: @error-color;
            margin-right: 6px;
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
            color: @error-color;
            padding-left: 10px;
          }
        }

        &.list-item-done {
          .title::before {
            background: @success-color
          }
          .content .state {
            color: @text-color-light-1;
          }
        }
      }
    }
  }
}
</style>