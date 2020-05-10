import {} from "./../client";
import { Configuration } from "./../client";
import * as defaults from "./defaults";

export let config = {
  xene: {
    apiServer: "http://localhost:6060",
    authToken: "sampleAuthToken",
  },
  getAPIConfig(): Configuration {
    return new Configuration({
      apiKey: "Bearer " + config.xene.authToken,
      basePath: config.xene.apiServer,
    });
  },
  defaults: defaults,
};
