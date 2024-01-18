import { AUTHORITATIVE_SERVER_TYPE, createServer } from "./createServer";

import { uWebSocketsInstanceAdapter } from "nengi-uws-instance-adapter";

createServer({
  type: AUTHORITATIVE_SERVER_TYPE,
  adapter: uWebSocketsInstanceAdapter,
  port: 9001,
});
