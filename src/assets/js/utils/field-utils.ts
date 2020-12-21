import { str2Date } from './date'


function parseDate(value: string) {
  return str2Date(value)
}

function parseDateTime(value: string) {
  return parseDate(value)
}

export default {
  format: {},
  parse: {
    date: parseDate,
    datetime: parseDateTime
  }
}