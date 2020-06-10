import React, { RefObject } from "react";
import { Link } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import * as types from "./../../../redux/types";
import "antd/dist/antd.css";
import "./../../../styles/index.css";
import "./../../../styles/dashboard.css";
import {
  Table,
  Layout,
  PageHeader,
  Input,
  Space,
  Button,
  Tooltip,
  Tag,
  Result,
  Spin,
  message,
  notification,
  Modal,
} from "antd";
import {
  DownloadOutlined,
  ExpandAltOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  RegistryApiFactory,
  ResponseRegistryItem,
  ResponseHTTPMessage,
} from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/lib/table/interface";

import { breadcrumbItemRender } from "./../../../utils/utils";

import brace from "brace";
import AceEditor from "react-ace";

// Import a Mode (language)
import "brace/mode/javascript";

// Import a Theme (okadia, github, xcode etc)
import "brace/theme/github";

const { Content } = Layout;

interface State {
  initLoading: boolean;
  loadingSuccess: boolean;
  data: Array<WorkflowInfo>;
  searchText: string;
  searchedColumn: string;
  editorActive: boolean;
  confirmLoading: boolean;
}

interface WorkflowInfo {
  key: string;
  name: string;
  pipelines: Array<string>;
  triggers: Array<string>;
  agents: Array<string>;
  actions: boolean;
}

const routes = [
  {
    path: "/dashboard",
    breadcrumbName: "Dashboard",
  },
  {
    path: "/dashboard/workflows",
    breadcrumbName: "Workflows List",
  },
];

const mapStateToProps = (state: types.ReduxState) => ({
  authToken: state.auth.authToken,
});

const connector = connect(mapStateToProps);
type ComponentProps = ConnectedProps<typeof connector>;

class WorkflowsListComponent extends React.Component<ComponentProps, State> {
  state = {
    initLoading: true,
    loadingSuccess: false,
    data: [],
    searchText: "",
    searchedColumn: "",
    editorActive: false,
    confirmLoading: false,
  };

  onChange(newValue: any) {
    console.log("change", newValue);
  }

  searchInput: Input | null = null;
  editorRef: RefObject<AceEditor> = React.createRef();
  workflowText = "";

  componentDidMount() {
    this.getWorkflowsList((res: Array<WorkflowInfo>, success: boolean) => {
      this.setState({
        initLoading: false,
        loadingSuccess: success,
        data: res,
      });
    });
  }

  getWorkflowsList = (
    callback: (res: Array<WorkflowInfo>, success: boolean) => void
  ) => {
    RegistryApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1RegistryListWorkflowsGet()
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          let resp = new Array<WorkflowInfo>();
          for (let i = 0; i < response.data.length; i++) {
            let info = response.data[i];
            resp.push({
              key: (i + 1).toString(),
              name: info.name,
              pipelines: info.pipelines,
              triggers: info.triggers,
              agents: info.agents,
              actions: true,
            });
          }
          callback(resp, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching workflow list: " + response.status,
          });
          callback(new Array<WorkflowInfo>(), false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching workflow list: " + error,
        });
        callback(new Array<WorkflowInfo>(), false);
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

    onFilter: (value: string | number | boolean, record: WorkflowInfo) => {
      switch (dataIndex) {
        case "name":
          return record.name
            .toLowerCase()
            .includes(value.toString().toLowerCase());
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

  downloadWorkflowManifest = (name: string) => {
    RegistryApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1RegistryWorkflowNameGet(name)
      .then((resp: AxiosResponse<ResponseRegistryItem>) => {
        let content: string =
          resp.data.item?.value !== undefined ? resp.data.item.value : "";

        content = JSON.stringify(JSON.parse(content), null, 2);
        var blob = new Blob([content], {
          type: "text/plain;charset=utf-8",
        });

        saveAs(blob, name + ".json");
        message.success("Workflow manifest for " + name + " download started");
      })
      .catch(function (error: any) {
        message.error("Error while fetching workflow manifest: " + error);
      });
  };

  showModal = () => {
    this.setState({
      editorActive: true,
      confirmLoading: false,
    });
  };

  handleOk = () => {
    let text = this.editorRef.current?.editor.getValue();
    RegistryApiFactory(config.getAPIConfig(this.props.authToken))
      .apiV1RegistryWorkflowPost(text === undefined ? "" : text)
      .then((resp: AxiosResponse<ResponseHTTPMessage>) => {
        if (resp.status === 200) {
          this.setState({
            editorActive: false,
            confirmLoading: false,
          });
          notification["info"]({
            message: "Workflow create complete",
            description: resp.data.message,
          });
        } else {
          notification["warning"]({
            message: "Workflow create warning",
            description:
              "Non 200 status when creating workflow: " + resp.status,
          });
        }

        this.workflowText = text === undefined ? "" : text;
      })
      .catch((error: any) => {
        this.setState({
          confirmLoading: false,
        });
        notification["error"]({
          message: "Workflow create error",
          description: "Error creating workflow: " + error,
        });
        this.editorRef.current?.editor.setValue(text === undefined ? "" : text);
      });
  };

  handleCancel = () => {
    let text = this.editorRef.current?.editor.getValue();
    this.workflowText = text === undefined ? "" : text;

    this.setState({
      editorActive: false,
    });
  };

  render() {
    const { initLoading, data } = this.state;
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
    const columns = [
      {
        title: "S.No",
        dataIndex: "key",
        key: "key",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        ...this.getColumnSearchProps("name"),
        sorter: {
          compare: (a: WorkflowInfo, b: WorkflowInfo) =>
            a.name.localeCompare(b.name),
          multiple: 1,
        },
        render: (name: string) => (
          <Link to={"/dashboard/workflows/" + name}>{name}</Link>
        ),
      },
      {
        title: "Pipelines",
        dataIndex: "pipelines",
        key: "pipelines",
        render: (pipelines: Array<string>) => (
          <>
            {pipelines.map((pipeline: string) => (
              <Tag color="geekblue" key={pipeline}>
                {pipeline}
              </Tag>
            ))}
          </>
        ),
      },
      {
        title: "Triggers",
        dataIndex: "triggers",
        key: "triggers",
        render: (triggers: Array<string>) => (
          <>
            {triggers.map((trigger: string) => (
              <Tag color="geekblue" key={trigger}>
                {trigger}
              </Tag>
            ))}
          </>
        ),
      },
      {
        title: "Agents",
        dataIndex: "agents",
        key: "agents",
        render: (agents: Array<string>) => (
          <span>
            {agents === null
              ? "No Agents"
              : agents.map((agent) => {
                  let color = agent.length > 10 ? "geekblue" : "green";
                  if (agent.length > 15) {
                    color = "volcano";
                  }
                  return (
                    <Tag color={color} key={agent}>
                      {agent}
                    </Tag>
                  );
                })}
          </span>
        ),
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        render: (action: boolean, rec: WorkflowInfo) => {
          return (
            <Space>
              <Tooltip title="Download manifest">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    this.downloadWorkflowManifest(rec.name);
                  }}
                />
              </Tooltip>
              <Tooltip title="Explore workflow">
                <Button
                  type="primary"
                  icon={<ExpandAltOutlined />}
                  href={"/dashboard/workflows/" + rec.name}
                />
              </Tooltip>
            </Space>
          );
        },
      },
    ];

    return (
      <Content className="page-container">
        <PageHeader
          className="site-page-header"
          title="Workflows"
          breadcrumb={{ routes, itemRender: breadcrumbItemRender }}
          subTitle="List of all the workflows configured for xene."
        />
        <Layout className="relative-position">
          <Table
            columns={columns}
            dataSource={data}
            loading={initLoading}
            pagination={{ position: ["bottomCenter"] }}
          />
          <div
            className="edit-icon"
            onClick={() => {
              this.showModal();
            }}
          >
            <EditOutlined />
          </div>
          <Modal
            title="Create a Workflow"
            visible={this.state.editorActive}
            onOk={this.handleOk}
            confirmLoading={this.state.confirmLoading}
            onCancel={this.handleCancel}
            width={1200}
          >
            <AceEditor
              mode="javascript"
              theme="github"
              onChange={this.onChange}
              name="ace-editor-container"
              editorProps={{
                $blockScrolling: true,
              }}
              width="1150"
              fontSize={14}
              ref={this.editorRef}
              value={this.workflowText}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
            />
          </Modal>
        </Layout>
      </Content>
    );
  }
}

export default connector(WorkflowsListComponent);
