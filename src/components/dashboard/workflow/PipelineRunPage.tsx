import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import * as types from "./../../../redux/types";
import "antd/dist/antd.css";
import "./../../../styles/index.css";
import "./../../../styles/dashboard.css";
import {
  Layout,
  PageHeader,
  Card,
  Empty,
  Spin,
  notification,
  Result,
  message,
} from "antd";

import { LazyLog } from "react-lazylog";

import {
  InfoApiFactory,
  ResponsePipelineRunVerboseInfo,
  ResponseRegistryItem,
} from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import ReactJson from "react-json-view";
import {
  PipelineGraphVerbose,
  Task,
  Step,
} from "./../../common/PipelineGraphVerbose";

const { Content } = Layout;

interface RouteInfo {
  pipeline: string;
  workflow: string;
  runID: string;
}

interface State {
  key: string;
  initLoading: boolean;
  loadingSuccess: boolean;
  info: ResponsePipelineRunVerboseInfo;
  spec: string;
}

const mapStateToProps = (state: types.ReduxState) => ({
  authToken: state.auth.authToken,
});

const connector = connect(mapStateToProps);
type ComponentProps = ConnectedProps<typeof connector> &
  RouteComponentProps<RouteInfo>;

class PiplineRunPage extends React.Component<ComponentProps, State> {
  state = {
    key: "graph",
    initLoading: true,
    loadingSuccess: false,
    info: {} as ResponsePipelineRunVerboseInfo,
    spec: "{}",
  };

  logViewerRef: React.RefObject<LazyLog> = React.createRef();

  componentDidMount() {
    this.getPipelineRunInfo(
      (res: ResponsePipelineRunVerboseInfo, success: boolean) => {
        this.getPipelineSpec((r: string, s: boolean) => {
          this.setState({
            initLoading: false,
            loadingSuccess: success && s,
            info: res,
            spec: r,
          });
        });
      }
    );
  }

  getPipelineRunInfo = (
    callback: (res: ResponsePipelineRunVerboseInfo, success: boolean) => void
  ) => {
    let { pipeline, workflow, runID } = this.props.match.params;

    InfoApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1InfoWorkflowWorkflowPipelinePipelineRunsRunIDGet(
        workflow,
        pipeline,
        runID
      )
      .then((response: AxiosResponse<ResponsePipelineRunVerboseInfo>) => {
        if (response !== undefined && response.status === 200) {
          let item = response.data;
          callback(item, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching pipeline run info: " +
              response.status,
          });
          callback(response.data, false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching pipeline run info: " + error,
        });
      });
  };

  getPipelineSpec = (callback: (res: string, success: boolean) => void) => {
    let { workflow, pipeline } = this.props.match.params;

    InfoApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1InfoWorkflowWorkflowPipelinePipelineSpecGet(workflow, pipeline)
      .then((response: AxiosResponse<ResponseRegistryItem>) => {
        if (response !== undefined && response.status === 200) {
          let item = response.data.item?.value;
          if (item === "" || item === undefined) {
            notification["error"]({
              message: "Fetch Error",
              description:
                "Pipeline spec with the name " + pipeline + "not found",
            });
            callback("{}", false);
            return;
          }
          callback(item, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching pipeline spec: " + response.status,
          });
          callback("{}", false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching pipeline spec: " + error,
        });
        callback("{}", false);
      });
  };

  onTabChange = (key: string) => {
    this.setState({
      key: key,
    });
  };

  getTasks = () => {
    let tasks = new Array<Task>();
    let spec = JSON.parse(this.state.spec);
    let runInfo = JSON.parse(
      this.state.info.runInfo !== undefined ? this.state.info.runInfo : "{}"
    );

    for (let key in runInfo["tasks"]) {
      let steps = new Array<Step>();
      let t = runInfo["tasks"][key];
      let tSpec = spec["tasks"][key];

      let stepCount = tSpec["steps"].length;

      for (let i = 0; i < stepCount; i++) {
        let sSpec = tSpec["steps"][i];
        let stepName = sSpec["name"];

        let s = t["steps"][stepName];
        steps.push({
          name: stepName,
          status: s["status"],
          time: s["time"],
          logFile: s["logFile"],
          type: sSpec["type"],
        });
      }

      tasks.push({
        id: key,
        name: key,
        dependencies: tSpec["dependencies"],
        status: t["status"],
        description: t["description"],
        steps: steps,
      });
    }

    return tasks;
  };

  render() {
    if (this.state.initLoading) {
      return <Spin />;
    }

    if (!this.state.initLoading && !this.state.loadingSuccess) {
      return (
        <Result
          status="404"
          title="Loading Error"
          subTitle="Sorry, there was some error loading the page."
        />
      );
    }

    let { pipeline, workflow, runID } = this.props.match.params;
    const routes = [
      {
        path: "/dashboard",
        breadcrumbName: "Dashboard",
      },
      {
        path: "/dashboard/workflows",
        breadcrumbName: "Workflows",
      },
      {
        path: "/dashboard/workflows/" + workflow,
        breadcrumbName: "Workflow - " + workflow,
      },
      {
        path: "/dashboard/workflows/" + workflow + "/pipeline/" + pipeline,
        breadcrumbName: "Pipeline - " + pipeline,
      },
      {
        path:
          "/dashboard/workflows/" +
          workflow +
          "/pipeline/" +
          pipeline +
          "/runs/" +
          runID,
        breadcrumbName: "Run - " + runID,
      },
    ];

    const tabList = [
      {
        key: "graph",
        tab: "Pipeline Graph",
      },
      {
        key: "manifest",
        tab: "Run Status Manifest",
      },
      {
        key: "logs",
        tab: "Pipeline Logs",
      },
    ];

    let runInfo = JSON.parse(
      this.state.info.runInfo !== undefined ? this.state.info.runInfo : "{}"
    );

    let logsURL =
      "http://" +
      this.state.info.baseLogURL +
      "/workflow/" +
      workflow +
      "/pipeline/" +
      pipeline +
      "/runs/" +
      runID +
      "/logs";

    const contentList = {
      logs: (
        <div className="logs-container">
          <LazyLog
            url={logsURL}
            enableSearch={true}
            onError={(error: any) =>
              message.error("Error loading log: ", error)
            }
            height={600}
            extraLines={1}
            ref={this.logViewerRef}
            caseInsensitive
          />
        </div>
      ),
      manifest: <ReactJson src={runInfo} />,
      graph: (
        <Layout>
          <PipelineGraphVerbose pipeline={pipeline} tasks={this.getTasks()} />
        </Layout>
      ),
    };

    return (
      <Content className="page-container">
        <PageHeader
          className="site-page-header"
          title={"Pipeline - " + pipeline}
          breadcrumb={{ routes }}
          subTitle={"Information about the Workflow"}
        />
        <Layout>
          <Card
            title={"Run - " + runID}
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={(key) => {
              this.onTabChange(key);
            }}
          >
            {this.state.key === "logs" ? (
              contentList.logs
            ) : this.state.key === "manifest" ? (
              contentList.manifest
            ) : this.state.key === "graph" ? (
              contentList.graph
            ) : (
              <Empty description={false} />
            )}
          </Card>
        </Layout>
      </Content>
    );
  }
}

export default connector(withRouter(PiplineRunPage));
