import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { login, logout } from "../../redux/actions/userActions";
import {
  AuthApiFactory,
  ResponseJWTAuth,
  ResponseOauthLogin,
} from "../../client";

import { Layout } from "antd";
import { config } from "../../config";
import { AxiosResponse } from "axios";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ReduxState } from "../../redux/types";

import { Spin, notification } from "antd";

const mapStateToProps = (state: ReduxState) => ({
  authToken: state.auth.authToken,
});

const cLogin = connect(mapStateToProps);
type LoginProps = ConnectedProps<typeof cLogin> & RouteComponentProps;

let Login = (props: LoginProps) => {
  AuthApiFactory(config.getAPIConfig(props.authToken))
    .oauthProviderGet(config.defaults.oauthProvider)
    .then((response: AxiosResponse<ResponseOauthLogin>) => {
      if (response.status === 200 && response.data.loginURL !== undefined) {
        window.location.replace(response.data.loginURL);
      } else {
        notification["warning"]({
          message: "Fetch Error",
          description:
            "Non 200 status when fetching login URL: " + response.status,
        });
      }
    })
    .catch(function (error: any) {
      notification["error"]({
        message: "Fetch Error",
        description: "Error while fetching login URL: " + error,
      });
    });

  return (
    <Layout className="spin-layout">
      <Spin />
    </Layout>
  );
};

export const LoginComponent = cLogin(withRouter(Login));

const mapDispatchToProps = {
  login,
};
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector> & RouteComponentProps;

let LoginCallbackComponent = (props: PropsFromRedux) => {
  let params = new URLSearchParams(props.location.search);

  AuthApiFactory(config.getAPIConfig())
    .oauthProviderRedirectGet(config.defaults.oauthProvider, { params: params })
    .then((response: AxiosResponse<ResponseJWTAuth>) => {
      if (response.status === 200) {
        if (
          response.data.userEmail === undefined ||
          response.data.token === undefined
        ) {
          notification["error"]({
            message: "Login Failed",
            description: "Error while fetching auth token: ",
          });
          return;
        }

        props.login(response.data.userEmail, response.data.token);
        props.history.push("/");
      } else {
        notification["warning"]({
          message: "Fetch Error",
          description:
            "Non 200 status when fetching auth token: " + response.status,
        });
      }
    })
    .catch(function (error: any) {
      notification["error"]({
        message: "Login Error",
        description: "Error while fetching auth token: " + error,
      });
    });
  return <Spin />;
};

export const LoginCallback = connector(withRouter(LoginCallbackComponent));

const Logout = () => {
  return <Spin />;
};

export const LogoutComponent = connect(null, { logout })(Logout);
