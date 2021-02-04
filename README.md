# GitHub Action: Workflow Run Wait

wait for all `workflow_run` required workflows to be successful

[![license][license-img]][license-url]
[![release][release-img]][release-url]
[![super linter][super-linter-img]][super-linter-url]
[![test][test-img]][test-url]
[![semantic][semantic-img]][semantic-url]

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

| input          | required | default        | description                                     |
|----------------|----------|----------------|-------------------------------------------------|
| `github-token` | ❌        | `github.token` | The GitHub token used to call the GitHub API    |
| `timeout`      | ❌        | `30000`        | timeout before we stop trying (in milliseconds) |
| `delay`        | ❌        | `5000`         | delay between status checks (in milliseconds)   |

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
