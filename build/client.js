"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameClient_1 = require("./client/GameClient");
const Constants_1 = require("./common/Constants");
const nengi_websocket_client_adapter_1 = require("nengi-websocket-client-adapter");
window.addEventListener("load", () => __awaiter(void 0, void 0, void 0, function* () {
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
    const gameClient = new GameClient_1.GameClient({
        adapterClass: nengi_websocket_client_adapter_1.WebSocketClientAdapter,
        address: `ws://localhost:${Constants_1.WEB_SOCKET_DEFAULT_PORT}`,
    });
    gameClient.connect().then(() => {
        gameClient.start();
    });
}));
