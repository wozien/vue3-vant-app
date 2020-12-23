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
  if(!value || value !== 0) {
    return ''
  }
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

export default {
  format: {
    char: formatChar,
    text: formatChar,
    date: formatDate,
    datetime: formatDateTime,
    integer: formatInteger,
    float: formatFloat,
    selection: formatSelection,
    many2one: formatMany2one
  },
  parse: {
    date: parseDate,
    datetime: parseDateTime
  }
}