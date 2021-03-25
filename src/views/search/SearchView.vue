<template>
  <div class="search-view">
    <div class="search-form">
      <div class="form-item"
        v-for="item in searchItems"
        :key="item.name"
      >
        <label class="form-item__label">{{ item.label }}</label>
        <!-- input -->
        <div v-if="item.type === 'input'" class="form-item__input form-item--border">
          <input type="text" v-model="values[item.name]" :placeholder="item.placeholder">
        </div>
        <!-- date-range -->
        <div v-else-if="item.type === 'date_range'" class="form-item__range">
          <div class="date-node form-item--border">
            <span :class="[!values[item.name].start && 'phld']" @click="onClickDateNode('start', item.name)">
              {{ values[item.name].start  || '选择时间' }}
            </span>
            <van-icon name="arrow-down"></van-icon>
          </div>
          <span class="spec"> - </span>
          <div class="date-node form-item--border">
            <span :class="[!values[item.name].end && 'phld']"  @click="onClickDateNode('end', item.name)">
              {{ values[item.name].end || '选择时间' }}
            </span>
            <van-icon name="arrow-down"></van-icon>
          </div>
        </div>
        <div v-else-if="item.type === 'selection'" class="form-item__selection">
          <span v-for="btn in item.options" 
          :key="btn.key"
          :class="['btn', values[item.name] === btn.key && 'active']"
          @click="values[item.name] = btn.key"
          >{{ btn.string }}</span>
        </div> 
      </div>
    </div>
    <div class="search-footer">
      <van-button round block @click="onReset">重置</van-button>
      <van-button type="primary" round block @click="onSearch">筛选</van-button>
    </div>

    <!-- datepicker -->
    <van-popup v-model:show="showPicker" position="bottom" teleport="body" round>
      <van-datetime-picker 
        type="date"
        v-model="dateValue" 
        @cancel="showPicker = false" 
        @confirm="onConfirm"/>
    </van-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, toRefs } from 'vue'
import { searchItems, getDefaultValues, getDomain } from './search-helper'
import { Fields } from '@/logics/types'
import { formatDate } from '@/utils/date'

export default defineComponent({
  props: {
    fields: Object as PropType<Fields>
  },

  emits: ['search'],

  setup(props, { emit }) {
    const values = reactive(getDefaultValues())
    const dateState = reactive({
      showPicker: false,
      dateValue: new Date(),
      currentNode: {} as any
    })

    const onSearch = () => {
      const searchValues: any = {}
      for(let fieldName in values) {
        const field = props.fields?.[fieldName]
        field && (searchValues[fieldName] = values[fieldName])
      }
      const domain = getDomain(searchValues, searchItems)
      emit('search', domain)
    }

    const onReset = () => {
      const defaultValue = getDefaultValues();
      for(let fieldName in defaultValue) {
        values[fieldName] = defaultValue[fieldName]
      }
    }

    const onClickDateNode = (node: string, fieldName: string) => {
      dateState.currentNode = { node, fieldName }
      dateState.showPicker = true
      const value = values[fieldName]
      dateState.dateValue = value[node] ? new Date(value[node]) : new Date()
    }

    const onConfirm = () => {
      const { node, fieldName } = dateState.currentNode
      values[fieldName][node] = formatDate('yyyy-MM-dd', dateState.dateValue)
      dateState.showPicker = false
    }

    return {
      values,
      searchItems,
      formatDate,
      ...toRefs(dateState),
      onSearch,
      onReset,
      onClickDateNode,
      onConfirm
    }
  }
})


</script>

<style lang="less" scoped>
.search-view {
  height: 100%;
  position: relative;
  .search-form {
    padding: 10px 0px;
    .form-item {
      padding: 6px 16px 6px 10px;
      color: @text-color;
      font-size: 13px;
      &__label {
        display: inline-block;
        margin-bottom: 8px;
        padding-left: 6px;
        color: @text-color-light-1;
        font-size: 14px;
      }
      &__input {
        padding: 5px 10px;
        > input {
          box-sizing: border-box;
          margin: 0;
          border: none;
          outline: none;
          width: 100%;
          &::placeholder {
            color: @text-color-light-2;
          }
        }
      }
      &__selection {
        > span {
          display: inline-block;
          padding: 6px 12px;
          color: @text-color-light-1;
          border: @border;
          margin-right: 9px;
          margin-bottom: 6px;
          border-radius: 20px;
          &.active {
            color: #fff;
            background: @primary-color;
            border-color: @primary-color;
          }
        }
      }
      &__range {
        display: flex;
        align-items: center;
        > .date-node { 
          flex: 1;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          min-height: 30px;
          > span { 
            flex: 1; 
            &.phld {
              color: @text-color-light-2;
            }
          }
        }
        > .spec {
          margin: 0px 6px;
        }
      }
      &--border {
        border-radius: 20px;
        border: @border;
      }
    }
  }
  .search-footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 10px;
    display: flex;
    .van-button {
      height: 38px;
      margin: 0px 4px;
      &:first-child {
        flex: 0 0 100px;
      }
    }
  }
}
</style>