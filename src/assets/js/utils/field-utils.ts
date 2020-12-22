import { str2Date, formatDate as date2Str } from './date'

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
    datetime: formatDateTime
  },
  parse: {
    date: parseDate,
    datetime: parseDateTime
  }
}