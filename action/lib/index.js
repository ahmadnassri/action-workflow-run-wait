// packages
import core from '@actions/core'
import github from '@actions/github'
import deduplicate from './deduplicate.js'

import runs from './runs.js'
import workflows from './workflows.js'

// sleep function
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function ({ token, delay, timeout }) {
  let timer = 0

  // init octokit
  const octokit = github.getOctokit(token)

  await deduplicate(octokit)

  const dependencies = await workflows(octokit)

  // check runs
  let result = await runs(octokit, dependencies)

  while (result.find(run => run.conclusion !== 'success')) {
    // exit early
    const failed = result.find(run => run.conclusion === 'failure')

    if (failed) {
      core.setFailed(`${failed.id}: ${failed.name} failed`)
      process.exit(1)
    }

    timer += delay

    // time out!
    if (timer >= timeout) {
      core.setFailed('workflow-run-wait timed out')
      process.exit(1)
    }

    for (const run of result) {
      core.info(`${run.id}: ${run.name} => ${run.conclusion || 'pending'}`)
    }

    core.info(`runs were not successful, or have not started, try again in ${delay}`)

    // zzz
    await sleep(delay)

    // get the data again
    result = await runs(octokit, dependencies)
  }

  for (const run of result) {
    core.info(`${run.id}: ${run.name} => ${run.conclusion || 'pending'}`)
  }

  core.info('all runs completed successfully!')
}
