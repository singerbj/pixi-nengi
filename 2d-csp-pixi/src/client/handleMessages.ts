import { Client } from 'nengi'
import { State } from './State'
import { NType } from '../common/ncontext'

export function handleMessages(client: Client, state: State) {
    // messages from the server
    while (client.network.messages.length > 0) {
        const message = client.network.messages.pop()
        console.log('network message', { message })

        if (message.ntype === NType.IdentityMessage) {
            state.myId = message.myId
        }
    }
}