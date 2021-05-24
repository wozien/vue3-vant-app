<template>
  <div class="form-chat">
    <header>沟通记录</header>
    <div class="messages" ref="messageRef">
      <div class="message-item" v-for="item in list" :key="item.id">
        <div class="info-header">
          <van-image :src="item.avatar" width="30" height="30" fit="cover" round />
          <div class="info">
            <p class="name">{{ item.author }}</p>
            <p class="time">{{ item.date }}</p>
          </div>
        </div>
        <div class="content" :class="item.self && 'self'">{{ item.content }}</div>
      </div>
      <van-empty v-if="!list.length" description="暂无沟通记录数据"></van-empty>
    </div>
    <footer>
      <input class="chat-input" v-model="message" placeholder="请输入..." />
      <span class="send-btn" @click="send">发送</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue'
import { useStore } from '@/store'
import { fetchFormChats, postFormMessage, formMessageFormat } from '@/api/record'
import { getApp } from '@/logics/class/App'
import { formatDate, str2Date } from '@/utils/date'
import { isAbsoluteURL } from '@/utils'
import templateRef from '@/hooks/core/templateRef'

export default defineComponent({
  props: {
    visible: Boolean
  },

  setup(props) {
    const curApp = getApp()
    const store = useStore()
    const message = ref('')
    const list = ref<any[]>([])
    const messageRef = templateRef<HTMLElement>('messageRef')
    const curRecord = computed(() => store.getters.curRecord)
    const user = computed(() => store.state.user)

    const loadData = async () => {
      if (curRecord.value && curApp) {
        const { model, res_id } = curRecord.value
        const res = await fetchFormChats(model, res_id, curApp.actionId)
        if (res.ret === 0) {
          list.value = res.data.map((row: any) => {
            const data = formatServerData(row)
            data.self = false
            if (user.value) {
              data.self = user.value.phone === data.login
            }
            return data
          })
        }
      }
    }

    const send = async () => {
      if (message.value) {
        const { model, res_id } = curRecord.value
        const res = await postFormMessage(model, res_id, message.value)
        if (res.ret === 0) {
          const result = await formMessageFormat(res.data)
          if (result.ret === 0) {
            const data = formatServerData(result.data[0])
            data.self = true
            data.avatar = user.value.avatar
            list.value.push(data)
            message.value = ''
            setTimeout(() => {
              setScroll(messageRef.value)
            }, 0)
          }
        }
      }
    }

    watchEffect(() => {
      if (props.visible) {
        loadData()
      }
    })

    return {
      list,
      message,
      send
    }
  }
})

function formatServerData(data: any) {
  const res = Object.create(null)
  Object.assign(res, {
    id: data.id,
    author: data.author,
    login: data.login
  })

  const match = data.body.match(/^<p>(.*)<\/p>$/)
  if (match.length > 1) {
    res.content = match[1]
  }

  if (data.author_id) {
    res.author = data.author_id[1]
  }
  res.date = formatDate('yyyy-MM-dd hh:mm', str2Date(data.date))
  res.avatar = isAbsoluteURL(data.src) ? data.src : '/img/avatar.png'
  return res
}

function setScroll(el: HTMLElement | null) {
  if (el) {
    el.scrollTop = el.scrollHeight - el.offsetHeight
  }
}
</script>

<style lang="less" scoped>
.form-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: @ins-bg-color;
  color: @ins-text-color-light-1;
  padding: 0px 6px;
  header,
  footer {
    flex: 0 0 auto;
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    .message-item {
      padding: 8px;
      .info-header {
        .user-info;
        .info {
          .name {
            font-size: 13px;
          }
        }
      }
      .content {
        background: #fff;
        border-radius: 8px;
        padding: 14px 10px;
        margin-left: 38px;
        margin-top: 8px;
        &.self {
          background: #e3edf9;
        }
      }
    }
  }
  header {
    padding: 10px 6px;
    border-bottom: @ins-border;
    color: @ins-text-color;
  }
  footer {
    padding: 10px 0px;
    border-top: @ins-border;
    .flex-center;
    .chat-input {
      flex: 1;
      .reset-input;
      padding: 10px 14px;
      border-radius: @ins-border-radius;
    }
    .send-btn {
      color: @ins-primary-color;
      padding: 0px 6px;
    }
  }
}
</style>
