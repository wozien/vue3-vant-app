/**
 * 表单记录
 */

import { getApp } from './App'

export interface RecordRaw {
  id: number
  state: string
  create_user: {
    id: number
    name: string
    avatar: string
  }
  create_date: string
  odoo_data: {[key: string]: any}
  [key: string]: any
}

export interface RecordRole {
  id: number
  name: string
}

export interface Creator extends RecordRole {
  avatar: string
  time: Date
}

class Record {
  id: number
  creator: Creator
  state: string
  raw: {[key: string]: any}

  constructor(raw: RecordRaw) {
    this.id = raw.id
    this.state = this.normalizeState(raw.state) || ''
    this.creator = this.normalizeCreator(raw)
    this.raw = raw.odoo_data
  }

  /**
   * 单据创建人处理
   * @param raw 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeCreator(raw: RecordRaw): Creator {
    const { id, name, avatar } = raw.create_user
    return {
      id,
      name,
      avatar,
      time: new Date(raw.create_date + ' UTC')   // 后台返回是UCT时间
    }
  }

  /**
   * 获取单据状态的显示值
   * @param state
   */
  normalizeState(state: string) {
    const curApp = getApp()
    const curModel = curApp.getModel()
    if(curModel) {
      for(let field of curModel.fields) {
        if(field.name === 'state' && field.selection?.length) {
          for(let [key, value] of field.selection) {
            if(key === state) {
              return value;
            }
          }
        }
      }
    }
  }
}

export default Record