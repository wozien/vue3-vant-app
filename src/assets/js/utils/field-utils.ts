import { str2Date, formatDate as date2Str } from './date'
import _ from 'lodash'
import { DataPoint } from '@/assets/js/class'

// -------------- format --------------

function formatChar(value: string) {
  value = typeof value === 'string' ? value : ''
  return value
}

function formatDate(value: Date | boolean) {
  if (typeof value === 'boolean') {
    return ''
  }
  return date2Str('yyyy-MM-dd', value)
}

function formatDateTime(value: Date | boolean) {
  if (typeof value === 'boolean') {
    return ''
  }
  return date2Str('yyyy-MM-dd hh:mm', value)
}

function formatInteger(value: any) {
  if(value === false) {
    return ''
  }
  // TODO 千分位处理
  return value
}

function formatFloat(value: any) {
  if(value === false) {
    return ''
  }
  return value
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


// --------------- parse --------------

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
    boolean: _.identity,
    date: formatDate,
    datetime: formatDateTime,
    integer: formatInteger,
    float: formatFloat,
    selection: formatSelection,
    many2one: formatMany2one
  },
  parse: {
    char: _.identity,
    text: _.identity,
    boolean: _.identity,
    date: parseDate,
    datetime: parseDateTime,
    integer: _.identity, // TODO
    float: _.identity,    // TODO
    selection: _.identity,
    many2one: parseMany2one
  }
}