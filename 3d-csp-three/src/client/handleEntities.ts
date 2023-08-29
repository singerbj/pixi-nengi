import { Interpolator } from 'nengi'
import { State } from './State'
import { THREERenderer } from './THREERenderer'


/**
 * Creates and synchronizes entities being from the nengi instance with the renderer
 * @param interpolator
 * @param state
 * @param renderer
 */
export function handleEntities(interpolator: Interpolator, state: State, renderer: THREERenderer) {
    const istate = interpolator.getInterpolatedState(100)

    // changes in entities (create, update, delete)
    istate.forEach(snapshot => {
        snapshot.createEntities.forEach((entity: any) => {
            console.log('create', entity)
            const gfxEntity = renderer.addEntity(entity)
            state.entities.set(gfxEntity.nid, gfxEntity)
        })

        snapshot.updateEntities.forEach((diff: any) => {
            const { nid, prop, value } = diff
            const graphicalEntity = state.entities.get(nid) as any
            if (graphicalEntity) {
                if (state.isPredictionEnabled && state.myId === nid) {
                    // skip applying this state to the entity, we are predicting it instead
                    return
                }
                graphicalEntity[prop] = value // e.g. entity.x = 5
            } else {
                console.log(`Unexpected entity data: | nid: ${ nid } prop: ${ prop } value: ${ value }`)
            }
        })

        snapshot.deleteEntities.forEach((nid: number) => {
            if (state.entities.has(nid)) {
                const graphicalEntity = state.entities.get(nid)!
                renderer.removeEntity(graphicalEntity)
                state.entities.delete(nid)
            }
        })
    })
}