/* eslint-disable camelcase */

// packages
import core from '@actions/core'
import github from '@actions/github'
import deduplicate from './deduplicate.js'

import runs from './runs.js'
import workflows from './workflows.js'

// sleep function
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function ({ token, delay, timeout, sha, ignore }) {
  let timer = 0

  // init octokit
  const octokit = github.getOctokit(token)

  // extract sha
  const { ref, runId: run_id } = github.context

  core.debug(`sha: ${sha}`)
  core.debug(`run.id: ${run_id}`)

  // get workflow id from run id
  const { data: { workflow_id } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
    ...github.context.repo,
    run_id
  })

  core.debug(`workflow_id: ${workflow_id}`)

  // don't run this workflow twice for the same commit
  await deduplicate({ octokit, workflow_id, run_id })

  // find all the dependencies
  const dependencies = await workflows({ octokit, ref, workflow_id })

  // check runs
  let result = await runs(octokit, dependencies, sha)

  if (result.length === 0) {
    core.info('no runs found for this workflow\'s dependencies')
    process.exit(0)
  }

  const successful = ['success', 'skipped']
  if (ignore) successful.push('cancelled')

  while (result.find(run => !successful.includes(run.conclusion))) {
    // exit early
    const failed = result.find(run => run.conclusion === 'failure')

    if (failed) {
      core.setFailed(`${failed.name}#${failed.id} => failed`)
      process.exit(1)
    }

    timer += delay

    // time out!
    if (timer >= timeout) {
      core.setFailed('workflow-run-wait timed out')
      process.exit(1)
    }

    for (const run of result) {
      core.info(`${run.name}#${run.id} => ${run.conclusion || 'pending'}`)
    }

    core.info(`runs were not successful, or have not started, try again in ${delay}`)

    // zzz
    await sleep(delay)

    // get the data again
    result = await runs(octokit, dependencies, sha)
  }

  for (const run of result) {
    core.info(`${run.name}#${run.id} => ${run.conclusion || 'pending'}`)
  }

  core.info('all runs completed successfully!')
}
