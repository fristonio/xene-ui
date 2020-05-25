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
  Space,
  Button,
  Tooltip,
  Table,
  Input,
} from "antd";
import {
  SearchOutlined,
  CloseCircleTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { FilterDropdownProps } from "antd/lib/table/interface";

import {
  InfoApiFactory,
  ResponsePipelineInfo,
  ResponsePipelineRunInfo,
} from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import ReactJson from "react-json-view";
import PipelineGraph from "./../../common/PipelineGraph";
import Highlighter from "react-highlight-words";

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
  searchedColumn: string;
  searchText: string;
}

interface RunInfo extends ResponsePipelineRunInfo {
  key: string;
}

class PipelineInfoPage extends React.Component<Props, State> {
  state = {
    key: "info",
    initLoading: true,
    loadingSuccess: false,
    info: {} as ResponsePipelineInfo,
    searchedColumn: "",
    searchText: "",
  };

  searchInput: Input | null = null;

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
      .apiV1InfoWorkflowWorkflowPipelinePipelineGet(workflow, pipeline)
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

  getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: (props: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={props.selectedKeys[0]}
          onChange={(e) =>
            props.setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(props.selectedKeys, props.confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              this.handleSearch(props.selectedKeys, props.confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              this.handleReset(
                props.clearFilters ? props.clearFilters : () => {}
              )
            }
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),

    onFilter: (
      value: string | number | boolean,
      record: ResponsePipelineRunInfo
    ) => {
      let k: boolean | undefined;
      switch (dataIndex) {
        case "runID":
          k = record.runID
            ?.toLowerCase()
            .includes(value.toString().toLowerCase());
          return k === undefined ? false : k;
        case "agent":
          k = record.agent
            ?.toLowerCase()
            .includes(value.toString().toLowerCase());
          return k === undefined ? false : k;
        default:
          console.error("invalid filter data index: ", dataIndex);
      }

      return false;
    },

    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => {
          if (this.searchInput) this.searchInput.select();
        });
      }
    },

    render: (text: string) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  handleSearch = (
    selectedKeys: React.Key[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0].toString(),
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters: () => void) => {
    clearFilters();
    this.setState({ searchText: "" });
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

    const columns = [
      {
        title: "Run ID",
        dataIndex: "runID",
        key: "runID",
        ...this.getColumnSearchProps("runID"),
        sorter: {
          compare: (a: RunInfo, b: RunInfo) => {
            let k = a.runID?.localeCompare(
              b.runID !== undefined ? b.runID : ""
            );
            return k === undefined ? 1 : k;
          },
          multiple: 1,
        },
        render: (runID: string) => {
          return <Link to={pipeline + "/runs/" + runID}>{runID}</Link>;
        },
      },
      {
        title: "Agent",
        dataIndex: "agent",
        key: "agent",
        ...this.getColumnSearchProps("agent"),
        sorter: {
          compare: (a: RunInfo, b: RunInfo) => {
            let k = a.agent?.localeCompare(
              b.agent !== undefined ? b.agent : ""
            );
            return k === undefined ? 1 : k;
          },
          multiple: 1,
        },
      },
      {
        title: "Start Time",
        dataIndex: "startTime",
        key: "startTime",
        ...this.getColumnSearchProps("startTime"),
        render: (startTime: number) => {
          let t = new Date(startTime * 1000).toLocaleTimeString("en-US");
          return <span>{t}</span>;
        },
        sorter: {
          compare: (a: RunInfo, b: RunInfo) => {
            let k = a.startTime
              ?.toString()
              ?.localeCompare(
                b.startTime?.toString() !== undefined
                  ? b.startTime?.toString()
                  : ""
              );
            return k === undefined ? 1 : k;
          },
          multiple: 1,
        },
      },
      {
        title: "End Time",
        dataIndex: "endTime",
        key: "endTime",
        ...this.getColumnSearchProps("endTime"),
        render: (endTime: number) => {
          let t = new Date(endTime * 1000).toLocaleTimeString("en-US");
          return <span>{t}</span>;
        },
        sorter: {
          compare: (a: RunInfo, b: RunInfo) => {
            let k = a.endTime
              ?.toString()
              ?.localeCompare(
                b.endTime?.toString() !== undefined ? b.endTime?.toString() : ""
              );
            return k === undefined ? 1 : k;
          },
          multiple: 1,
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        sorter: {
          compare: (a: RunInfo, b: RunInfo) => {
            let k = a.status?.localeCompare(
              b.status !== undefined ? b.status : ""
            );
            return k === undefined ? 2 : k;
          },
          multiple: 2,
        },
      },
      {
        title: "",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
          if (status === "Running" || status === "Success") {
            return (
              <Tooltip title="Pipeline Running">
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Pipeline Run Error">
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            </Tooltip>
          );
        },
      },
    ];

    let runInfo = this.state.info.runs?.map(
      (run: ResponsePipelineRunInfo, index: number) => {
        return {
          key: (index + 1).toString(),
          runID: run.runID,
          agent: run.agent,
          status: run.status,
          startTime: run.startTime,
          endTime: run.endTime,
        };
      }
    );
    const contentList = {
      info: (
        <Table
          columns={columns}
          dataSource={runInfo === undefined ? new Array<RunInfo>() : runInfo}
          loading={this.state.initLoading}
          pagination={{ position: ["bottomCenter"] }}
          showSorterTooltip={true}
        />
      ),
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
