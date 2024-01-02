#!/usr/bin/env node

// cspell:disable manhour

import { cac } from 'cac'
import { rcFile } from 'rc-config-loader'
import { z } from 'zod'
import { version } from '../package.json'
import { main, contextSchema, Context } from './main.mjs'

const config = (() => {
  const schema = contextSchema.partial()
  try {
    return schema.parse(rcFile<z.infer<typeof schema>>('manhour')?.config ?? {})
  } catch {
    return {}
  }
})()

const { timeZone: systemTimezone, locale: systemLocale } = Intl.DateTimeFormat().resolvedOptions()
const defaultContext = {
  workStart: '09:00+09:00',
  workEnd: '18:00+09:00',
  workPeriod: '05:00+09:00',
  breakStart: '12:00+09:00',
  breakEnd: '13:00+09:00',
  step: 0.1,
  reporter: 'simple',
  timezone: systemTimezone,
  locale: systemLocale,
  ...config,
} as Context

const cli = cac()

cli
  .command('<start> [end]')
  .option('-s, --step <step>', 'Ceil step', { default: defaultContext.step })
  .option(`-r, --reporter <reporter>`, 'Reporter', { default: defaultContext.reporter })
  .option('--work-start <time>', 'Work start', { default: defaultContext.workStart })
  .option('--work-end <time>', 'Work end', { default: defaultContext.workEnd })
  .option('--work-period <time>', 'Work period', { default: defaultContext.workPeriod })
  .option('--break-start <time>', 'Break start', { default: defaultContext.breakStart })
  .option('--break-end <time>', 'Break end', { default: defaultContext.breakEnd })
  .option('--timezone <timezone>', 'Timezone for reporter', { default: defaultContext.timezone })
  .option('--locale <locale>', 'Locale for reporter', { default: defaultContext.locale })
  .action((start: string, end: string | undefined, options: unknown) => {
    main(start, end ?? new Date().toISOString(), options)
  })

cli.help()

cli.version(version)

cli.parse()
