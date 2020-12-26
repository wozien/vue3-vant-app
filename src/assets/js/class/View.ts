
import { Item, StudioItem } from './index'
import { findTree } from '@/assets/js/utils/tools' 

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[],
  buttons: any[],
  options?: any
}

export type ViewButtonType = 'event' | 'object'
export interface ViewButton {
  key: string
  type: ViewButtonType,
  string: string,
  funcName: string
  funcType: string,
  highlight: Boolean,
  mode: 'readonly' | 'edit',
  isFlow: Boolean
}

class View {
  model: string
  name: string
  type: ViewType
  items: Item[]
  buttons: ViewButton[]
  options?: any

  constructor(viewObj: StudioView) {
    this.model = viewObj.model
    this.name = viewObj.name
    this.type = viewObj.type
    this.options = viewObj.options || {}
    this.buttons = this._initButtons(viewObj.buttons)
    this.items = viewObj.mobileItems.map(i => new Item(i))
  }

  getSubViews () {
    let views: View[] = [];

    findTree(this.items, (item: Item) => {
      if (item.fieldType === 'one2many' || item.fieldType === 'many2many') {
        views = views.concat(item.subView as View[]);
      }
    }, 'items');

    return views;
  }

  _initButtons(options: any): ViewButton[] {
    if(!options.singleButton) return []
    const { custom: buttons } = options.singleButton
    return buttons.map((item: any) => {
      return {
        key: item.key,
        type: item.is_event ? 'event' : 'object',
        string: this._getButtonString(item.button_string),
        funcName: item.func_name,
        funcType: item.func_type,
        mode: item.mode,
        highlight: item.highlight,
        isFlow: this._isFlowButton(item)
      }
    })
  }

  // 前端预置按钮的翻译
  _getButtonString(key: string) {
    const buttonMap = {
      'Edit': '编辑',
      'Copy': '复制',
      'Create': '创建',
      'Cancel': '取消',
      'Save': '保存'
    }
    return buttonMap[key as keyof typeof buttonMap] || key
  }

  _isFlowButton(item: any) {
    return !item.is_event && item.func_name.startsWith('workflow_')
  }
}

export default View