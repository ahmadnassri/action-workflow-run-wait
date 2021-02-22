# GitHub Action: Workflow Run Wait

wait for all `workflow_run` required workflows to be successful

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![semantic][semantic-img]][semantic-url]

<details>
  <summary><strong>Why?</strong></summary>

The [`workflow_run`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_run) event occurs when a workflow run is requested or completed, and allows you to execute a workflow based on the finished result of another workflow.

###### example

``` yaml
on:
workflow_run:
  workflows: [ test ]
  types: 
    - completed
```

However by itself, this doesn't quite work as expected.

1.  The `completed` type, does not indicate success, for that you'd have to include the following in each job of your workflow:

    ``` yaml
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    ```

2.  If you're depending on more than one workflow, then ANY of them completing, will trigger the event

    ###### example

    ``` yaml
    name: deploy

    on:
    workflow_run:
      workflows: [ test, lint, compile ]
      types: 
        - completed
    ```

    > *if your `test` workflow fails, but `lint` completed successfully, `github.event.workflow_run.conclusion == 'success'` will still be true*

3.  Your workflow will trigger as many times as you have workflow dependencies

        > _in the previous example, our `deploy` workflow, will run 3 times!_

    All this makes the `workflow_run` event fundamentally broken for any advanced usage, this Action aims to remedy that.

    > ***Note**: See this [Community discussion](https://github.community/t/workflow-run-completed-event-triggered-by-failed-workflow/128001/5) for more info on the topic*

</details>

## Usage

``` yaml
on:
  workflow_run:
    workflows: [ test-client, test-server ]
    branches: [ master ]
    types: [ completed ]

jobs:
  xyz:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - uses: ahmadnassri/action-workflow-run-wait@v1

      # only runs additional steps if [ test-client, test-server ] were successful
```

### Inputs

| input              | required | default        | description                                     |
|--------------------|----------|----------------|-------------------------------------------------|
| `github-token`     | ❌        | `github.token` | The GitHub token used to call the GitHub API    |
| `timeout`          | ❌        | `30000`        | timeout before we stop trying (in milliseconds) |
| `delay`            | ❌        | `5000`         | delay between status checks (in milliseconds)   |
| `sha`              | ❌        | `github.sha`   | Git SHA, if it's different from `github.sha`    |
| `ignore-cancelled` | ❌        | `false`        | ignore cancelled workflow runs                  |

----
> Author: [Ahmad Nassri](https://www.ahmadnassri.com/) &bull;
> Twitter: [@AhmadNassri](https://twitter.com/AhmadNassri)

[license-url]: LICENSE
[license-img]: https://badgen.net/github/license/ahmadnassri/action-workflow-run-wait

[release-url]: https://github.com/ahmadnassri/action-workflow-run-wait/releases
[release-img]: https://badgen.net/github/release/ahmadnassri/action-workflow-run-wait

[super-linter-url]: https://github.com/ahmadnassri/action-workflow-run-wait/actions?query=workflow%3Asuper-linter
[super-linter-img]: https://github.com/ahmadnassri/action-workflow-run-wait/workflows/super-linter/badge.svg

[test-url]: https://github.com/ahmadnassri/action-workflow-run-wait/actions?query=workflow%3Atest
[test-img]: https://github.com/ahmadnassri/action-workflow-run-wait/workflows/test/badge.svg

[semantic-url]: https://github.com/ahmadnassri/action-workflow-run-wait/actions?query=workflow%3Arelease
[semantic-img]: https://badgen.net/badge/📦/semantically%20released/blue
