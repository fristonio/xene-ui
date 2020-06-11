import React from "react";
import { Input, Layout, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

import "./../../styles/utils.css";
import "./../../styles/header.css";

const { Search } = Input;
const { Header } = Layout;

const SearchHeader: React.FunctionComponent = () => {
  return (
    <Header className="search-header align-center">
      <div className="search-bar align-center">
        <Search
          placeholder="Search in Xene"
          enterButton="Search"
          size="middle"
          onSearch={(value) => console.log(value)}
        />
        <Avatar className="user-avatar" icon={<UserOutlined />} />
      </div>
    </Header>
  );
};

export default SearchHeader;
