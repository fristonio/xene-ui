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
  Tooltip,
  Descriptions,
  Spin,
  notification,
  Result,
  Badge,
  Tag,
  Space,
} from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ApiTwoTone,
} from "@ant-design/icons";
import {
  InfoApiFactory,
  ResponseAgentVerboseInfo,
  ResponseAgentWorkflowInfo,
  ResponseAgentSecretInfo,
  ResponseAgentTriggerInfo,
} from "./../../../client";
import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { breadcrumbItemRender } from "./../../../utils/utils";

const { Content } = Layout;

interface RouteInfo {
  name: string;
}

interface State {
  key: string;
  workflowKey: number;
  initLoading: boolean;
  loadingSuccess: boolean;
  data: ResponseAgentVerboseInfo;
}

const mapStateToProps = (state: types.ReduxState) => ({
  authToken: state.auth.authToken,
});

const connector = connect(mapStateToProps);
type ComponentProps = ConnectedProps<typeof connector> &
  RouteComponentProps<RouteInfo>;

class AgentInfoPage extends React.Component<ComponentProps, State> {
  state = {
    key: "info",
    workflowKey: 0,
    initLoading: true,
    loadingSuccess: false,
    data: {
      healthy: true,
      name: "",
      serverName: "",
      secure: true,
      address: "",
      workflows: new Array<ResponseAgentWorkflowInfo>(),
      secrets: new Array<ResponseAgentSecretInfo>(),
    },
  };

  componentDidMount() {
    this.getAgentInfo((res: ResponseAgentVerboseInfo, success: boolean) => {
      this.setState({
        initLoading: false,
        loadingSuccess: success,
        data: res,
      });
    });
  }

  getAgentInfo = (
    callback: (res: ResponseAgentVerboseInfo, success: boolean) => void
  ) => {
    let { name } = this.props.match.params;

    InfoApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1InfoAgentNameGet(name)
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          callback(response.data, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching agent info: " + response.status,
          });
          callback({}, false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching agent info: " + error,
        });
        callback({}, false);
      });
  };

  onTabChange = (key: string, type: string) => {
    if (type === "info")
      this.setState({
        key: key,
      });
    if (type === "workflow")
      this.setState({
        workflowKey: parseInt(key),
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
        path: "/dashboard/agents",
        breadcrumbName: "Agents",
      },
      {
        path: "/dashboard/agents/" + name,
        breadcrumbName: "Agent - " + name,
      },
    ];

    const tabList = [
      {
        key: "info",
        tab: "Agent Info",
      },
      {
        key: "logs",
        tab: "Agent Logs",
      },
    ];

    let workflowTabList = new Array<{ key: string; tab: string }>();
    let workflowContentList = new Array<any>();

    this.state.data.workflows.map(
      (val: ResponseAgentWorkflowInfo, index: number) => {
        workflowTabList.push({
          key: index.toString(),
          tab: val.name ? val.name : "",
        });

        if (val.triggers !== undefined)
          workflowContentList[index] = val.triggers.map(
            (triggerInfo: ResponseAgentTriggerInfo, index: number) => {
              return (
                <Card
                  key={index.toString()}
                  title={
                    <Space>
                      <ApiTwoTone />
                      {triggerInfo.name}
                    </Space>
                  }
                  bordered={true}
                  style={{ width: 300, margin: 20 }}
                >
                  <Space direction="vertical">
                    {triggerInfo.pipelines?.map((p: string) => {
                      return <Link to={"/dashboard/pipelines/" + p}>{p}</Link>;
                    })}
                  </Space>
                </Card>
              );
            }
          );
        else workflowContentList[index] = <Empty description={false} />;
      }
    );

    const contentList = {
      info: (
        <Descriptions title="" bordered>
          <Descriptions.Item label="Name">
            {this.state.data.name}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {this.state.data.address}
          </Descriptions.Item>
          <Descriptions.Item label="Secure">
            {this.state.data.secure ? (
              <Tooltip title="Agent Secure" className="status-tooltip-icon">
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </Tooltip>
            ) : (
              <Tooltip title="Agent Insecure" className="status-tooltip-icon">
                <CloseCircleTwoTone twoToneColor="#eb2f96" />
              </Tooltip>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Server Name">
            {this.state.data.serverName}
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={3}>
            {this.state.data.healthy ? (
              <Badge status="processing" text="Healthy" />
            ) : (
              <Badge status="error" text="Not Healthy" />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Secrets" span={4}>
            <Space direction="vertical">
              {this.state.data.secrets.length > 0 ? (
                this.state.data.secrets.map(
                  (val: ResponseAgentSecretInfo, index: number) => {
                    return (
                      <Tag color="blue" key={index}>
                        {val.type + " - " + val.name}
                      </Tag>
                    );
                  }
                )
              ) : (
                <Badge
                  status="warning"
                  text="No secrets configured for agent"
                />
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Workflows">
            {this.state.data.workflows.length > 0 ? (
              <Card
                tabList={workflowTabList}
                activeTabKey={this.state.workflowKey.toString()}
                onTabChange={(key) => {
                  this.onTabChange(key, "workflow");
                }}
              >
                <div style={{ display: "flex" }}>
                  {workflowContentList[this.state.workflowKey]}
                </div>
              </Card>
            ) : (
              <Empty description={false} />
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
      logs: <Empty description={false} />,
    };

    return (
      <Content className="page-container">
        <PageHeader
          className="site-page-header"
          title={"Agent - " + name}
          breadcrumb={{ routes, itemRender: breadcrumbItemRender }}
          subTitle={"Information about the agent"}
        />
        <Layout>
          <Card
            title={name}
            extra={
              this.state.data.healthy ? (
                <Tooltip
                  title="Agent Available"
                  className="status-tooltip-icon"
                >
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                </Tooltip>
              ) : (
                <Tooltip
                  title="Agent not Available"
                  className="status-tooltip-icon"
                >
                  <CloseCircleTwoTone twoToneColor="#eb2f96" />
                </Tooltip>
              )
            }
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={(key) => {
              this.onTabChange(key, "info");
            }}
          >
            {this.state.key === "info" || this.state.key === "logs" ? (
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

export default connector(withRouter(AgentInfoPage));
