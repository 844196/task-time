import { UTCDate } from '@date-fns/utc'
import { type Interval } from 'date-fns'
import { addDays } from 'date-fns/addDays'
import { interval } from 'date-fns/interval'
import { isAfter } from 'date-fns/isAfter'
import { isBefore } from 'date-fns/isBefore'
import { isWeekend } from 'date-fns/isWeekend'
import { nextMonday } from 'date-fns/nextMonday'
import { parse } from 'date-fns/parse'
import { transpose } from 'date-fns/transpose'
import { type TimeWithOffset } from './types.mjs'

export type EachTaskTimeIntervalOptions = {
  workStart?: TimeWithOffset
  workEnd?: TimeWithOffset
  workPeriod?: TimeWithOffset
  breakStart?: TimeWithOffset
  breakEnd?: TimeWithOffset
}

export function eachTaskTimeInterval(
  start: Date | UTCDate,
  end: Date | UTCDate,
  opts: EachTaskTimeIntervalOptions = {},
): Interval[] {
  const {
    workStart: optsWorkStart = '10:00Z',
    workEnd: optsWorkEnd = '19:00Z',
    workPeriod: optsWorkPeriod = '05:00Z',
    breakStart: optsBreakStart = '13:00Z',
    breakEnd: optsBreakEnd = '14:00Z',
  } = opts

  const intervals: Interval[] = []

  const utcEnd = transpose(end, UTCDate)
  let cursor = transpose(start, UTCDate)
  while (isBefore(cursor, utcEnd)) {
    const breakStart = parse(optsBreakStart, 'HH:mmXXX', cursor)
    const breakEnd = parse(optsBreakEnd, 'HH:mmXXX', cursor)
    const workEnd = parse(optsWorkEnd, 'HH:mmXXX', cursor)
    const workPeriod = addDays(parse(optsWorkPeriod, 'HH:mmXXX', cursor), 1)

    if (isAfter(utcEnd, breakEnd) && isBefore(cursor, breakStart)) {
      intervals.push(interval(cursor, breakStart))
      cursor = breakEnd
    }

    if (isBefore(utcEnd, workPeriod)) {
      intervals.push(interval(cursor, utcEnd))
      break
    }

    // ここに到達する時点で就業日境界を超える (i.e. 1日以上かかる) ことが確定

    if (isBefore(cursor, workEnd)) {
      intervals.push(interval(cursor, workEnd))
      cursor = workEnd
    } else {
      // 終業時刻以降に開始した場合、区間の終点を推定することができない
      // そのため、便宜上長さ0の区間を追加しておく
      intervals.push(interval(cursor, cursor))
    }

    const tomorrow = addDays(parse(optsWorkStart, 'HH:mmXXX', cursor), 1)
    const nextDay = isWeekend(tomorrow) ? nextMonday(parse(optsWorkStart, 'HH:mmXXX', cursor)) : tomorrow
    if (isAfter(utcEnd, workPeriod) && isBefore(utcEnd, nextDay)) {
      // 就業日境界から始業時刻までの間に作業終了した場合、区間の始点を推定することができない
      // そのため、便宜上長さ0の区間を追加しておく
      intervals.push(interval(utcEnd, utcEnd))
      break
    }

    cursor = nextDay
  }

  return intervals
}
