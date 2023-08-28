import { Instance, NetworkEvent, User, ChannelAABB3D, AABB3D } from 'nengi'
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

const main = new ChannelAABB3D(instance.localState) //new Channel(instance.localState)
instance.registerChannel(main)

const queue = instance.queue
type MyUser = User & { entity: any, view: AABB3D } // example of mixing a nengi user with extra state while satisfying typescript

for (let i = 0; i < 10; i++) {
    const npc = new Entity()
    npc.x = Math.random() * 3
    npc.y = Math.random() * 3
    npc.z = Math.random() * 3
    main.addEntity(npc)
    //let walkingRight = true
}



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
            const view = new AABB3D(0, 0, 0, 2, 2, 2)
            user.view = view
            main.subscribe(user, view)
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

                    view.x = entity.x
                    view.y = entity.y
                    view.z = entity.z
                }
            })
        }
    }

    // game logic goes here
    // in this case we just  have an npc that moves back and forth...
    /*
    if (walkingRight) {
        npc.x += 0.3
    } else {
        npc.x -= 0.6
    }

    if (npc.x > 10) {
        walkingRight = false
    }

    if (npc.x < 0) {
        walkingRight = true
    }
    */

    instance.step()
}

setInterval(() => {
    const start = performance.now()
    update()
    const end = performance.now()
    const frametime = end - start
    //  console.log('connected clients', instance.users.size, ' :: ', frametime, 'time')
}, 50)

