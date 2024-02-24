import { uWebSocketsInstanceAdapter } from "nengi-uws-instance-adapter";
import { GameServer } from "./server/GameServer";

const server = new GameServer({
  adapterClass: uWebSocketsInstanceAdapter,
  port: 9001,
});
server.start();
