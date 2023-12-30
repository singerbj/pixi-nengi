import { Interpolator } from "nengi";
import { State } from "./State";
import { PIXIRenderer } from "../rendering/PIXIRenderer";
import { NType } from "../common/ncontext";
import { Entity } from "../common/Entity";
import { StatsEntity } from "../common/StatsEntity";
import { collisionService } from "../common/CollisionService";

let lastTime: number;

/**
 * Creates and synchronizes entities being from the nengi instance with the pixi renderer
 * @param interpolator
 * @param state
 * @param renderer
 */
export function handleEntities(
  interpolator: Interpolator,
  state: State,
  renderer: PIXIRenderer
) {
  const istate = interpolator.getInterpolatedState(100);

  // changes in entities (create, update, delete)
  istate.forEach((snapshot) => {
    snapshot.createEntities.forEach((entity: any) => {
      //console.log('create', entity)
      if (entity.ntype === NType.Channel) {
        console.log("channel entity!", entity);
      }
      if (entity.ntype === NType.Entity) {
        console.log("newEntity", entity);
        const newEntity = new Entity(entity);
        renderer.addEntity(newEntity);
        collisionService.insert(newEntity.collider);
        state.entities.set(newEntity.nid, newEntity);
      }
      if (entity.ntype === NType.StatsEntity) {
        renderer.renderStats(entity);
        state.stats.set(entity.nid, entity);
      }
    });

    snapshot.updateEntities.forEach((diff: any) => {
      const { nid, prop, value } = diff;
      let entity: Entity | StatsEntity | undefined = state.entities.get(nid);
      if (entity === undefined) {
        entity = state.stats.get(nid);
      }

      if (entity) {
        if (state.isPredictionEnabled && state.myId === nid) {
          return; // skip applying this state to the entity, we are predicting it instead
        }
        if (entity.ntype === NType.Entity) {
          // @ts-ignore
          entity[prop] = value;
          const collider = (<Entity>entity).collider;
          if (prop === "x") {
            collider.setPosition(value, collider.y);
            collider.updateBody(); //TODO: dont do this so often for better perf
          } else if (prop === "y") {
            collider.setPosition(collider.x, value);
            collider.updateBody(); //TODO: dont do this so often for better perf
          }
        } else if (entity.ntype === NType.StatsEntity) {
          // @ts-ignore
          entity[prop] = value;
          renderer.renderStats(<StatsEntity>entity);
        }
      } else {
        console.log(
          `Unexpected entity data: | nid: ${nid} prop: ${prop} value: ${value}`
        );
      }
    });

    snapshot.deleteEntities.forEach((nid: number) => {
      if (state.entities.has(nid)) {
        const entity = state.entities.get(nid)!;
        collisionService.insert(entity.collider);
        renderer.removeEntity(entity);
      }
      state.entities.delete(nid);
    });
  });
}
