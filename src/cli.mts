#!/usr/bin/env node

import { UTCDate } from '@date-fns/utc'
import { cac } from 'cac'
import { add } from 'date-fns/add'
import { formatISO } from 'date-fns/formatISO'
import { formatISODuration } from 'date-fns/formatISODuration'
import { intervalToDuration } from 'date-fns/intervalToDuration'
import { z } from 'zod'
import { version } from '../package.json'
import { ceilManHour } from './ceilManHour.mjs'
import { eachTaskTimeInterval } from './eachTaskTimeInterval.mjs'
import { type TimeWithOffset, timeWithOffsetSchema } from './types.mjs'

const cli = cac()

const stepSchema = z.number().positive()
const reporterSchema = z.enum(['simple', 'json'])

type Options = {
  workStart: [TimeWithOffset]
  workEnd: [TimeWithOffset]
  workPeriod: [TimeWithOffset]
  breakStart: [TimeWithOffset]
  breakEnd: [TimeWithOffset]
  step: [z.infer<typeof stepSchema>]
  reporter: [z.infer<typeof reporterSchema>]
  timezone: [string]
  locale: [string]
}

cli
  .command('<start> <end>')
  .option('--work-start <time>', 'Work start', {
    type: [(x: unknown) => timeWithOffsetSchema.parse(x)],
    default: ['09:00+09:00'],
  })
  .option('--work-end <time>', 'Work end', {
    type: [(x: unknown) => timeWithOffsetSchema.parse(x)],
    default: ['18:00+09:00'],
  })
  .option('--work-period <time>', 'Work period', {
    type: [(x: unknown) => timeWithOffsetSchema.parse(x)],
    default: ['05:00+09:00'],
  })
  .option('--break-start <time>', 'Break start', {
    type: [(x: unknown) => timeWithOffsetSchema.parse(x)],
    default: ['12:00+09:00'],
  })
  .option('--break-end <time>', 'Break end', {
    type: [(x: unknown) => timeWithOffsetSchema.parse(x)],
    default: ['13:00+09:00'],
  })
  .option('-s, --step <step>', 'Ceil step', {
    type: [(x: unknown) => stepSchema.parse(x)],
    default: [0.1],
  })
  .option(`-r, --reporter <${reporterSchema.options.join('|')}>`, 'Reporter', {
    type: [(x: unknown) => reporterSchema.parse(x)],
    default: [reporterSchema.enum.simple],
  })
  .option('--timezone <timezone>', 'Timezone for reporter', {
    type: [String],
    default: [Intl.DateTimeFormat().resolvedOptions().timeZone],
  })
  .option('--locale <locale>', 'Locale for reporter', {
    type: [String],
    default: [Intl.DateTimeFormat().resolvedOptions().locale],
  })
  .action(main)

cli.help()

cli.version(version)

cli.parse()

function main(
  start: string,
  end: string,
  {
    workStart: [workStart],
    workEnd: [workEnd],
    workPeriod: [workPeriod],
    breakStart: [breakStart],
    breakEnd: [breakEnd],
    step: [step],
    reporter: [reporter],
    timezone: [timeZone],
    locale: [locale],
  }: Options,
) {
  const intervals = eachTaskTimeInterval(new UTCDate(start), new UTCDate(end), {
    workStart,
    workEnd,
    workPeriod,
    breakStart,
    breakEnd,
  })

  const intervalFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  const logs = intervals.reduce(
    (acc, interval) => {
      const duration = intervalToDuration(interval)

      acc.push({
        interval: intervalFormatter.formatRange(new Date(interval.start), new Date(interval.end)),
        hours: ceilManHour(add(new Date(0), duration).getTime() / 1000 / 60 / 60, step),
        isoInterval: `${formatISO(interval.start)}/${formatISO(interval.end)}`,
        isoDuration: formatISODuration(duration),
      })

      return acc
    },
    [] as { interval: string; hours: number; isoInterval: string; isoDuration: string }[],
  )

  switch (reporter) {
    case 'simple': {
      console.log(
        logs
          .map(({ hours }) => hours)
          .reduce((acc, hours) => acc + hours, 0)
          .toFixed(1),
      )
      break
    }
    case 'json': {
      console.log(JSON.stringify(logs, null, 2))
      break
    }
  }
}
