import React from "react";
import "antd/dist/antd.css";
import "./../../../styles/index.css";
import "./../../../styles/dashboard.css";
import { Table, Layout, PageHeader, Input, Space, Button, Tooltip } from "antd";
import {
  DownloadOutlined,
  ExpandAltOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { CloseCircleTwoTone, CheckCircleTwoTone } from "@ant-design/icons";
import { RegistryApiFactory } from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/lib/table/interface";

const { Content } = Layout;

interface State {
  initLoading: boolean;
  loadingSuccess: boolean;
  data: Array<AgentInfo>;
  searchText: string;
  searchedColumn: string;
}

interface AgentInfo {
  key: string;
  name: string;
  address: string;
  available: boolean;
  secure: boolean;
  actions: boolean;
}

const routes = [
  {
    path: "/dashboard",
    breadcrumbName: "Dashboard",
  },
  {
    path: "/dashboard/agents",
    breadcrumbName: "Agents List",
  },
];

class AgentListComponent extends React.Component<{}, State> {
  state = {
    initLoading: true,
    loadingSuccess: false,
    data: [],
    searchText: "",
    searchedColumn: "",
  };

  searchInput: Input | null = null;

  componentDidMount() {
    this.getAgentsList((res: Array<AgentInfo>, success: boolean) => {
      this.setState({
        initLoading: false,
        loadingSuccess: success,
        data: res,
      });
    });
  }

  getAgentsList = (
    callback: (res: Array<AgentInfo>, success: boolean) => void
  ) => {
    RegistryApiFactory(config.getAPIConfig())
      .apiV1RegistryListRegitemGet(config.defaults.agentRegistryItem)
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          let resp = new Array<AgentInfo>();
          for (let i = 0; i < response.data.length; i++) {
            let info = response.data[i];
            resp.push({
              key: (i + 1).toString(),
              name: info.name,
              address: info.address,
              available: info.available,
              secure: info.secure,
              actions: info.available,
            });
          }
          callback(resp, true);
        } else {
          callback(new Array<AgentInfo>(), false);
        }
      })
      .catch(function (error: any) {
        console.error(error);
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

    onFilter: (value: string | number | boolean, record: AgentInfo) => {
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

  render() {
    const { initLoading, data } = this.state;
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
          compare: (a: AgentInfo, b: AgentInfo) => a.name.localeCompare(b.name),
          multiple: 1,
        },
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        sorter: {
          compare: (a: AgentInfo, b: AgentInfo) =>
            a.address.localeCompare(b.address),
          multiple: 2,
        },
      },
      {
        title: "Available",
        dataIndex: "available",
        key: "available",
        render: (available: boolean) => {
          if (available) {
            return (
              <Tooltip title="Agent Available" className="status-tooltip-icon">
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </Tooltip>
            );
          }

          return (
            <Tooltip
              title="Agent not Available"
              className="status-tooltip-icon"
            >
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            </Tooltip>
          );
        },
      },
      {
        title: "Secure",
        dataIndex: "secure",
        key: "secure",
        render: (secure: boolean) => {
          if (secure) {
            return (
              <Tooltip title="Agent Secure" className="status-tooltip-icon">
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Agent Insecure" className="status-tooltip-icon">
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            </Tooltip>
          );
        },
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        render: () => {
          return (
            <Space>
              <Tooltip title="Download manifest">
                <Button type="primary" icon={<DownloadOutlined />} />
              </Tooltip>
              <Tooltip title="Explore agent">
                <Button type="primary" icon={<ExpandAltOutlined />} />
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
          title="Agents"
          breadcrumb={{ routes }}
          subTitle="List of all the agents configured for xene."
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

export default AgentListComponent;
