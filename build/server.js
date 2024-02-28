"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nengi_uws_instance_adapter_1 = require("nengi-uws-instance-adapter");
const GameServer_1 = require("./server/GameServer");
const Constants_1 = require("./common/Constants");
const server = new GameServer_1.GameServer({
    adapterClass: nengi_uws_instance_adapter_1.uWebSocketsInstanceAdapter,
    port: Constants_1.WEB_SOCKET_DEFAULT_PORT,
});
server.start();
