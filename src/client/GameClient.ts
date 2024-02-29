import { Client, ClientNetwork, Context, Interpolator } from "nengi";
import { ncontext } from "../common/ncontext";
import { handlePredictionErrors } from "./handlePredictionErrors";
import { handleMessages } from "./handleMessages";
import { handleEntities } from "./handleEntities";
import { PIXIRenderer } from "../rendering/PIXIRenderer";
import { State } from "./State";
import { InputSystem } from "./InputSystem";
import { predictInput } from "./predictInput";
import { getMap } from "../common/MapService";
import { collisionService } from "../common/CollisionService";
import { TICK_RATE } from "../common/Constants";

export enum ClientState {
  Running,
  Paused,
  Stopped,
}

export type GameClientConfig = {
  adapterClass: IInstanceAdapter;
  address: string;
};

interface IInstanceAdapter {
  new (network: ClientNetwork, config: any): Object;
}

export class GameClient {
  clientState: ClientState = ClientState.Stopped;
  // game state for this client
  state = new State();
  // a primitive pixi renderer
  renderer = new PIXIRenderer(this.state);
  map = getMap();
  client: Client;
  interpolator: Interpolator;
  inputSystem: InputSystem;

  address: string;

  constructor({ adapterClass, address = "localhost" }: GameClientConfig) {
    this.address = address;
    // load the map in the collision service and the renderer
    collisionService.registerMap(this.map);
    this.renderer.renderMap(this.map);

    this.client = new Client(ncontext, adapterClass, 1000 / TICK_RATE);
    this.interpolator = new Interpolator(this.client);
    this.inputSystem = new InputSystem(this.renderer);

    this.client.setDisconnectHandler(this.onDisconnect);
  }

  public connect = async () => {
    try {
      const res = await this.client.connect(this.address, {
        token: 12345,
      });
      console.log("connection response", res);
    } catch (err) {
      console.log("connection error", err);
    }
  };

  public start = () => {
    this.clientState = ClientState.Running;

    let prev = performance.now();
    const loop = () => {
      if (window.document.hasFocus()) {
        this.clientState = ClientState.Running;
      } else {
        this.clientState = ClientState.Paused;
      }
      if (
        this.clientState === ClientState.Running ||
        this.clientState === ClientState.Paused
      ) {
        window.requestAnimationFrame(loop);
      }

      const now = performance.now();
      const delta = (now - prev) / 1000;
      prev = now;

      handlePredictionErrors(this.client, this.state);
      handleMessages(this.renderer, this.client, this.state);
      handleEntities(this.interpolator, this.state, this.renderer);

      // if (this.clientState === ClientState.Running) {
      const inputCommand = this.inputSystem.createNetworkCommand(delta);
      this.client.addCommand(inputCommand);
      predictInput(delta, this.renderer, this.state, inputCommand, this.client);
      this.client.flush();
      // }

      // after we did everything, render all the entities
      this.state.entities.forEach((entity) => {
        this.renderer.updateGraphicalEntity(entity);
      });

      if (this.state.stats) {
        this.state.stats.userLatency = this.client.network.latency;
        this.renderer.renderStats(this.state.stats);
      }

      this.inputSystem.resetKeys();
      this.renderer.cameraFollow();
      this.renderer.render();
    };

    loop();
  };

  public stop = () => {
    this.clientState = ClientState.Stopped;
  };

  private onDisconnect = (reason: string | object, event?: any) => {
    this.clientState = ClientState.Stopped;
    console.log("disconnected", reason, event);
  };
}
