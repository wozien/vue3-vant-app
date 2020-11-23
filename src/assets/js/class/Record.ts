/**
 * 表单记录
 */

export interface RecordRaw {
  id: number
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
  avatar: string;
  time: Date
}

class Record {
  id: number
  state: RecordState
  creator: Creator
  raw: RecordRaw

  constructor(raw: RecordRaw) {
    this.id = raw.id
    this.raw = raw
    this.state = this.normalizeState(raw)
    this.creator = this.normalizeCreator(raw)
  }

  /**
   * 单据状态处理
   * @param raw 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeState(raw: RecordRaw): RecordState {
    return {
      key: 'Saved',
      string: '保存'
    }
  }

  /**
   * 单据创建人处理
   * @param raw 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeCreator(raw: RecordRaw): Creator {
    return {
      id: 1,
      name: '张三',
      avatar: '',
      time: new Date()
    }
  }
}

export default Record