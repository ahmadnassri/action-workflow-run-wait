/* eslint-disable camelcase */

import core from '@actions/core'
import github from '@actions/github'

export default async function (octokit) {
  // extract sha
  const { sha, runId: run_id } = github.context

  // get workflow id from run id
  const { data: { workflow_id } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
    ...github.context.repo,
    run_id
  })

  // get current run of this workflow
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
    ...github.context.repo
  })

  // find any instances of the same workflow
  const cancellable = workflow_runs
    // filter to relevant runs
    .filter(run => ['in_progress', 'queued'].includes(run.status) && run.workflow_id === workflow_id && run.head_sha === sha)
    // pick relevant properties
    .map(run => ({ id: run.id, name: run.name, created_at: run.created_at }))
    // sort
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // remove last one
  cancellable.pop()

  for (const run of cancellable) {
    core.info(`${run.id}: ${run.name} => cancel`)

    await octokit.request('POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel', {
      ...github.context.repo,
      run_id: run.id
    })
  }
}
