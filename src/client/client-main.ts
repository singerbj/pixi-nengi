import { Client, Interpolator } from "nengi";
import { ncontext } from "../common/ncontext";
import { WebSocketClientAdapter } from "nengi-websocket-client-adapter";
import { handlePredictionErrors } from "./handlePredictionErrors";
import { handleMessages } from "./handleMessages";
import { handleEntities } from "./handleEntities";
import { PIXIRenderer } from "../rendering/PIXIRenderer";
import { State } from "./State";
import { InputSystem } from "./InputSystem";
import { predictInput } from "./predictInput";

/**
 * A basic nengi client example.
 *   Creates a client, connects to the server
 *   Creates and runs a game loop at the requestAnimationFrame refresh rate
 */
window.addEventListener("load", async () => {
  // game state for this client
  const state = new State();
  // a primitive pixi renderer
  const renderer = new PIXIRenderer(state);

  const client = new Client(ncontext, WebSocketClientAdapter, 20);
  const interpolator = new Interpolator(client);
  const inputSystem = new InputSystem(renderer);

  client.setDisconnectHandler((reason, event) => {
    console.log("disconnected", reason, event);
  });

  try {
    const res = await client.connect("ws://localhost:9001", { token: 12345 });
    console.log("connection response", res);

    // spin up the game loop
    let prev = performance.now();

    const loop = () => {
      window.requestAnimationFrame(loop);
      const now = performance.now();
      const delta = (now - prev) / 1000;
      prev = now;

      handlePredictionErrors(client, state);
      handleMessages(client, state);
      handleEntities(interpolator, state, renderer);

      const inputCommand = inputSystem.createNetworkCommand(delta);
      client.addCommand(inputCommand);
      predictInput(delta, renderer, state, inputCommand, client);
      client.flush();

      // after we did everything, render all the entities
      state.entities.forEach((entity) => {
        renderer.updateGraphicalEntity(entity);
      });

      inputSystem.resetKeys();
      renderer.cameraFollow();
      renderer.render();
    };

    loop();
  } catch (err) {
    console.log("connection error", err);
  }
});
