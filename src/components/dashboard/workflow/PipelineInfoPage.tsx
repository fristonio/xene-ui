import React from "react";
import { RouteComponentProps, withRouter, Link } from "react-router-dom";
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
} from "antd";

import { InfoApiFactory, ResponsePipelineInfo } from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import ReactJson from "react-json-view";
import PipelineGraph from "./../../common/PipelineGraph";

const { Content } = Layout;

interface RouteInfo {
  pipeline: string;
  workflow: string;
}

interface Props extends RouteComponentProps<RouteInfo> {}

interface State {
  key: string;
  initLoading: boolean;
  loadingSuccess: boolean;
  info: ResponsePipelineInfo;
}

class PipelineInfoPage extends React.Component<Props, State> {
  state = {
    key: "info",
    initLoading: true,
    loadingSuccess: false,
    info: {} as ResponsePipelineInfo,
  };

  componentDidMount() {
    this.getPipelineInfo((res: ResponsePipelineInfo, success: boolean) => {
      this.setState({
        initLoading: false,
        loadingSuccess: success,
        info: res,
      });
    });
  }

  getPipelineInfo = (
    callback: (res: ResponsePipelineInfo, success: boolean) => void
  ) => {
    let { pipeline, workflow } = this.props.match.params;

    InfoApiFactory(config.getAPIConfig())
      .apiV1InfoWorkflowNamePipelinePipelineGet(workflow, pipeline)
      .then((response: AxiosResponse<ResponsePipelineInfo>) => {
        if (response !== undefined && response.status === 200) {
          let item = response.data;
          callback(item, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching workflow info: " + response.status,
          });
          callback(response.data, false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching workflow info: " + error,
        });
      });
  };

  onTabChange = (key: string) => {
    this.setState({
      key: key,
    });
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

    let { pipeline, workflow } = this.props.match.params;
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
    ];

    const tabList = [
      {
        key: "info",
        tab: "Pipeline Info",
      },
      {
        key: "graph",
        tab: "Pipeline Graph",
      },
      {
        key: "manifest",
        tab: "Pipeline Manifest",
      },
    ];

    let pipelineSpec = JSON.parse(
      this.state.info.spec !== undefined ? this.state.info.spec : "{}"
    );

    const contentList = {
      info: <div>INFO</div>,
      manifest: <ReactJson src={pipelineSpec} />,
      graph: (
        <Layout>
          <PipelineGraph pipeline={pipeline} tasks={pipelineSpec["tasks"]} />
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
            title={pipeline}
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={(key) => {
              this.onTabChange(key);
            }}
          >
            {this.state.key === "info" ||
            this.state.key === "graph" ||
            this.state.key === "manifest" ? (
              contentList[this.state.key]
            ) : (
              <Empty description={false} />
            )}
          </Card>
        </Layout>
      </Content>
    );
  }
}

export default withRouter(PipelineInfoPage);
