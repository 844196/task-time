#!/usr/bin/env node

import { cac } from 'cac'
import { version } from '../package.json'
import { main } from './main.mjs'

const cli = cac()

cli.command('').action(() => {
  console.log(main())
})

cli.help()

cli.version(version)

cli.parse()
