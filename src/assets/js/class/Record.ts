/**
 * 表单记录
 */

export interface RecordRaw {
  id: number
  create_user: {
    id: number
    name: string
    avatar: string
  }
  create_date: string
  odoo_data: {[key: string]: any}
  [key: string]: any
}

export interface RecordState {
  key: string
  string: string
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

  constructor(raw: RecordRaw) {
    this.id = raw.id
    this.creator = this.normalizeCreator(raw)
    // this.proxyData(raw.odoo_data)
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
      time: new Date(raw.create_date)
    }
  }
}

export default Record