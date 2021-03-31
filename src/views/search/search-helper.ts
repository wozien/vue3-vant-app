import Domain from '@/logics/odoo/Domain'
import pyUtils from '@/logics/odoo/py_utils'

const arrayToString = Domain.prototype.arrayToString
const stringToArray = Domain.prototype.stringToArray

export type SearchItem = {
  name: string
  type: 'input' | 'date_range' | 'selection'
  label: string
  placeholder?: string
  options?: { key: string; string: string }[]
  mutil?: boolean
}

// search item schame
export const searchItems: SearchItem[] = [
  {
    name: 'number',
    type: 'input',
    label: '单据编号',
    placeholder: '请输入单据编号',
  },
  {
    name: 'create_uid',
    type: 'input',
    label: '创建人',
    placeholder: '请输入创建人',
  },
  {
    name: 'create_date',
    type: 'date_range',
    label: '创建时间',
  },
  {
    name: 'state',
    type: 'selection',
    label: '单据状态',
    options: [
      { key: '', string: '全部' },
      { key: 'temporary', string: '暂存' },
      { key: 'save', string: '已保存' },
      { key: 'submit', string: '审核中' },
      { key: 'audit', string: '已审核' },
    ],
  },
]

/**
 * 获取筛选表单的默认值
 */
export const getDefaultValues = () => {
  const values: any = {}
  for (let item of searchItems) {
    if (item.type === 'input' || item.type === 'selection') {
      values[item.name] = ''
    } else if (item.type === 'date_range') {
      values[item.name] = {
        start: false,
        end: false,
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
  for (let item of searchItems) {
    const { name, type } = item
    const value = values[name]
    const domain = []

    if (!value || value === '' || value === false) continue

    if (type === 'input') {
      domain.push([name, 'ilike', value])
    } else if (type === 'selection') {
      domain.push([name, '=', value])
    } else if (type === 'date_range') {
      if (value['start']) {
        domain.push([name, '>=', `${value['start']} 00:00:00`])
      }
      if (value['end']) {
        domain.push([name, '<=', `${value['end']} 23:59:59`])
        domain.length > 1 && domain.unshift('&')
      }
    }
    domains.push(arrayToString(domain))
  }

  return stringToArray(pyUtils.assembleDomains(domains, 'AND'))
}
