import React from "react";

import { Route, Switch } from "react-router";
import { Redirect } from "react-router-dom";

import { Result, Button } from "antd";

import AgentsListComponent from "./agent/List";
import AgentInfoPage from "./agent/AgentInfoPage";
import WorkflowsListComponent from "./workflow/List";
import WorkflowInfoPage from "./workflow/WorkflowInfoPage";
import PipelineInfoPage from "./workflow/PipelineInfoPage";
import PipelineRunPage from "./workflow/PipelineRunPage";
import SecretsListComponent from "./secret/List";

import "./../../styles/dashboard.css";

const Dashboard = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/dashboard/agents" />
      </Route>
      <Route exact path="/dashboard">
        <Redirect to="/dashboard/agents" />
      </Route>
      <Route exact path="/dashboard/agents">
        <AgentsListComponent />
      </Route>
      <Route path="/dashboard/agents/:name">
        <AgentInfoPage />
      </Route>
      <Route exact path="/dashboard/workflows">
        <WorkflowsListComponent />
      </Route>
      <Route
        exact
        path="/dashboard/workflows/:workflow/pipeline/:pipeline/runs/:runID"
      >
        <PipelineRunPage />
      </Route>
      <Route exact path="/dashboard/workflows/:workflow/pipeline/:pipeline">
        <PipelineInfoPage />
      </Route>
      <Route path="/dashboard/workflows/:name">
        <WorkflowInfoPage />
      </Route>
      <Route path="/dashboard/secrets">
        <SecretsListComponent />
      </Route>
      <Route path="*">
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <Button type="primary" href="/">
              Back Home
            </Button>
          }
          className="no-route-match"
        />
      </Route>
    </Switch>
  );
};

export default Dashboard;
