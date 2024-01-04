#!/usr/bin/env node

// cspell:disable manhour

import { join as pathJoin } from 'node:path'
import { env, exit } from 'node:process'
import { cac } from 'cac'
import pc from 'picocolors'
import { rcFile } from 'rc-config-loader'
import { P, match } from 'ts-pattern'
import { xdgConfig } from 'xdg-basedir'
import { ZodError, type ZodIssue, z } from 'zod'
import { version } from '../package.json'
import { type Context, contextSchema, main } from './main.mjs'

const config = (() => {
  const configSchema = contextSchema.partial()
  type Config = z.infer<typeof configSchema>

  const parse = (path: string, data: unknown): Config => {
    const parseResult = configSchema.safeParse(data)
    if (parseResult.success) {
      return parseResult.data
    }
    console.warn(`${pc.yellow(`warning: config parse error in ${path}, skip loading...`)}
${pc.yellow(JSON.stringify(parseResult.error.errors, null, 2))}`)
    return {}
  }

  try {
    const foundGlobalConfig = match([env['MAN_HOUR_GLOBAL_CONFIG'], xdgConfig])
      .returnType<ReturnType<typeof rcFile<Config>>>()
      .with([P.string, P.any], ([configFileName]) => rcFile('manhour', { configFileName }))
      .with([undefined, P.string], ([, xdgConfigDir]) =>
        rcFile('manhour', {
          configFileName: pathJoin(xdgConfigDir, 'man-hour', 'config'),
        }),
      )
      .otherwise(() => undefined) ?? { filePath: '<Embedded>', config: {} }
    const globalConfig = parse(foundGlobalConfig.filePath, foundGlobalConfig.config)

    const foundConfig = rcFile<Config>('manhour', {
      configFileName: env['MAN_HOUR_CONFIG'] ?? '.manhourrc',
    }) ?? { filePath: '<Embedded>', config: {} }
    const config = parse(foundConfig.filePath, foundConfig.config)

    return { ...globalConfig, ...config }
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
  timezone: systemTimezone,
  locale: systemLocale,
  ...config,
} as Context

class OptionParseError extends Error {
  constructor(readonly issues: ZodIssue[]) {
    super('Option parse error')
  }
}

const cli = cac()

cli
  .command('<start> [end]')
  .option('-s, --step <step>', 'Ceil step', { default: defaultContext.step })
  .option('--work-start <time>', 'Work start', { default: defaultContext.workStart })
  .option('--work-end <time>', 'Work end', { default: defaultContext.workEnd })
  .option('--work-period <time>', 'Work period', { default: defaultContext.workPeriod })
  .option('--break-start <time>', 'Break start', { default: defaultContext.breakStart })
  .option('--break-end <time>', 'Break end', { default: defaultContext.breakEnd })
  .option('--timezone <timezone>', 'Timezone', { default: defaultContext.timezone })
  .option('--locale <locale>', 'Locale', { default: defaultContext.locale })
  .action((start: string, end: string | undefined, options: unknown) => {
    try {
      main(start, end ?? new Date().toISOString(), contextSchema.parse(options))
    } catch (error) {
      if (error instanceof ZodError) {
        throw new OptionParseError(error.issues)
      } else {
        throw error
      }
    }
  })

cli.help()

cli.version(version)

try {
  cli.parse()
} catch (error) {
  if (error instanceof OptionParseError) {
    error.issues.forEach(({ path, message }) => {
      console.error(pc.red(`option \`${path.join('.')}\` value validation error - ${message}`))
    })
  } else if (error instanceof Error) {
    console.error(pc.red(error.message))
  } else {
    console.error(pc.red(String(error)))
  }
  exit(1)
}
