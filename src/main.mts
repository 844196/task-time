import { UTCDate } from '@date-fns/utc'
import { add } from 'date-fns/add'
import { formatISO } from 'date-fns/formatISO'
import { formatISODuration } from 'date-fns/formatISODuration'
import { intervalToDuration } from 'date-fns/intervalToDuration'
import { z } from 'zod'
import { ceilManHour } from './ceilManHour.mjs'
import { eachTaskTimeInterval } from './eachTaskTimeInterval.mjs'
import { timeWithOffsetSchema } from './types.mjs'

export const configSchema = z
  .object({
    workStart: timeWithOffsetSchema,
    workEnd: timeWithOffsetSchema,
    workPeriod: timeWithOffsetSchema,
    breakStart: timeWithOffsetSchema,
    breakEnd: timeWithOffsetSchema,
    step: z.number().positive(),
    reporter: z.enum(['simple', 'json']),
    timezone: z.string(),
    locale: z.string(),
  })
  .partial()
export type Config = z.infer<typeof configSchema>

export function main(start: string, end: string, options: unknown) {
  const {
    workStart: workStart,
    workEnd: workEnd,
    workPeriod: workPeriod,
    breakStart: breakStart,
    breakEnd: breakEnd,
    step: step,
    reporter: reporter,
    timezone: timeZone,
    locale: locale,
  } = configSchema.required().parse(options)

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
