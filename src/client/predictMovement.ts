import { Client } from 'nengi'
import { MoveCommand } from '../common/MoveCommand'
import { move } from '../common/move'
import { entitySchema } from '../common/Entity'
import { State } from './State'


export function predictMovement(state: State, moveCommand: MoveCommand, client: Client) {
    const entity = state.entities.get(state.myId)

    if (entity && state.isPredictionEnabled) {
        move(entity, moveCommand)

        const { x, y } = entity
        client.predictor.addCustom(client.network.clientTick, { nid: state.myId, x, y }, ['x', 'y'], entitySchema)
    }
}