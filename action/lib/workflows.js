import yaml from 'yaml'
import github from '@actions/github'

export default async function (octokit) {
  // extract sha
  const { ref, runId: run_id } = github.context // eslint-disable-line camelcase

  // get workflow id from run id
  const { data: { workflow_id } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', { // eslint-disable-line camelcase
    owner: 'hashtagpaid',
    repo: 'template-api',
    run_id
  })

  // get the file name from the workflow
  const { data: { path } } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}', {
    owner: 'hashtagpaid',
    repo: 'template-api',
    workflow_id
  })

  // get the workflow content
  const { data: { content } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'hashtagpaid',
    repo: 'template-api',
    ref,
    path
  })

  const { on: { workflow_run: { workflows } } } = yaml.parse(Buffer.from(content, 'base64').toString())

  return workflows
}
