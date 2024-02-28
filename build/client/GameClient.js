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
exports.GameClient = exports.ClientState = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("../common/ncontext");
const handlePredictionErrors_1 = require("./handlePredictionErrors");
const handleMessages_1 = require("./handleMessages");
const handleEntities_1 = require("./handleEntities");
const PIXIRenderer_1 = require("../rendering/PIXIRenderer");
const State_1 = require("./State");
const InputSystem_1 = require("./InputSystem");
const predictInput_1 = require("./predictInput");
const MapService_1 = require("../common/MapService");
const CollisionService_1 = require("../common/CollisionService");
const Constants_1 = require("../common/Constants");
var ClientState;
(function (ClientState) {
    ClientState[ClientState["Running"] = 0] = "Running";
    ClientState[ClientState["Paused"] = 1] = "Paused";
    ClientState[ClientState["Stopped"] = 2] = "Stopped";
})(ClientState || (exports.ClientState = ClientState = {}));
class GameClient {
    constructor({ adapterClass, address = "localhost" }) {
        this.clientState = ClientState.Stopped;
        // game state for this client
        this.state = new State_1.State();
        // a primitive pixi renderer
        this.renderer = new PIXIRenderer_1.PIXIRenderer(this.state);
        this.map = (0, MapService_1.getMap)();
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.client.connect(this.address, {
                    token: 12345,
                });
                console.log("connection response", res);
            }
            catch (err) {
                console.log("connection error", err);
            }
        });
        this.start = () => {
            this.clientState = ClientState.Running;
            let prev = performance.now();
            const loop = () => {
                if (window.document.hasFocus()) {
                    this.clientState = ClientState.Running;
                }
                else {
                    this.clientState = ClientState.Paused;
                }
                if (this.clientState === ClientState.Running ||
                    this.clientState === ClientState.Paused) {
                    window.requestAnimationFrame(loop);
                }
                const now = performance.now();
                const delta = (now - prev) / 1000;
                prev = now;
                (0, handlePredictionErrors_1.handlePredictionErrors)(this.client, this.state);
                (0, handleMessages_1.handleMessages)(this.renderer, this.client, this.state);
                (0, handleEntities_1.handleEntities)(this.interpolator, this.state, this.renderer);
                // if (this.clientState === ClientState.Running) {
                const inputCommand = this.inputSystem.createNetworkCommand(delta);
                this.client.addCommand(inputCommand);
                (0, predictInput_1.predictInput)(delta, this.renderer, this.state, inputCommand, this.client);
                this.client.flush();
                // }
                // after we did everything, render all the entities
                this.state.entities.forEach((entity) => {
                    this.renderer.updateGraphicalEntity(entity);
                });
                this.inputSystem.resetKeys();
                this.renderer.cameraFollow();
                this.renderer.render();
            };
            loop();
        };
        this.stop = () => {
            this.clientState = ClientState.Stopped;
        };
        this.onDisconnect = (reason, event) => {
            this.clientState = ClientState.Stopped;
            console.log("disconnected", reason, event);
        };
        this.address = address;
        // load the map in the collision service and the renderer
        CollisionService_1.collisionService.registerMap(this.map);
        this.renderer.renderMap(this.map);
        this.client = new nengi_1.Client(ncontext_1.ncontext, adapterClass, 1000 / Constants_1.TICK_RATE);
        this.interpolator = new nengi_1.Interpolator(this.client);
        this.inputSystem = new InputSystem_1.InputSystem(this.renderer);
        this.client.setDisconnectHandler(this.onDisconnect);
    }
}
exports.GameClient = GameClient;
