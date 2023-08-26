import { Instance, NetworkEvent, AABB2D, Channel, User } from 'nengi'
import { NType, ncontext } from '../common/ncontext'
import { uWebSocketsInstanceAdapter } from 'nengi-uws-instance-adapter'
import { Entity } from '../common/Entity'
import { IdentityMessage } from '../common/IdentityMessage'
import { move } from '../common/move'

// mocks hitting an external service to authenticate a user
const authenticateUser = async (handshake: any) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => { // as if the api took time to respond
            if (handshake.token === 12345) {
                // fake data, which we ignore...
                resolve({ character: 'neuron', level: 24, hp: 89 })
            } else {
                reject('Connection denied: invalid token.')
            }
        }, 500)
    })
}

const instance = new Instance(ncontext)
// uws! node.js

const port = 9001
const uws = new uWebSocketsInstanceAdapter(instance.network, { /* uws config */ })
uws.listen(port, () => { console.log(`uws adapter is listening on ${port}`) })
instance.onConnect = authenticateUser

const main = new Channel(instance.localState)
instance.registerChannel(main)

const queue = instance.queue
type MyUser = User & { entity: any, view: AABB2D } // view is currently not used

const npc = new Entity()
main.addEntity(npc)
let walkingRight = true


const update = () => {
    while (!queue.isEmpty()) {
        const networkEvent = queue.next()

        // disconnections
        if (networkEvent.type === NetworkEvent.UserDisconnected) {
            const user = networkEvent.user as MyUser
            const entity = user.entity
            main.removeEntity(entity)
        }

        // connections
        if (networkEvent.type === NetworkEvent.UserConnected) {
            const user = networkEvent.user as MyUser
            main.subscribe(user)
            const playerEntity = new Entity()
            user.entity = playerEntity
            main.addEntity(playerEntity)
            user.queueMessage(new IdentityMessage(playerEntity.nid))
            console.log('connected', { user })
        }

        // user input
        if (networkEvent.type === NetworkEvent.CommandSet) {
            const { user, commands, clientTick } = networkEvent
            const { entity, view } = (user as MyUser)

            commands.forEach((command: any) => {
                if (command.ntype === NType.MoveCommand) {
                    move(entity, command)
                }
            })
        }
    }

    // game logic goes here
    // in this case we just  have an npc that moves back and forth...
    if (walkingRight) {
        npc.x += 33
    } else {
        npc.x -= 66
    }

    if (npc.x > 1000) {
        walkingRight = false
    }

    if (npc.x < 0) {
        walkingRight = true
    }


    instance.step()
}

setInterval(() => {
    const start = performance.now()
    update()
    const end = performance.now()
    const frametime = end - start
    //  console.log('connected clients', instance.users.size, ' :: ', frametime, 'time')
}, 50)

