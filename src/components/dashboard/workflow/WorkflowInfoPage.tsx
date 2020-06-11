import React from "react";
import { RouteComponentProps, withRouter, Link } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import * as types from "./../../../redux/types";
import "antd/dist/antd.dark.css";
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
  Button,
} from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone, ExpandAltOutlined, AimOutlined } from "@ant-design/icons";

import {
  StatusApiFactory,
  RegistryApiFactory,
  ResponseRegistryItem,
  WebhookApiFactory,
  ResponseHTTPMessage,
} from "./../../../client";
import { AxiosResponse } from "axios";
import { config } from "../../../config";
import ReactJson from "react-json-view";

import PipelineGraph from "./../../common/PipelineGraph";
import { breadcrumbItemRender } from "./../../../utils/utils";

const { Content } = Layout;
const { Panel } = Collapse;
const { Title } = Typography;

interface RouteInfo {
  name: string;
}

interface State {
  key: string;
  initLoading: boolean;
  loadingSuccess: boolean;
  workflow: string;
  status: string;
}

const mapStateToProps = (state: types.ReduxState) => ({
  authToken: state.auth.authToken,
});

const connector = connect(mapStateToProps);
type ComponentProps = ConnectedProps<typeof connector> &
  RouteComponentProps<RouteInfo>;

class WorkflowInfoPage extends React.Component<ComponentProps, State> {
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

    RegistryApiFactory(config.getAPIConfig(this.props.authToken))
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

    StatusApiFactory(config.getAPIConfig(this.props.authToken))
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

    if (pipelines === null || pipelines === undefined) return [];

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

  invokeTrigger = (workflow: string, trigger: string) => {
    WebhookApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1WebhookTriggerWorkflowTriggerPipelineGet(workflow, "*", trigger)
      .then((resp: AxiosResponse<ResponseHTTPMessage>) => {
        if (resp !== undefined && resp.status === 200) {
          let item = resp.data.message;
          notification["info"]({
            message: "Trigger Invoked",
            description: item,
          });
        } else {
          notification["warning"]({
            message: "Error Invoking Trigger",
            description:
              "Non 200 status when invoking trigger: " +
              resp.status,
          });
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Error Invoking Trigger",
          description: "Error invoking trigger: " + error,
        });
      });
  };

  render() {
    if (this.state.initLoading) {
      return (
        <Layout className="spin-layout">
          <Spin />
        </Layout>
      );
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

    let pipelineCollapsableTable = () => (
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
                  <span>  
                    {this.getPipelineStatusTag(pipelineStatus["status"])}
                  </span>
                  <span></span>
                  <Tooltip title="Explore Pipeline">
                    <Button
                      type="primary"
                      icon={<ExpandAltOutlined />}
                      href={"/dashboard/workflows/" + name + "/pipeline/" + pipelineName}
                      size={"small"}
                    />
                  </Tooltip>
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
    );

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
            <Descriptions.Item label="Triggers">
              {
                <Space>
                  {Object.keys(workflow["spec"]["triggers"])
                    .map((name: string, index: number) => {
                      return (<Button
                        type="primary"
                        icon={<AimOutlined />}
                        onClick={() => this.invokeTrigger(workflow["metadata"]["name"], name)}
                        key={index}
                        size={"middle"}
                      >
                        Trigger - {name}
                      </Button>);
                  })
                }
                </Space>
              }
            </Descriptions.Item>
          </Descriptions>
          <Title level={4} className="top-gutter-width">
            Pipelines
          </Title>
          {pipelineStatusList === null ? (
            <Empty description={false} />
          ) : (
            pipelineCollapsableTable()
          )}
        </div>
      ),
      manifest: (
        <ReactJson
          src={JSON.parse(this.state.workflow)}
          enableClipboard={true}
          theme="tomorrow"
          iconStyle="triangle"
        />
      ),
      status: (
        <ReactJson
          src={JSON.parse(this.state.status)}
          enableClipboard={true}
          theme="tomorrow"
          iconStyle="triangle"
        />
      ),
    };

    return (
      <Content className="page-container">
        <PageHeader
          className="site-page-header"
          title={"Workflow - " + name}
          breadcrumb={{
            routes,
            itemRender: breadcrumbItemRender,
          }}
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

export default connector(withRouter(WorkflowInfoPage));
