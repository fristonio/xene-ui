import React from "react";
import { Route } from "antd/lib/breadcrumb/Breadcrumb";
import { Link } from "react-router-dom";

export function getColorFromStatus(status: string): string {
  switch (status) {
    case "Running":
      return "#5B8FF9";
    case "Success":
      return "#30BF78";
    case "NotExecuted":
      return "#F6BD16";
    case "Error":
      return "#E8684A";
  }

  return "#5D7092";
}

export function breadcrumbItemRender(
  route: Route,
  params: any,
  routes: Route[]
) {
  const last = routes.indexOf(route) === routes.length - 1;
  return last ? (
    <span>{route.breadcrumbName}</span>
  ) : (
    <Link to={route.path}>{route.breadcrumbName}</Link>
  );
}
