import React from "react";

import { Route, Switch } from "react-router";

import AgentsListComponent from "./agent/List";
import WorkflowsListComponent from "./workflow/List";
import SecretsListComponent from "./secret/List";

const Dashboard: React.FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path="/">
        <AgentsListComponent />
      </Route>
      <Route exact path="/dashboard">
        <AgentsListComponent />
      </Route>
      <Route path="/dashboard/agents">
        <AgentsListComponent />
      </Route>
      <Route path="/dashboard/workflows">
        <WorkflowsListComponent />
      </Route>
      <Route path="/dashboard/secrets">
        <SecretsListComponent />
      </Route>
    </Switch>
  );
};

export default Dashboard;
