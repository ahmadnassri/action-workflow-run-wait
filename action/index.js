// packages
import { inspect } from 'util'

import core from '@actions/core'
import github from '@actions/github'

// modules
import main from './lib/index.js'

// exit early
if (github.context.eventName !== 'workflow_run') {
  core.warning('action triggered outside of a workflow_run')
  process.exit(0)
}

// parse inputs
const inputs = {
  token: core.getInput('github-token', { required: true }),
  sha: core.getInput('sha', { required: true }),

  delay: Number(core.getInput('delay', { required: false })),
  timeout: Number(core.getInput('timeout', { required: false })),
  ignore: core.getInput('ignore-cancelled', { required: false }) === 'true',
}

// error handler
function errorHandler ({ message, stack }) {
  core.error(`${message}\n${stack}`)

  process.exit(1)
}

// catch errors and exit
process.on('unhandledRejection', errorHandler)
process.on('uncaughtException', errorHandler)

await main(inputs)
