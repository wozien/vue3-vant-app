<template>
  <van-search 
    v-model="searchValue" 
    shape="round" 
    :placeholder="placeholder"
    :show-action="showAction"
  >
    <template v-if="showAction" #action>
      <Icon name="filter" @click="$emit('click-action')"/>
    </template>
  </van-search>
</template>

<script lang="ts">
import _ from 'lodash'
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import { getDomain } from './search-helper'

export default defineComponent({
  props: {
    placeholder: String,
    showAction: Boolean,
    searchFields: {
      type: Object as PropType<string[]>,
      default: () => []
    }
  },

  emits: ['click-action', 'search'],

  setup(props, { emit }) {
    const searchValue = ref('')
    const searchItems = computed(() => props.searchFields.map((name: string) => ({name, type: 'input'})))
    const valueChange = _.debounce((val) => {
      const domain = getSearchDomain(val)
      // console.log(domain)
      emit('search', domain)
    }, 600)

    const getSearchDomain = (val: string) => {
      const values = props.searchFields.reduce((res, key) => {
        res[key] = val
        return res
      } , {})
      return getDomain(values, searchItems.value)
    }

    watch(searchValue, val => {
      valueChange(val)
    })

    return {
      searchValue
    }
  }
})

</script>
