<template>
  <Page name="company-list">
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
  </Page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter} from 'vue-router'
import { useStore } from '@/store'
import { Toast } from 'vant'
import { fetchCompanyList, switchCompany } from '@/api/user'

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
    const store = useStore()

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
        if(companyList.value.length) {
          active.value = localStorage.getItem('CUR_COMPANY') || companyList.value[0]?.dbName
        }
      }
    })

    const onSwitchCompany = async () => {
      Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载企业数据...'
      })
      localStorage.setItem('CUR_COMPANY', active.value)
      const activeCompany = companyList.value.find(item => item.dbName === active.value)
      if(activeCompany) {
        const res = await switchCompany(activeCompany.dbName, activeCompany.oauthUrl)
        if(res.ret === 0) {
          store.commit('SET_USER_COMPANY', activeCompany.name)
          router.push('/dashboard')
        }
        Toast.clear()
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
.ins-company-list-page {
  .title {
    color: @text-color-light-1;
    padding: 16px 20px;
    font-size: 14px;
  }
  .list {
    padding: 0px 20px;
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
    padding: 20px;
  }
}
</style>