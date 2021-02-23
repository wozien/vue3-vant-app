
import { Item, StudioItem } from './index'
import { findTree, uuid } from '@/assets/js/utils/tools' 
import { chekcButtonAccess } from '@/api/app'

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[] | null
  buttons: any[]
  isSubView?: boolean
  options?: any
}

export type ViewButtonType = 'event' | 'object'

type ViewButtonMode =  'readonly' | 'edit'
export interface ViewButton {
  key: string
  type: ViewButtonType
  string: string
  funcName: string
  funcType: string
  highlight: Boolean
  mode: ViewButtonMode
  isFlow: Boolean,
  loading: Boolean
}

class View {
  model: string
  name: string
  type: ViewType
  items: Item[]
  isSubView: boolean
  buttons: ViewButton[]
  options?: any

  constructor(viewObj: StudioView) {
    this.model = viewObj.model
    this.name = viewObj.name
    this.type = viewObj.type
    this.isSubView = viewObj.isSubView || false
    this.options = viewObj.options || {}
    this.buttons = this._initButtons(viewObj.buttons)
    this.items = viewObj.mobileItems ? viewObj.mobileItems.map(i => new Item(i)) : []
  }

  getSubViews () {
    let views: View[] = []

    findTree(this.items, (item: Item) => {
      if (item.fieldType === 'one2many' || item.fieldType === 'many2many') {
        views = views.concat(item.subView as View[])
      }
    }, 'items')

    return views
  }

  _initButtons(options: any): ViewButton[] {
    // 目前设计器的按钮配置只存这两个位置
    if(!options.singleButton && !options.batchBodyButton) return []
    const { custom: buttons } = this.isSubView ? options.batchBodyButton : options.singleButton 
    const res: ViewButton[] = []

    findTree(buttons, (button: any) => {
      if(!button.expand && !button.forbidden) {
        res.push({
          key: button.key,
          type: button.is_event ? 'event' : 'object',
          string: this._getButtonString(button.button_string || button.string),
          funcName: button.func_name,
          funcType: button.func_type,
          mode: button.mode,
          highlight: button.highlight,
          isFlow: this._isFlowButton(button),
          loading: false
        })
      }
    }, 'children')

    if(this.isSubView) {
      res.unshift(this._makePresetButton('back', 'Back', 'readonly'))
      res.unshift(this._makePresetButton('saveLine', 'Save Line'))
      res.unshift(this._makePresetButton('newLine', 'New Line', 'edit', {highlight: true}))
      res.push(this._makePresetButton('deleteLine', 'Delete Line'))
    } 

    return res
  }

  // 前端预置按钮的翻译
  _getButtonString(key: string) {
    const buttonMap = {
      'Edit': '编辑',
      'Copy': '复制',
      'Create': '创建',
      'Cancel': '取消',
      'Save': '保存',
      'Back': '返回',
      'Insert Line': '行插入',
      'Copy Line': '行复制',
      'Delete Line': '行删除',
      'Save Line': '行保存',
      'New Line': '保存并新增'
    }
    return buttonMap[key as keyof typeof buttonMap] || key
  }

  _makePresetButton(funcName: string, string: string, mode?: ViewButtonMode, options?: any): ViewButton {
    return {
      key: uuid(6),
      type: 'event',
      string: this._getButtonString(string),
      funcName: funcName,
      funcType: 'preset',
      mode: mode || 'edit',
      highlight: false,
      isFlow: false,
      loading: false,
      ...options
    }
  }

  _isFlowButton(item: any) {
    return !item.is_event && item.func_name.startsWith('workflow_')
  }

  async checkButtonsAccess() {
    const getName = (name: string) => {
      if(name === 'create') {
        return 'pre_create'
      } else if (name === 'edit') {
        return 'pre_write'
      } 
      return name
    }

    // 构造权限接口数据
    const args = this.buttons.map((button: ViewButton) => {
      return {
        attrs: {
          key: button.key,
          type: button.type,
          name: getName(button.funcName),
          event: button.funcName === 'copy' && '_onCopyRecord'
        },
        tag: 'button',
        children: []
      }
    })
    const res = await chekcButtonAccess(this.model, args)
    if(res.ret === 0) {
      this.buttons = this.buttons.filter((button: ViewButton) => {
        return res.data && res.data.length && res.data.find((item: any) => item.attrs.key === button.key)
      })
    }
  }
}

export default View