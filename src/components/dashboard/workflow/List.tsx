import React from "react";
import { Link } from "react-router-dom";
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
} from "antd";
import {
  DownloadOutlined,
  ExpandAltOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { RegistryApiFactory, ResponseRegistryItem } from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/lib/table/interface";

const { Content } = Layout;

interface State {
  initLoading: boolean;
  loadingSuccess: boolean;
  data: Array<WorkflowInfo>;
  searchText: string;
  searchedColumn: string;
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

class WorkflowsListComponent extends React.Component<{}, State> {
  state = {
    initLoading: true,
    loadingSuccess: false,
    data: [],
    searchText: "",
    searchedColumn: "",
  };

  searchInput: Input | null = null;

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
    RegistryApiFactory(config.getAPIConfig())
      .apiV1RegistryListWorkflowsGet()
      .then((response: AxiosResponse) => {
        console.log(response);
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
    RegistryApiFactory(config.getAPIConfig())
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
            {agents.map((agent) => {
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
          breadcrumb={{ routes }}
          subTitle="List of all the workflows configured for xene."
        />
        <Layout>
          <Table
            columns={columns}
            dataSource={data}
            loading={initLoading}
            pagination={{ position: ["bottomCenter"] }}
          />
        </Layout>
      </Content>
    );
  }
}

export default WorkflowsListComponent;
