import { GameServer } from "./server/GameServer";

const server = new GameServer({ port: 9001 });
server.start();
