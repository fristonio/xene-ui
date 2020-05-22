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
import {
  StatusApiFactory,
  RegistryApiFactory,
  ResponseRegistryItem,
} from "./../../../client";
import { AxiosResponse } from "axios";
import { config } from "../../../config";
import ReactJson from "react-json-view";

const { Content } = Layout;

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

    const contentList = {
      info: <Empty description={false} />,
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
