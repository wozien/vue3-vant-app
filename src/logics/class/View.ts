
import ViewItem from './ViewItem'
import type { StudioItem } from '../types'
import { findTree, uuid } from '@/helpers/utils' 
import { chekcButtonAccess } from '@/api/app'

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[] | null
  buttons: any[]
  isSubView?: boolean
  isLinkView?: boolean
  options?: any
}

export type ViewButtonType = 'event' | 'object'

type ViewButtonMode =  'readonly' | 'edit'
export interface ViewButton {
  key: string
  type: ViewButtonType
  string: string
  mode: ViewButtonMode
  highlight: boolean
  invisible: string
  loading: boolean
  funcName?: string
  funcType?: string
  isFlow?: boolean
  expand?: boolean
  children?: ViewButton[]
}

class View {
  model: string
  name: string
  type: ViewType
  items: ViewItem[]
  isSubView: boolean
  isLinkView: boolean
  buttons: ViewButton[]
  options?: any

  constructor(viewObj: StudioView) {
    this.model = viewObj.model
    this.name = viewObj.name
    this.type = viewObj.type
    this.isSubView = viewObj.isSubView || false
    this.isLinkView = viewObj.isLinkView || false
    this.options = viewObj.options || {}
    this.buttons = this._initButtons(viewObj.buttons)
    this.items = viewObj.mobileItems ? viewObj.mobileItems.map(i => new ViewItem(i)) : []
  }

  _formatOneButton(button: any) {
    const buttonItem: ViewButton = {
      key: button.key,
      type: button.is_event ? 'event' : 'object',
      string: this._getButtonString(button.button_string || button.string || button.group_name),
      mode: button.mode,
      highlight: button.highlight || false,
      invisible: button.invisible?.length ? button.invisible : '',
      loading: false,
      isFlow: this._isFlowButton(button),
      expand: button.expand
    }

    if(buttonItem.expand) {
      buttonItem.children = this._formatButtons(button.children)
    } else {
      buttonItem.funcName = button.func_name
      buttonItem.funcType = button.func_type
    }

    // 强制把行插入和行复制的 mode 设置为 edit
    if(buttonItem.funcName && ['insertLine', 'copyLine'].includes(buttonItem.funcName)) {
      buttonItem.mode = 'edit'
    }

    return buttonItem
  }

  _formatButtons(buttons: any[] = []) {
    const viewButtons: ViewButton[] = []
    for(let button of buttons) {
      if(button && !button.forbidden && !Array.isArray(button.func_name)) {
        const buttomItem = this._formatOneButton(button)
        viewButtons.push(buttomItem)
      }
    }
    return viewButtons
  }

  _initButtons(options: any) {
    let viewButtons: ViewButton[]  = [];
    // 目前设计器的按钮配置只存这两个位置
    if(options.singleButton || options.batchBodyButton) {
      const { custom: buttons } = this.isSubView ? options.batchBodyButton : options.singleButton 
      viewButtons = this._formatButtons(buttons)
    }

    if(this.isSubView || this.isLinkView) {
      viewButtons.unshift(this._makePresetButton('back', 'Back', 'readonly'))
      viewButtons.unshift(this._makePresetButton('saveLine', 'Save Line'))
      viewButtons.unshift(this._makePresetButton('newLine', 'New Line', 'edit', {highlight: true}))
      viewButtons.push(this._makePresetButton('deleteLine', 'Delete Line'))
    } 

    return viewButtons
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
    return !item.is_event && item.func_name?.startsWith('workflow_')
  }

  /**
   * 按钮权限处理
   */
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
    const args = [] as any
    findTree(this.buttons, (button: ViewButton) => {
      if(!button.expand) {
        args.push(
          {
            attrs: {
              key: button.key,
              type: button.type,
              name: getName(button.funcName as string),
              event: button.funcName === 'copy' && '_onCopyRecord'
            },
            tag: 'button',
            children: []
          }
        )
      }
    }, 'children')

    const res = await chekcButtonAccess(this.model, args)
    if(res.ret === 0) {
      const authButtons = res.data
      const filterButtons = (buttons: ViewButton[]) => {
        return buttons.filter((button: ViewButton) => {
          if(button.expand) {
            button.children = filterButtons(button.children as ViewButton[])
            return true
          }
          return authButtons.find((item: any) => item.attrs.key === button.key)
        })
      }
      
      this.buttons = filterButtons(this.buttons)
    }
  }

  getSubViews () {
    let views: View[] = []

    findTree(this.items, (item: ViewItem) => {
      if (item.fieldType === 'one2many' || item.fieldType === 'many2many') {
        views = views.concat(item.subView as View[])
      }
    }, 'items')

    return views
  }
}

export default View