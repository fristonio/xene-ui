import * as React from "react";
import "antd/dist/antd.css";
import { Layout, Menu } from "antd";
import {
  LockOutlined,
  ForkOutlined,
  CloudServerOutlined,
  SettingOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { withRouter, RouteComponentProps } from "react-router-dom";
import "./../../styles/navbar.css";

const { Sider } = Layout;

interface State {
  collapsed: boolean;
}

class NavBar extends React.Component<RouteComponentProps, State> {
  state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

  render() {
    return (
      <Sider
        collapsible
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
        className="navbar"
      >
        <div className="logo" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          onClick={(param) => {
            let location: string;

            switch (param.key) {
              case "1": {
                location = "/dashboard/agents";
                break;
              }
              case "2": {
                location = "/dashboard/workflows";
                break;
              }
              case "3": {
                location = "/dashboard/secrets";
                break;
              }
              case "4":
              case "5":
              default:
                location = "/dashboard/status";
            }

            this.props.history.push(location);
          }}
        >
          <Menu.Item key="1" icon={<CloudServerOutlined />}>
            Agents
          </Menu.Item>
          <Menu.Item key="2" icon={<ForkOutlined />}>
            Workflows
          </Menu.Item>
          <Menu.Item key="3" icon={<LockOutlined />}>
            Secrets
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            Status
          </Menu.Item>
          <Menu.Item key="5" icon={<BookOutlined />}>
            Documentation
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}

export default withRouter(NavBar);
