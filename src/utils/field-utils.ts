import { find, isNumber, isString, identity } from 'lodash-es'
import { str2Date, formatDate as date2Str } from '@/utils/date'
import { DataPoint } from '@/logics/types/dataPoint'
import { insertThousandSeps } from '@/utils/helper'
import sprintf from '@/logics/odoo/sprintf'

// -------------- format --------------

function formatChar(value: string) {
  value = typeof value === 'string' ? value : ''
  return value
}

function formatBoolean(value: boolean, field: any, options?: any) {
  if(options?.format) {
    return value ? '是' : '否'
  }
  return value
}

function formatDate(value: Date | boolean) {
  if (typeof value === 'boolean') {
    return ''
  }
  return date2Str('yyyy年MM月dd日', value)
}

function formatDateTime(value: Date | boolean) {
  if (typeof value === 'boolean') {
    return ''
  }
  return date2Str('yyyy年MM月dd日 hh时:mm分', value)
}

function formatInteger(value: any) {
  if(!value && value !== 0) {
    return ''
  }
  // 千分位处理
  return insertThousandSeps(sprintf('%d', value))
}

function formatFloat(value: any) {
  if(value === false) {
    return ''
  }
  // TODO 查看配置的精度
  const percision = 2
  const formatted = sprintf('%.' + percision + 'f', value || 0).split('.')
  formatted[0] = insertThousandSeps(formatted[0])
  return formatted.join('.')
}

function formatSelection(value: any, field?: any) {
  const val = find(field.selection, (option: any) => option[0] === value)
  if(!val) {
    return ''
  }
  value = val[1]
  return value
}

function formatMany2one(value: DataPoint | [number, string]) {
  value = value && (Array.isArray(value) ? value[1] : value.data.display_name) || '';
  return value
}

function formatX2Many(value: any) {
  if (value.data.length === 0) {
      return 'No records'
  } else if (value.data.length === 1) {
      return '1 record'
  } else {
      return value.data.length + ' records'
  }
}

function formatJsonb(value: any) {
  value = typeof value === 'object' ? value : {}
  return JSON.stringify(value)
} 

// --------------- parse --------------

function parseNumber(value: string) {
  // 把千分位数字字符串转为number
  // const escapedSep = escapeRegExp(',')
  value = value.replace(new RegExp(',', 'g'), '')
  return Number(value)
}

function parseDate(value: string) {
  if (!value) {
    return false;
  }
  return str2Date(value)
}

function parseDateTime(value: string) {
  if (!value) {
    return false;
  }
  return parseDate(value)
}

function parseMany2one(value: any) {
  if (Array.isArray(value)) {
      return {
          id: value[0],
          display_name: value[1],
      };
  }
  if (isNumber(value) || isString(value)) {
      return {
          id: parseInt(value as string, 10),
      };
  }
  return value;
}

function parseJsonb(value: string) {
  return value ? JSON.parse(value) : {}
}

// format datapoint.data -> 前端控件显示
// parse server data -> datapoint.data
export default {
  format: {
    char: formatChar,
    text: formatChar,
    boolean: formatBoolean,
    date: formatDate,
    datetime: formatDateTime,
    integer: formatInteger,
    float: formatFloat,
    selection: formatSelection,
    many2one: formatMany2one,
    one2many: formatX2Many,
    many2many: formatX2Many,
    reference: formatMany2one,
    jsonb: formatJsonb
  },
  parse: {
    char: identity,
    text: identity,
    boolean: identity,
    date: parseDate,
    datetime: parseDateTime,
    integer: parseNumber, 
    float: parseNumber,    // TODO
    selection: identity,
    many2one: parseMany2one,
    one2many: identity,
    many2many: identity,
    reference: parseMany2one,
    jsonb: parseJsonb
  }
}