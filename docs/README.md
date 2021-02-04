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

| input          | required | default        | description                                     |
| -------------- | -------- | -------------- | ----------------------------------------------- |
| `github-token` | ❌        | `github.token` | The GitHub token used to call the GitHub API    |
| `timeout`      | ❌        | `30000`        | timeout before we stop trying (in milliseconds) |
| `delay`        | ❌        | `5000`         | delay between status checks (in milliseconds)   |
