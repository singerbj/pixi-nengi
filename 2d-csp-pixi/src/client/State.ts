import { GraphicalEntity } from './GraphicalEntity'

export type nid = number

export class State {
    myId = -1
    isPredictionEnabled = true
    entities: Map<nid, GraphicalEntity>

    constructor() {
        this.entities = new Map()
    }
}
