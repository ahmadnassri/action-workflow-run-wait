/* eslint-disable camelcase */

// node modules
import { inspect } from 'util'

// packages
import core from '@actions/core'
import github from '@actions/github'

export default async function ({ octokit, workflow_id, run_id }) {
  // get current run of this workflow
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
    ...github.context.repo,
    per_page: 100,
    workflow_id
  })

  const { sha } = github.context

  // filter and sort
  const cancellable = workflow_runs
    // filter to relevant runs
    .filter(run => ['in_progress', 'queued'].includes(run.status))
    // filter to only runs for the same commit
    .filter(run => run.head_sha === sha)
    // pick relevant properties
    .map(run => ({ id: run.id, name: run.name, created_at: run.created_at }))
    // sort
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // there can only be one
  if (cancellable.length <= 1) {
    core.info(`found no cancellable runs of workflow #${workflow_id}`)
    core.debug(inspect(cancellable.map(run => ({ id: run.id, name: run.name }))))

    return
  }

  core.info(`found ${cancellable.length} cancellable runs of workflow #${workflow_id}`)
  core.debug(inspect(cancellable.map(run => ({ id: run.id, name: run.name }))))

  // exclude last one (i.e. the first running instance)
  const prime = cancellable.pop()

  core.info(`determined run #${prime.id} to be the primary run of this workflow`)
  core.debug(inspect(prime))

  for (const run of cancellable) {
    core.info(`${run.name}#${run.id} => canceling`)

    await octokit.request('POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel', {
      ...github.context.repo,
      run_id: run.id
    })
  }
}
