import type { Schema } from "amplify/data/resource";
import { parseAmplifyConfig } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api/server";
import config from "../../amplify_outputs.json";

const amplifyConfig = parseAmplifyConfig(config);
export const client = generateClient<Schema>({
  config: amplifyConfig,
});
