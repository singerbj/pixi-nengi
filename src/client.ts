import { GameClient } from "./client/GameClient";
import { PeerJSClientAdapter } from "./client/PeerJsClientAdapter";
import {
  TEMP_SERVER_ID_FOR_TESTING,
  WEB_SOCKET_DEFAULT_PORT,
} from "./common/Constants";
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

  // @ts-ignore
  let serverAddress = SERVER_ADDRESS;
  const notOnLocalhost = serverAddress !== "localhost";

  serverAddress =
    serverAddress === "localhost" ? window.location.hostname : serverAddress;

  // Set to secure websocket when not connecting to localhost
  let wsProtocol = "ws";
  if (notOnLocalhost) {
    wsProtocol = "wss";
  }

  // Create the game client
  const gameClient = new GameClient({
    adapterClass: WebSocketClientAdapter,
    address:
      `${wsProtocol}://${serverAddress}` +
      (notOnLocalhost ? "" : `:${WEB_SOCKET_DEFAULT_PORT}`),
  });

  // Run the game client
  gameClient.connect().then(() => {
    gameClient.start();
  });
});
