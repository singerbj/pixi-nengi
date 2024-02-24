import { GameClient } from "./client/GameClient";
import { PeerJSClientAdapter } from "./client/PeerJsClientAdapter";
import { TEMP_SERVER_ID_FOR_TESTING } from "./common/Constants";
import { GameServer } from "./server/GameServer";
import { PeerJsServerAdapter } from "./server/PeerJsServerAdapter";
import { WebSocketClientAdapter } from "nengi-websocket-client-adapter";

window.addEventListener("load", async () => {
  // let params = window.location.search;
  // if (params.indexOf("server") > -1) {
  //   const server = new GameServer({
  //     adapterClass: PeerJsServerAdapter,
  //   });
  //   server.start();
  // }

  // const gameClient = new GameClient({
  //   adapterClass: PeerJSClientAdapter,
  //   address: TEMP_SERVER_ID_FOR_TESTING,
  // });

  const gameClient = new GameClient({
    adapterClass: WebSocketClientAdapter,
    address: `ws://localhost:9001`,
  });
  gameClient.connect().then(() => {
    gameClient.start();
  });
});
