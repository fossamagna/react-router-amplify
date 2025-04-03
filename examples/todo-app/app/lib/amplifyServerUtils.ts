import { createServerRunner } from "amplify-adapter-react-router";
import outputs from "../../amplify_outputs.json";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});
