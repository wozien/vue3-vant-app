<template>
  <div class="company-list-page">
    <p class="title">您的账号加入了 {{ companyList.length }} 个企业</p>
    <div class="list">
      <div
        v-for="item in companyList"
        :key="item.dbName"
        :class="['list-item', active === item.dbName && 'list-item-active']"
        @click="active = item.dbName"
      >
        <Icon name="company" />
        <span class="name">{{ item.name }}</span>
      </div>
      <div class="list-item create-btn" v-if="companyList.length < 5" @click="showCreate = true">
        <van-icon name="plus" />创建企业
      </div>
    </div>
    <div class="footer">
      <van-button type="primary" block round @click="onSwitchCompany">进入企业</van-button>
    </div>

    <!-- create -->
    <van-popup
      class="create-popup"
      v-model:show="showCreate"
      position="bottom"
      :duration="0.2"
      round
    >
      <h2 class="title">创建企业</h2>
      <van-field
        label="企业名"
        v-model="newCompany.name"
        placeholder="请输入企业名"
        left-icon="company"
        icon-prefix="ins-icon"
      />
      <van-field
        label="企业类型"
        v-model="newCompany.type"
        placeholder="请选择企业类型"
        left-icon="company-type"
        icon-prefix="ins-icon"
        is-link
        readonly
        @click="onClickPopup('type')"
      />
      <van-field
        label="企业规模"
        v-model="newCompany.size"
        placeholder="请选择企业规模"
        left-icon="company-size"
        icon-prefix="ins-icon"
        is-link
        readonly
        @click="onClickPopup('size')"
      />

      <div class="footer">
        <van-button round block @click="onCancel">取消</van-button>
        <van-button type="primary" round block @click="onCreate">确定</van-button>
      </div>
    </van-popup>

    <!-- picker -->
    <van-popup v-model:show="showPicker" position="bottom" :duration="0.2" round>
      <van-picker :columns="columns" @cancel="showPicker = false" @confirm="onConfirm" />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import { fetchCompanyList, switchCompany, createCompany } from '@/api/user'
import useToast from '@/hooks/component/useToast'

interface Company {
  name: string
  dbName: string
  oauthUrl: string
}

export default defineComponent({
  setup() {
    const companyList = ref<Company[]>([])
    const active = ref('')
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { toast } = useToast()
    const {
      showCreate,
      newCompany,
      showPicker,
      columns,
      onConfirm,
      onCancel,
      onClickPopup,
      create
    } = useCreateCompany()

    onMounted(async () => {
      const res = await fetchCompanyList()
      if (res.ret === 0 && res.data?.length) {
        companyList.value = res.data.map((item: any) => {
          const { db_name, oauth2_login_url, company_name, expire_date } = item
          return {
            name: company_name,
            dbName: db_name,
            oauthUrl: oauth2_login_url,
            expire: new Date(expire_date).getTime()
          }
        })
        const len = companyList.value.length
        if (len) {
          active.value = store.state.user.company.dbName || companyList.value[0]?.dbName
          if (len === 1 && !route.query.keepSwitch) {
            onSwitchCompany()
          }
        }
      }
    })

    const onSwitchCompany = async () => {
      if (!companyList.value.length) {
        toast.show('暂无企业列表数据')
        return
      } else if (!active.value) {
        toast.show('请先选择一个企业')
        return
      }

      toast.loading('载入企业数据')
      const activeCompany = companyList.value.find(item => item.dbName === active.value)
      if (activeCompany) {
        const res = await switchCompany(activeCompany.dbName, activeCompany.oauthUrl)
        if (res.ret === 0) {
          router.push('/dashboard')
        }
        toast.clear()
      }
    }

    const onCreate = async () => {
      const result = await create()
      if (result) {
        companyList.value.push(result)
        showCreate.value = false
        toast.loading('载入企业数据')
        const res = await switchCompany(result.dbName, result.oauthUrl)
        if (res.ret === 0) {
          router.push('/dashboard')
        }
        toast.clear()
      }
    }

    return {
      companyList,
      active,
      showCreate,
      showPicker,
      newCompany,
      columns,
      onSwitchCompany,
      onConfirm,
      onCancel,
      onClickPopup,
      onCreate
    }
  }
})

function useCreateCompany() {
  const { toast } = useToast()
  const showCreate = ref(false)
  const showPicker = ref(false)
  const listType = ref('type')
  const newCompany = reactive({
    name: '',
    type: '',
    size: ''
  })
  const typeList = [
    '计算机服务业',
    '制造业',
    '建筑业',
    '交通运输业',
    '批发零售业',
    '金融保险业',
    '服务业',
    '其它'
  ]
  const sizeList = ['少于5人', '5到20人', '20到50人', '50到200人', '大于200人']
  const columns = computed(() => (listType.value === 'type' ? typeList : sizeList))

  const onConfirm = (val: string) => {
    if (listType.value === 'type') {
      newCompany.type = val
    } else {
      newCompany.size = val
    }
    showPicker.value = false
  }

  const onCancel = () => {
    newCompany.name = newCompany.size = newCompany.type = ''
    showCreate.value = false
  }

  const onClickPopup = (type: string) => {
    listType.value = type
    showPicker.value = true
  }

  const create = async () => {
    const { name, size, type } = newCompany
    if (!name || !size || !type) {
      toast.show('企业信息填写不全')
      return
    }
    if (/^[A-Za-z\u4e00-\u9fa5]{4,50}$/.test(name) === false) {
      toast.show('公司名称不得少于4个字，不支持数字和特殊字符')
      return
    }
    toast.loading('创建企业中...')
    const res = await createCompany(name, type, size)
    if (res.ret === 0 && res.data.code == 200) {
      toast.clear()
      const { db_name, oauth2_login_url } = res.data.msg
      return {
        name: newCompany.name,
        dbName: db_name,
        oauthUrl: oauth2_login_url
      }
    }
  }

  return {
    showCreate,
    showPicker,
    columns,
    newCompany,
    onConfirm,
    onCancel,
    onClickPopup,
    create
  }
}
</script>

<style lang="less" scoped>
.company-list-page {
  .title {
    color: @ins-text-color-light-1;
    padding: 12px 20px;
    font-size: 14px;
  }
  .list {
    padding: 0px 20px;
    height: calc(100vh - 110px);
    overflow: auto;
    .list-item {
      display: flex;
      align-items: center;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 3px;
      margin-bottom: 10px;
      background: white;
      position: relative;
      .name {
        font-size: 13px;
        color: @ins-text-color-light-1;
      }
      &-active {
        border-color: @ins-primary-color;
        &::before {
          content: '';
          display: block;
          position: absolute;
          width: 12px;
          height: 12px;
          top: 0;
          right: 10px;
          background: @ins-primary-color;
        }
        &::after {
          content: '';
          position: absolute;
          display: block;
          width: 0px;
          border: 6px solid transparent;
          border-top-color: @ins-primary-color;
          top: 12px;
          right: 10px;
        }
      }
    }
    .create-btn {
      .flex-center;
      justify-content: center;
      font-size: 13px;
      color: @ins-text-color-light-1;
      padding-top: 10px;
      &::v-deep(.van-icon) {
        margin-right: 4px;
      }
    }
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 6px 20px 14px;
  }

  &::v-deep(.create-popup) {
    height: 90%;
    .title {
      background: #f7f8fa;
      text-align: center;
      color: @ins-text-color;
    }

    .footer {
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
}
</style>
