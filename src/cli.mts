#!/usr/bin/env node

// cspell:disable manhour

import { cac } from 'cac'
import { rcFile } from 'rc-config-loader'
import { version } from '../package.json'
import { main, type Config, configSchema } from './main.mjs'

const config = ((name: string) => {
  try {
    return configSchema.parse(rcFile<Config>(name)?.config ?? {})
  } catch {
    return {}
  }
})('manhour')

const { timeZone: systemTimezone, locale: systemLocale } = Intl.DateTimeFormat().resolvedOptions()
const defaultOptions = {
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
} as const satisfies Config

const cli = cac()

cli
  .command('<start> <end>')
  .option('-s, --step <step>', 'Ceil step', { default: defaultOptions.step })
  .option(`-r, --reporter <reporter>`, 'Reporter', { default: defaultOptions.reporter })
  .option('--work-start <time>', 'Work start', { default: defaultOptions.workStart })
  .option('--work-end <time>', 'Work end', { default: defaultOptions.workEnd })
  .option('--work-period <time>', 'Work period', { default: defaultOptions.workPeriod })
  .option('--break-start <time>', 'Break start', { default: defaultOptions.breakStart })
  .option('--break-end <time>', 'Break end', { default: defaultOptions.breakEnd })
  .option('--timezone <timezone>', 'Timezone for reporter', { default: defaultOptions.timezone })
  .option('--locale <locale>', 'Locale for reporter', { default: defaultOptions.locale })
  .action(main)

cli.help()

cli.version(version)

cli.parse()
