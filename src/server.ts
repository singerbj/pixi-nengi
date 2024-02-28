import { uWebSocketsInstanceAdapter } from "nengi-uws-instance-adapter";
import { GameServer } from "./server/GameServer";
import { WEB_SOCKET_DEFAULT_PORT } from "./common/Constants";

const server = new GameServer({
  adapterClass: uWebSocketsInstanceAdapter,
  port: WEB_SOCKET_DEFAULT_PORT,
});
server.start();
