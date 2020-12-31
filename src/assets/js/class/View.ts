
import { Item, StudioItem } from './index'
import { findTree, uuid } from '@/assets/js/utils/tools' 

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[]
  buttons: any[]
  isSubView?: boolean
  options?: any
}

export type ViewButtonType = 'event' | 'object'
export interface ViewButton {
  key: string
  type: ViewButtonType
  string: string
  funcName: string
  funcType: string
  highlight: Boolean
  mode: 'readonly' | 'edit'
  isFlow: Boolean
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
    this.items = viewObj.mobileItems.map(i => new Item(i))
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
    if(!options.singleButton && !options.batchBodyButton) return []
    const { custom: buttons } = this.isSubView ? options.batchBodyButton : options.singleButton 
    const res: ViewButton[] = []

    findTree(buttons, (button: any) => {
      if(!button.expand) {
        res.push({
          key: button.key,
          type: button.is_event ? 'event' : 'object',
          string: this._getButtonString(button.button_string || button.string),
          funcName: button.func_name,
          funcType: button.func_type,
          mode: button.mode,
          highlight: button.highlight,
          isFlow: this._isFlowButton(button)
        })
      }
    }, 'children')

    if(this.isSubView) {
      res.unshift(this._makePresetButton('newLine', 'new Line'))
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
      'Insert Line': '行保存',
      'Copy Line': '行复制',
      'Delete Line': '行删除',
      'new Line': '保存并新增'
    }
    return buttonMap[key as keyof typeof buttonMap] || key
  }

  _makePresetButton(funcName: string, string: string): ViewButton {
    return {
      key: uuid(6),
      type: 'event',
      string: this._getButtonString(string),
      funcName: funcName,
      funcType: 'preset',
      mode: 'edit',
      highlight: false,
      isFlow: false
    }
  }

  _isFlowButton(item: any) {
    return !item.is_event && item.func_name.startsWith('workflow_')
  }
}

export default View