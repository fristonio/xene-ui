import {} from "./../client";
import { Configuration } from "./../client";
import * as defaults from "./defaults";

export let config = {
  xene: {
    apiServer: "http://localhost:6060",
  },

  getAPIConfig(authToken?: string): Configuration {
    if (authToken === undefined) {
      return new Configuration({
        basePath: config.xene.apiServer,
      });
    }

    return new Configuration({
      apiKey: "Bearer " + authToken,
      basePath: config.xene.apiServer,
    });
  },

  defaults: defaults,
};
