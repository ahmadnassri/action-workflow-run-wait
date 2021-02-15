// node modules
import { inspect } from 'util'

// packages
import core from '@actions/core'
import github from '@actions/github'

export default async function (octokit, dependencies, sha) {
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', { // eslint-disable-line camelcase
    ...github.context.repo
  })

  const runs = workflow_runs
    // filter to relevant runs
    .filter(run => dependencies.includes(run.name) && run.head_sha === sha)
    // pick properties
    .map(run => ({ id: run.id, name: run.name, conclusion: run.conclusion }))

  core.debug(`found ${runs.length} workflow runs of ${inspect(dependencies)}`)
  core.debug(inspect(runs.map(run => ({ id: run.id, name: run.name }))))

  return runs
}
