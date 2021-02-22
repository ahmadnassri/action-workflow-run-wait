<details>
  <summary><strong>Why?</strong></summary>
  
  The [`workflow_run`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_run) event occurs when a workflow run is requested or completed, and allows you to execute a workflow based on the finished result of another workflow.

###### example

```yaml
on:
workflow_run:
  workflows: [ test ]
  types: 
    - completed
```

  However by itself, this doesn't quite work as expected.

1. The `completed` type, does not indicate success, for that you'd have to include the following in each job of your workflow:
   ```yaml
   if: ${{ github.event.workflow_run.conclusion == 'success' }}
   ```

2. If you're depending on more than one workflow, then ANY of them completing, will trigger the event

   ###### example

   ```yaml
   name: deploy

   on:
   workflow_run:
     workflows: [ test, lint, compile ]
     types: 
       - completed
   ```

   > _if your `test` workflow fails, but `lint` completed successfully, `github.event.workflow_run.conclusion == 'success'` will still be true_

3. Your workflow will trigger as many times as you have workflow dependencies

       > _in the previous example, our `deploy` workflow, will run 3 times!_

   All this makes the `workflow_run` event fundamentally broken for any advanced usage, this Action aims to remedy that.

   > _**Note**: See this [Community discussion](https://github.community/t/workflow-run-completed-event-triggered-by-failed-workflow/128001/5) for more info on the topic_

</details>

## Usage

```yaml
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
| ------------------ | -------- | -------------- | ----------------------------------------------- |
| `github-token`     | ❌        | `github.token` | The GitHub token used to call the GitHub API    |
| `timeout`          | ❌        | `30000`        | timeout before we stop trying (in milliseconds) |
| `delay`            | ❌        | `5000`         | delay between status checks (in milliseconds)   |
| `sha`              | ❌        | `github.sha`   | Git SHA, if it's different from `github.sha`    |
| `ignore-cancelled` | ❌        | `false`        | ignore cancelled workflow runs                  |
