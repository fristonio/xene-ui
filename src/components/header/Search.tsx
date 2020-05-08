import React from "react";
import { Input, Layout } from "antd";

import "./../../styles/utils.css";
import "./../../styles/header.css";

const { Search } = Input;
const { Header } = Layout;

const SearchHeader: React.FunctionComponent = () => {
  return (
    <Header className="search-header align-center">
      <div className="search-bar align-center">
        <Search
          placeholder="search in xene"
          enterButton="Search"
          size="middle"
          onSearch={(value) => console.log(value)}
        />
      </div>
    </Header>
  );
};

export default SearchHeader;
