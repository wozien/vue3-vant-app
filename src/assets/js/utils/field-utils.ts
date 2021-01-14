import _ from 'lodash'
import { str2Date, formatDate as date2Str } from './date'
import { DataPoint } from '@/assets/js/class'
import { insertThousandSeps } from '@/assets/js/utils/tools'
import sprintf from './sprintf.js'

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
  const val = _.find(field.selection, (option: any) => option[0] === value)
  if(!val) {
    return ''
  }
  value = val[1]
  return value
}

function formatMany2one(value: DataPoint | [number, string]) {
  value = value && (_.isArray(value) ? value[1] : value.data.display_name) || '';
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

// --------------- parse --------------

function parseNumber(value: string) {
  // 把千分位数字字符串转为number
  const escapedSep = _.escapeRegExp(',')
  value = value.replace(new RegExp(escapedSep, 'g'), '').replace('.', '')
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
  if (_.isArray(value)) {
      return {
          id: value[0],
          display_name: value[1],
      };
  }
  if (_.isNumber(value) || _.isString(value)) {
      return {
          id: parseInt(value as string, 10),
      };
  }
  return value;
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
    many2many: formatX2Many
  },
  parse: {
    char: _.identity,
    text: _.identity,
    boolean: _.identity,
    date: parseDate,
    datetime: parseDateTime,
    integer: parseNumber, 
    float: parseNumber,    // TODO
    selection: _.identity,
    many2one: parseMany2one,
    one2many: _.identity,
    many2many: _.identity
  }
}