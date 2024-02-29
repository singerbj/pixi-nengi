import { Entity } from "../common/Entity";
import { StatsEntity } from "../common/StatsEntity";

export class State {
  myId = -1;
  isPredictionEnabled = true;
  entities: Map<number, Entity>;
  stats: StatsEntity | undefined;

  constructor() {
    this.entities = new Map();
  }
}
