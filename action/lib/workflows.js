/* eslint-disable camelcase */

// packages
import yaml from 'yaml'
import github from '@actions/github'
import core from '@actions/core'

export default async function ({ octokit, ref, workflow_id }) {
  // get the file name from the workflow
  const { data: { path } } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}', {
    ...github.context.repo,
    workflow_id
  })

  core.debug(`workflow.path: ${path}`)

  // get the workflow content
  const { data: { content } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    ...github.context.repo,
    path,
    ref
  })

  core.debug(`workflow content: ${content.length} bytes`)

  const { on: { workflow_run: { workflows } } } = yaml.parse(Buffer.from(content, 'base64').toString())

  core.debug(`workflow dependencies: ${workflows}`)

  return workflows
}
