# Xene UI

> Xene is a distributed workflow runner with focus on performance and simplicity.

[![Netlify Status](https://api.netlify.com/api/v1/badges/f139f04c-cb0e-457d-8eaf-5c512aea40b6/deploy-status)](https://app.netlify.com/sites/xene-ui/deploys) [![Xene Docs Status](https://api.netlify.com/api/v1/badges/f3adc406-ad04-4059-ad21-6a54f4be6771/deploy-status)](https://app.netlify.com/sites/sad-thompson-bcaa9a/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains the Beta UI implementation of Xene. This can be used to interact with Xene, manage workflows
run pipelines, trigger flows, configure notification etc. The UI is built on Top of Typescript and React. All the API
interaction with the Xene APIServer is done using the API library generated from the swagger spec of the API server.

You can find Xene API Documentation [here](https://xene-api-docs.netlify.app/apidocs.html).

## Installation

Follow below mentioned instruction to set up xene.

```bash
$ git clone https://github.com/fristonio/xene-ui && cd xene-ui

# To run the developement server
$ yarn start
Development server is running on http://localhost:3000/

# To build UI
$ yarn build
```

## UI Screens

### Agents List Page

![Agents List Page UI](/res/images/AgentsPage.png)

### Workflow List Page

![Workflow List Page UI](/res/images/WorkflowListPage.png)

### Workflow Info Page

![Workflow Info Page](/res/images/WorkflowInfoPage.png)

### Pipelines Info Page

![Pipelines Info Page](/res/images/PipelinesRunInfoPage.png)

### Pipeline Run Info Page

![Pipeline Run Info Page](/res/images/PipelineRunPage.png)

## License

Xene UI is licensed under [MIT License](https://github.com/fristonio/xene/blob/master/LICENSE.md).

## Contact

If you have any queries regarding the project or just want to say hello, feel free to drop a mail at deepshpathak@gmail.com.
