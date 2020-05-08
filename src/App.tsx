import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Layout } from "antd";

import "./styles/index.css";

import NavBar from "./components/navbar/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import SearchHeader from "./components/header/Search";

const { Footer } = Layout;

function App() {
  return (
    <Router>
      <div>
        <Layout style={{ minHeight: "100vh" }}>
          <NavBar />
          <Layout className="site-layout">
            <SearchHeader />
            <div className="header-margin" />
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route path="/dashboard">
                <Dashboard />
              </Route>
            </Switch>
            <Footer style={{ textAlign: "center" }}>
              Xene UI ©2020 Created by fristonio
            </Footer>
          </Layout>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
