import { GameClient } from "./client/GameClient";

window.addEventListener("load", async () => {
  const gameClient = new GameClient({ address: "localhost", port: 9001 });
  gameClient.connect().then(() => {
    gameClient.start();
  });
});
