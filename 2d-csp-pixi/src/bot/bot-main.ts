import { Client, Interpolator } from 'nengi'
import { ncontext } from '../common/ncontext'
import { WsClientAdapter } from 'nengi-ws-client-adapter'


type Bot = { client: Client, interpolator: Interpolator }


const bots: Set<Bot> = new Set()

async function createBot() {
    const client = new Client(ncontext, WsClientAdapter, 20)
    // we use an interpolator for the bots because as of nengi alpha.150
    // this is the only thing that clears the network data
    // otherwise the client will just hoard it until it crashes
    const interpolator = new Interpolator(client)
    await client.connect('ws://localhost:9001', { token: 12345 })
    bots.add({ client, interpolator })
}


async function connectBots(quantity: number) {
    for (let  i = 0; i < quantity; i++) {    
        // we don't await this even though it is async
        // this allows multiple connections to be opened in parallel
        // add await to open them one at a time   
        createBot() 
    }
}

setInterval(() => {
    bots.forEach(bot => {
        bot.interpolator.getInterpolatedState(100)
        bot.client.flush()
    })
}, 1/30 * 1000)

connectBots(110)
