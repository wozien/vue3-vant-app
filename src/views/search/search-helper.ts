
import Domain from '@/assets/js/odoo/Domain'
import pyUtils from '@/assets/js/odoo/py_utils'

const arrayToString = Domain.prototype.arrayToString
const stringToArray = Domain.prototype.stringToArray

type SearchItem = {
  name: string
  type: 'input' | 'date_range' | 'selection'
  label: string
  placeholder?: string
  options?: { key: string, string: string}[]
  mutil?: boolean
}

// search item schame
export const searchItems: SearchItem[] = [
  {
    name: 'bill_number',
    type: 'input',
    label: '单据编号',
    placeholder: '请输入单据编号'
  },
  {
    name: 'create_uid',
    type: 'input',
    label: '创建人',
    placeholder: '请输入创建人'
  },
  // {
  //   name: 'create_date',
  //   type: 'date_range',
  //   label: '创建时间'
  // },
  {
    name: 'state',
    type: 'selection',
    label: '单据状态',
    options: [
      { key: '', string: '全部' },
      { key: 'Temporary', string: '暂存' },
      { key: 'Save', string: '已保存' },
      { key: 'Submit', string: '审核中' },
      { key: 'Audit', string: '已审核' }
    ]
  }
]

/**
 * 获取筛选表单的默认值
 */
export const getDefaultValues = () => {
  const values: any = {}
  for(let item of searchItems) {
    if(item.type === 'input' || item.type === 'selection') {
      values[item.name] = ''
    } else if(item.type === 'date_range') {
      values[item.name] = { 
        start: new Date(),
        end: new Date()
      }
    }
  }
  return values
}

/**
 * 获取筛选表单的domain
 * @param values 
 * @param searchItems 
 */
export const getDomain = (values: Record<string, any>, searchItems: SearchItem[]) => {
  const domains = []
  for(let item of searchItems) {
    const { name, type } = item
    const value = values[name]

    if(!value || value === '' || value === false) continue;

    if(type === 'input') {
      domains.push(arrayToString([[name, 'ilike', value]]))
    }
  }

  return stringToArray(pyUtils.assembleDomains(domains, 'AND'))
}
