import github from '@actions/github'

export default async function (octokit, dependencies) {
  // extract sha
  const { sha } = github.context

  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', { // eslint-disable-line camelcase
    ...github.context.repo
  })

  return workflow_runs
    // filter to relevant runs
    .filter(run => dependencies.includes(run.name) && run.head_sha === sha)
    // pick properties
    .map(run => ({ id: run.id, name: run.name, conclusion: run.conclusion }))
}
