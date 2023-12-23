export type nid = number

export class State {
    myId = -1
    isPredictionEnabled = true
    entities: Map<nid, any>

    constructor() {
        this.entities = new Map()
    }
}
