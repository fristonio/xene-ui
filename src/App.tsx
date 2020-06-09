import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Layout } from "antd";

import "./styles/index.css";

import {
  LoginComponent,
  LoginCallback,
  LogoutComponent,
} from "./components/common/User";
import NavBar from "./components/navbar/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import SearchHeader from "./components/header/Search";
import { Provider } from "react-redux";

import configureStore from "./redux/store";

const store = configureStore();

const { Footer } = Layout;

interface State {
  collapsed: boolean;
}

class App extends React.Component<{}, State> {
  state = {
    collapsed: false,
  };

  onNavBarCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

  render() {
    if (
      !store.getState().auth.isAuthenticated &&
      window.location.pathname !== "/oauth/login" &&
      !window.location.pathname.startsWith("/oauth/callback")
    ) {
      window.location.href = "/oauth/login";
      return <div />;
    }
    let layoutClass = this.state.collapsed
      ? "site-layout-collapsed"
      : "site-layout";
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Layout style={{ minHeight: "100vh" }}>
              <NavBar onNavBarCollapse={this.onNavBarCollapse} />
              <Layout className={layoutClass}>
                <SearchHeader />
                <div className="header-margin" />
                <Switch>
                  <Route exact path="/oauth/login">
                    <LoginComponent />
                  </Route>
                  <Route exact path="/oauth/logout">
                    <LogoutComponent />
                  </Route>
                  <Route exact path="/oauth/callback">
                    <LoginCallback />
                  </Route>
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
      </Provider>
    );
  }
}

export default App;
