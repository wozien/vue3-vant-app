<template>
  <div class="user-selector">
    <van-tabs>
      <van-tab title="成员" name="member">
        <div class="selected" v-if="memberSelect.length">
          <van-tag
            v-for="item in memberSelect" 
            :key="item.id"
            color="#eee"
            text-color="#646566"
            size="large"
            closeable
            @close="onClickMemberItem(item)"
          >{{ item.name }}</van-tag>
        </div>
        <p v-else class="no-data">暂无数据</p>
        <div class="list-container">
          <van-index-bar :index-list="Object.keys(members)" highlight-color="#1989fa">
            <template v-for="(list, letter) in members" :key="letter">
              <van-index-anchor :index="letter" />
              <van-cell v-for="item in list" :title="item.name" :key="item.key" @click="onClickMemberItem(item)"/>
            </template>
          </van-index-bar>
        </div>
      </van-tab>

      <van-tab title="角色" name="role">
        <div class="selected" v-if="roleSelect.length">
          <van-tag
            v-for="item in roleSelect" 
            :key="item.id"
            color="#eee"
            text-color="#646566"
            size="large"
            closeable
            @close="onClickRoleItem(item)"
          >{{ item.name }}</van-tag>
        </div>
        <p v-else class="no-data">暂无数据</p>
        <div class="list-container">
          <van-index-bar :index-list="Object.keys(roles)" highlight-color="#1989fa">
            <template v-for="(list, letter) in roles" :key="letter">
              <van-index-anchor :index="letter" />
              <van-cell v-for="item in list" :title="item.name" :key="item.key" @click="onClickRoleItem(item)"/>
            </template>
          </van-index-bar>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, toRefs, PropType, watchEffect, watch } from 'vue'
import { fetchCompanyUsers } from '@/api/workflow'

interface ListItem {
  id: string
  name: string
  full_char: string
  [key: string]: any
}

export default defineComponent({
  props: {
    selected: {
      type: Object as PropType<{members: ListItem[], roles: ListItem[]}>,
      default: () => ({members: [], roles: []})
    }
  },

  emits: ['update:selected'],

  setup(props, { emit }) {
    const state = reactive({
      members: {},
      roles: {},
      memberSelect: [] as ListItem[],
      roleSelect: [] as ListItem[]
    })

    const onClickMemberItem = (item: any) => {
      const index = state.memberSelect.findIndex(mb => mb.id === item.id)
      if(index > -1) {
        state.memberSelect.splice(index, 1)
      } else {
        state.memberSelect.push(item)
      }
    }

    const onClickRoleItem = (item: any) => {
      const index = state.roleSelect.findIndex(rl => rl.id === item.id)
      if(index > -1) {
        state.roleSelect.splice(index, 1)
      } else {
        state.roleSelect.push(item)
      }
    }

    onMounted(async () => {
      const flowParams = JSON.parse(sessionStorage.getItem('FLOW_PARAMS') || '{}')
      const res = await fetchCompanyUsers(flowParams)
      if(res.ret === 0) {
        const data = res.data
        state.members = formatList(data.memberList)
        state.roles = formatList(data.roleList)
      } 
    })

    watchEffect(() => {
      state.memberSelect = props.selected.members
      state.roleSelect = props.selected.roles
    })

    watch(() => state.memberSelect, (val) => {
      emit('update:selected', {
        members: val,
        roles: state.roleSelect
      })
    })

    watch(() => state.roleSelect, (val) => {
      emit('update:selected', {
        members: state.memberSelect,
        roles: val
      })
    })
                    
    return {
      ...toRefs(state),
      onClickMemberItem,
      onClickRoleItem
    }
  }
})

/**
 * 格式话列表
 */
function formatList(list: ListItem[]) {
  const res = {} as any
  for(let item of list) {
    const firstChar = item.full_char.charAt(0).toLocaleUpperCase();
    (res[firstChar] || (res[firstChar] = [])).push(item)
  }
  return res
}
</script>

<style lang="less" scoped>
.user-selector{
  height: 100%;
  // todo 为啥tab_line定位不对
  /deep/ .van-tabs .van-tabs__line {
    transform: translateX(94px) translateX(-50%);
  }
  .selected {
    margin: 10px;
    height: 40px;
    border-radius: 4px;
    background: #fff;
    padding: 6px 10px;
    /deep/ .van-tag {
      margin-right: 6px;
    }
  }
  .no-data {
    font-size: 13px;
    padding: 10px;
    text-align: center;
    color: @text-color-light-1;
  }
  .list-container {
    height: calc(100vh - 168px);
    overflow: auto;
  }
}
</style>