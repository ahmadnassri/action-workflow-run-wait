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
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs?status=queued', {
    ...github.context.repo
  })

  // find any instances of the same workflow
  workflow_runs
    // filter to relevant runs
    .filter(run => run.workflow_id === workflow_id && run.head_sha === sha)
    // pick relevant properties
    .map(run => ({ id: run.id, name: run.name, created_at: run.created_at }))
    // sort
    .sort(run => (a, b) => new Date(b.created_at) - new Date(a.created_at))
    // remove last one
    .pop()

  // sort
  for (const run of workflow_runs) {
    core.info(`${run.id}: ${run.name} => ${run.created_at}`)

    await octokit.request('POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel', {
      ...github.context.repo,
      run_id: run.id
    })
  }
}