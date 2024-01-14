// import SpatialStructure from "./BasicSpace";
// import { proxify, Proxy } from "./proxify";
import { Entity } from "../../common/Entity";
import { NetworkEvent } from "nengi";

type SpatialStructure = {
  entities: Entity[];
  events: NetworkEvent[];
};

class Historian {
  history: { [tick: number]: SpatialStructure };
  ticksToSave: number;
  tick: number;
  tickRate: number;
  ID_PROPERTY_NAME: string = "nid";

  constructor(tickRate: number, ticksToSave: number, ID_PROPERTY_NAME: string) {
    this.history = {};
    this.ticksToSave = ticksToSave;
    this.tick = -1;
    this.tickRate = tickRate;
    this.ID_PROPERTY_NAME = ID_PROPERTY_NAME || "id";
  }

  getSnapshot(tick: number) {
    if (this.history[tick]) {
      return this.history[tick];
    } else {
      return null;
    }
  }

  record(tick: number, entities: Entity[], events: NetworkEvent[]) {
    var spatialStructure: SpatialStructure = { entities: [], events: [] };
    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      spatialStructure.entities.push(entity);
    }

    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      spatialStructure.events.push(event);
    }

    this.history[tick] = spatialStructure;

    if (tick > this.tick) {
      this.tick = tick;
    }

    if (this.history[tick - this.ticksToSave]) {
      // this.history[tick - this.ticksToSave].release();
      delete this.history[tick - this.ticksToSave];
    }
  }

  getLagCompensatedArea(timeAgo: number) {
    var tickLengthMs = 1000 / this.tickRate;
    var ticksAgo = timeAgo / tickLengthMs;

    var olderTick = this.tick - Math.floor(ticksAgo);
    var newerTick = this.tick - Math.floor(ticksAgo) + 1;
    // var portion = (timeAgo % tickLengthMs) / tickLengthMs;

    var timesliceA = this.getSnapshot(olderTick);
    var timesliceB = this.getSnapshot(newerTick);

    var compensatedEntities: Entity[] = [];

    if (timesliceA && timesliceB) {
      compensatedEntities = timesliceA.entities;
    }

    return compensatedEntities;
  }

  // getCurrentState() {
  //   return this.getSnapshot(this.tick);
  // }

  // getRecentEvents() {
  //   var spatialStructure = this.getSnapshot(this.tick);
  // }

  // getRecentSnapshot() {
  //   return this.getSnapshot(this.tick);
  // }
}

export default Historian;
