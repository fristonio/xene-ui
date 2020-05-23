import React from "react";
import { RouteComponentProps, withRouter, Link } from "react-router-dom";
import { Route, Switch } from "react-router";
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
  Descriptions,
  Collapse,
  Tag,
  Typography,
  Space,
  Tooltip,
} from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

import {
  StatusApiFactory,
  RegistryApiFactory,
  ResponseRegistryItem,
} from "./../../../client";
import { AxiosResponse } from "axios";
import { config } from "../../../config";
import ReactJson from "react-json-view";

import PipelineGraph from "./../../common/PipelineGraph";
import PipelineInfoPage from "./PipelineInfoPage";

const { Content } = Layout;
const { Panel } = Collapse;
const { Title } = Typography;

interface RouteInfo {
  name: string;
}

interface Props extends RouteComponentProps<RouteInfo> {}

interface State {
  key: string;
  initLoading: boolean;
  loadingSuccess: boolean;
  workflow: string;
  status: string;
}

class WorkflowInfoPage extends React.Component<Props, State> {
  state = {
    key: "info",
    initLoading: true,
    loadingSuccess: false,
    workflow: "{}",
    status: "{}",
  };

  componentDidMount() {
    this.getWorkflowInfo((res: string, success: boolean) => {
      this.getWorkflowStatus((status: string, s: boolean) => {
        this.setState({
          initLoading: false,
          loadingSuccess: success && s,
          workflow: res,
          status: status,
        });
      });
    });
  }

  getWorkflowInfo = (callback: (res: string, success: boolean) => void) => {
    let { name } = this.props.match.params;

    RegistryApiFactory(config.getAPIConfig())
      .apiV1RegistryWorkflowNameGet(name)
      .then((response: AxiosResponse<ResponseRegistryItem>) => {
        if (response !== undefined && response.status === 200) {
          let item = response.data.item?.value;
          callback(item !== undefined ? item : "", true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching workflow info: " + response.status,
          });
          callback("{}", false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching workflow info: " + error,
        });
        callback("{}", false);
      });
  };

  getWorkflowStatus = (callback: (res: string, success: boolean) => void) => {
    let { name } = this.props.match.params;

    StatusApiFactory(config.getAPIConfig())
      .apiV1StatusWorkflowNameGet(name)
      .then((response: AxiosResponse<ResponseRegistryItem>) => {
        if (response !== undefined && response.status === 200) {
          let item = response.data.item?.value;
          callback(item !== undefined ? item : "", true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching workflow status: " +
              response.status,
          });
          callback("{}", false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching workflow status: " + error,
        });
        callback("{}", false);
      });
  };

  onTabChange = (key: string) => {
    this.setState({
      key: key,
    });
  };

  getAgents = (): Array<string> => {
    let wfStatus = JSON.parse(this.state.status);
    let pipelines: Object = wfStatus["pipelines"];

    if (pipelines === null || pipelines == undefined) return [];

    let agents: Array<string> = [];
    for (let status of Object.values(pipelines)) {
      agents.push(status["executor"]);
    }

    return agents.filter((elem: string, i: number, arr: string[]) => {
      if (arr.indexOf(elem) === i) {
        return elem;
      }
    });
  };

  getPipelineStatusTag = (status: string) => {
    let statusIcon =
      status === "Scheduled" ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <CloseCircleTwoTone twoToneColor="#eb2f96" />
      );
    return (
      <Space>
        <Tooltip title={status}>{statusIcon}</Tooltip>
        <span>{status}</span>
      </Space>
    );
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

    let { name } = this.props.match.params;
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
        path: "/dashboard/workflows/" + name,
        breadcrumbName: "Workflow - " + name,
      },
    ];

    const tabList = [
      {
        key: "info",
        tab: "Info",
      },
      {
        key: "manifest",
        tab: "Workflow Manifest",
      },
      {
        key: "status",
        tab: "Status Manifest",
      },
    ];

    let workflow = JSON.parse(this.state.workflow);
    let pipelineStatusList = JSON.parse(this.state.status)["pipelines"];
    let pipelinesList = workflow["spec"]["pipelines"];

    const contentList = {
      info: (
        <div>
          <Descriptions title="" bordered>
            <Descriptions.Item label="Name">
              {workflow["metadata"]["name"]}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={12}>
              {workflow["metadata"]["description"]}
            </Descriptions.Item>
            <Descriptions.Item label="Configured Agents">
              {this.getAgents().map((name: string, index: number) => {
                return (
                  <Tag color="blue" key={index}>
                    {name}
                  </Tag>
                );
              })}
            </Descriptions.Item>
          </Descriptions>
          <Title level={4} className="top-gutter-width">
            Pipelines
          </Title>
          <Collapse defaultActiveKey={[]}>
            {Object.keys(pipelinesList).map(
              (pipelineName: string, index: number) => {
                let pipeline = pipelinesList[pipelineName];
                let pipelineStatus = pipelineStatusList[pipelineName];
                let getPanelHeader = () => (
                  <div className="space-between">
                    <span>
                      <b>
                        <Link
                          to={
                            "/dashboard/workflows/" +
                            name +
                            "/pipeline/" +
                            pipelineName
                          }
                        >
                          {pipelineName}
                        </Link>
                      </b>{" "}
                      - {pipeline["description"]}
                    </span>
                    <Space>
                      <Tag color="blue" key={index}>
                        {pipeline["trigger"]}
                      </Tag>
                      {this.getPipelineStatusTag(pipelineStatus["status"])}
                    </Space>
                  </div>
                );

                return (
                  <Panel header={getPanelHeader()} key={pipelineName}>
                    <PipelineGraph
                      pipeline={pipelineName}
                      tasks={pipelinesList[pipelineName]["tasks"]}
                    />
                  </Panel>
                );
              }
            )}
          </Collapse>
        </div>
      ),
      manifest: <ReactJson src={JSON.parse(this.state.workflow)} />,
      status: <ReactJson src={JSON.parse(this.state.status)} />,
    };

    return (
      <Content className="page-container">
        <PageHeader
          className="site-page-header"
          title={"Workflow - " + name}
          breadcrumb={{ routes }}
          subTitle={"Information about the Workflow"}
        />
        <Layout>
          <Card
            title={name}
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={(key) => {
              this.onTabChange(key);
            }}
          >
            {this.state.key === "info" ||
            this.state.key === "manifest" ||
            this.state.key === "status" ? (
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

export default withRouter(WorkflowInfoPage);
