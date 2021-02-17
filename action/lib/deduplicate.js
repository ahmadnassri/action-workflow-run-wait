/* eslint-disable camelcase */

// node modules
import { inspect } from 'util'

// packages
import core from '@actions/core'
import github from '@actions/github'

export default async function ({ octokit, workflow_id, run_id, sha }) {
  // get current run of this workflow
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
    ...github.context.repo,
    workflow_id
  })

  core.debug(`found ${workflow_runs.length} runs of workflow ${workflow_id}`)
  core.debug(inspect(workflow_runs.map(run => ({ id: run.id, name: run.name }))))

  // filter and sort
  const cancellable = workflow_runs
    // filter to relevant runs
    .filter(run => ['in_progress', 'queued'].includes(run.status))
    // filter to only runs for the same commit
    .filter(run => run.head_sha === sha)
    // exclude this one
    .filter(run => run.id !== run_id)
    // pick relevant properties
    .map(run => ({ id: run.id, name: run.name, created_at: run.created_at }))
    // sort
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  core.debug(`found ${cancellable.length} cancellable runs of workflow ${workflow_id}`)
  core.debug(inspect(cancellable.map(run => ({ id: run.id, name: run.name }))))

  // exclude last one (i.e. the first running instance)
  const prime = cancellable.pop()

  core.debug(`determined ${prime.id} to be the prime run of this workflow`)
  core.debug(inspect(prime))

  for (const run of cancellable) {
    core.info(`${run.id}: ${run.name} => canceling`)

    await octokit.request('POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel', {
      ...github.context.repo,
      run_id: run.id
    })
  }
}
