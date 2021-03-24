<template>
  <div class="company-list-page">
    <p class="title">
      您的账号加入了 {{ companyList.length }} 个企业
    </p>
    <div class="list">
      <div 
        v-for="item in companyList" 
        :key="item.dbName"
        :class="['list-item', active === item.dbName && 'list-item-active']"
        @click="active=item.dbName"
      >
        <Icon name="company" />
        <span class="name">{{ item.name }}</span>
      </div>
    </div>
    <div class="footer">
      <van-button type="primary" block round @click="onSwitchCompany">进入企业</van-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import { fetchCompanyList, switchCompany } from '@/api/user'
import useToast from '@/hooks/component/useToast'

interface Company {
  name: string;
  dbName: string;
  oauthUrl: string;
}

export default defineComponent({

  setup() {
    const companyList = ref<Company[]>([])
    const active = ref('')
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { toast } = useToast()

    onMounted(async () => {
      const res = await fetchCompanyList()
      if(res.ret === 0 && res.data?.length) {
        companyList.value = res.data.map((item: any) => {
          const { db_name, oauth2_login_url, company_name } = item
          return {
            name: company_name,
            dbName: db_name,
            oauthUrl: oauth2_login_url
          }
        })
        const len = companyList.value.length 
        if(len) {
          active.value = store.state.user.company.dbName || companyList.value[0]?.dbName
          if(len === 1 && !route.query.keepSwitch) {
            onSwitchCompany()
          }
        }
      }
    })

    const onSwitchCompany = async () => {
      if(!companyList.value.length) {
        toast.show('暂无企业列表数据'); return
      } else if(!active.value) {
        toast.show('请先选择一个企业'); return
      }

      toast.loading('载入企业数据')
      const activeCompany = companyList.value.find(item => item.dbName === active.value)
      if(activeCompany) {
        const res = await switchCompany(activeCompany.dbName, activeCompany.oauthUrl)
        if(res.ret === 0) {
          router.push('/dashboard')
        }
        toast.clear()
      }
    }

    return {
      companyList,
      active,
      onSwitchCompany
    }
  }
})
</script>

<style lang="less" scoped>
.company-list-page {
  .title {
    color: @text-color-light-1;
    padding: 16px 20px;
    font-size: 14px;
  }
  .list {
    padding: 0px 20px;
    height: calc(100vh - 116px);
    overflow: auto;
    .list-item {
      display: flex;
      align-items: center;
      padding: 10px;
      border: 1px solid #eee;
      margin-bottom: 10px;
      background: white;
      position: relative;
      .name {
        font-size: 14px;
        color: @text-color-light-1;
      }
      &-active {
        border-color: @primary-color;
        &::before {
          content: "";
          display: block;
          position: absolute;
          width: 12px;
          height: 12px;
          top: 0;
          right: 10px;
          background: @primary-color;
        }
        &::after {
          content: "";
          position: absolute;
          display: block;
          width: 0px;
          border: 6px solid transparent;
          border-top-color: @primary-color;
          top: 12px;
          right: 10px;
        }
      }
    }
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 10px 20px;
  }
}
</style>