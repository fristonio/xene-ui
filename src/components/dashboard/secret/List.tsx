import React from "react";
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
import { CloseCircleTwoTone, CheckCircleTwoTone } from "@ant-design/icons";
import { RegistryApiFactory, ResponseRegistryItem } from "./../../../client";
import { config } from "../../../config";
import { AxiosResponse } from "axios";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/lib/table/interface";

const { Content } = Layout;

interface State {
  initLoading: boolean;
  loadingSuccess: boolean;
  data: Array<SecretInfo>;
  searchText: string;
  searchedColumn: string;
}

interface SecretInfo {
  key: string;
  name: string;
  type: string;
  restricted: boolean;
  actions: boolean;
}

const routes = [
  {
    path: "/dashboard",
    breadcrumbName: "Dashboard",
  },
  {
    path: "/dashboard/secrets",
    breadcrumbName: "Secrets List",
  },
];

class SecretsListComponent extends React.Component<{}, State> {
  state = {
    initLoading: true,
    loadingSuccess: false,
    data: [],
    searchText: "",
    searchedColumn: "",
  };

  searchInput: Input | null = null;

  componentDidMount() {
    this.getSecretsList((res: Array<SecretInfo>, success: boolean) => {
      this.setState({
        initLoading: false,
        loadingSuccess: success,
        data: res,
      });
    });
  }

  getSecretsList = (
    callback: (res: Array<SecretInfo>, success: boolean) => void
  ) => {
    RegistryApiFactory(config.getAPIConfig())
      .apiV1RegistryListSecretsGet(config.defaults.agentRegistryItem)
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          let resp = new Array<SecretInfo>();
          for (let i = 0; i < response.data.length; i++) {
            let info = response.data[i];
            resp.push({
              key: (i + 1).toString(),
              name: info.name,
              type: info.type,
              restricted: info.restricted,
              actions: true,
            });
          }
          callback(resp, true);
        } else {
          notification["warning"]({
            message: "Fetch Error",
            description:
              "Non 200 status when fetching secrets list: " + response.status,
          });
          callback(new Array<SecretInfo>(), false);
        }
      })
      .catch(function (error: any) {
        notification["error"]({
          message: "Fetch Error",
          description: "Error while fetching secrets list: " + error,
        });
        callback(new Array<SecretInfo>(), false);
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

    onFilter: (value: string | number | boolean, record: SecretInfo) => {
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

  downloadSecretManifest = (name: string) => {
    RegistryApiFactory(config.getAPIConfig())
      .apiV1RegistrySecretNameGet(name)
      .then((resp: AxiosResponse<ResponseRegistryItem>) => {
        let content: string =
          resp.data.item !== undefined ? resp.data.item : "";

        content = JSON.stringify(
          JSON.parse(JSON.parse(content)["value"]),
          null,
          2
        );
        var blob = new Blob([content], {
          type: "text/plain;charset=utf-8",
        });

        saveAs(blob, name + ".json");
        message.success("Secret manifest for " + name + " download started");
      })
      .catch(function (error: any) {
        message.error("Error while fetching secret manifest: " + error);
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
          compare: (a: SecretInfo, b: SecretInfo) =>
            a.name.localeCompare(b.name),
          multiple: 1,
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        sorter: {
          compare: (a: SecretInfo, b: SecretInfo) =>
            a.type.localeCompare(b.type),
          multiple: 2,
        },
        render: (type: string) => {
          return (
            <Tag color="blue" key={type}>
              {type}
            </Tag>
          );
        },
      },
      {
        title: "Usable",
        dataIndex: "restricted",
        key: "restricted",
        render: (restricted: boolean) => {
          if (!restricted) {
            return (
              <Tooltip
                title="Secret Not Restricted"
                className="status-tooltip-icon"
              >
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Secret Restricted" className="status-tooltip-icon">
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            </Tooltip>
          );
        },
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        render: (action: boolean, rec: SecretInfo) => {
          return (
            <Space>
              <Tooltip title="Download manifest">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    this.downloadSecretManifest(rec.name);
                  }}
                />
              </Tooltip>
              <Tooltip title="Explore secret">
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
          title="Secrets"
          breadcrumb={{ routes }}
          subTitle="List of all the secrets configured for xene."
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

export default SecretsListComponent;
