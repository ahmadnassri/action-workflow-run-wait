// packages
import core from '@actions/core'
import github from '@actions/github'

import runs from './runs.js'
import workflows from './workflows.js'

// sleep function
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function ({ token, delay, timeout }) {
  // init octokit
  const octokit = github.getOctokit(token)

  let timer = 0

  const flows = await workflows(octokit)

  // check runs
  let result = await runs(octokit, flows)

  while (result.find(run => run.conclusion !== 'success')) {
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
    result = await runs(octokit, flows)
  }

  for (const run of result) {
    core.info(`${run.id}: ${run.name} => ${run.conclusion || 'pending'}`)
  }

  core.info('all runs completed successfully!')
}
