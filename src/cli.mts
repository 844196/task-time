#!/usr/bin/env node

import { cac } from 'cac'
import { version } from '../package.json'
import { ceilManHour } from './ceilManHour.mjs'

const cli = cac()

cli
  .command('<start> <end>')
  .option('-s, --step <step>', 'Ceil step', {
    type: [Number],
    default: 0.1,
  })
  .action((start: string, end: string, { step: [step] }: { step: [number] }) => {
    const diff = new Date(end).getTime() - new Date(start).getTime()

    console.log(ceilManHour(diff / 1000 / 60 / 60, step))
  })

cli.help()

cli.version(version)

cli.parse()
