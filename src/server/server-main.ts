import { Instance, NetworkEvent, AABB2D, Channel, User } from 'nengi'
import { NType, ncontext } from '../common/ncontext'
import { uWebSocketsInstanceAdapter } from 'nengi-uws-instance-adapter'
import { Entity } from '../common/Entity'
import { IdentityMessage } from '../common/IdentityMessage'
import { move } from '../common/move'
import { StatsEntity } from '../common/StatsEntity'

// mocks hitting an external service to authenticate a user
const authenticateUser = async (handshake: any) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => { // as if the api took time to respond
            // in reality the website portion of your game should generate an auth token
            // which this game instance can use to get your player data (assuming a game that
            // requires authentication and loads a persistent character)
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

const queue = instance.queue
type MyUser = User & { entity: any, view: AABB2D } // view is currently not used

const npcs: Map<number, Entity> = new Map()


function spawnNewNPC() {
    const npc = new Entity()
    npc.x = Math.random() * 500
    npc.y = Math.random() * 500
    npc.maxAge = 1 + (Math.random() * 3) // live for 10-20 seconds
    npc.speed = Math.random() * 1000
    main.addEntity(npc)
    npcs.set(npc.nid, npc)
}

function removeNPC(npc: Entity) {
    npcs.delete(npc.nid)
    main.removeEntity(npc)
}

for (let i = 0; i < 10; i++) {
    spawnNewNPC()
}

const stats = new StatsEntity()
main.addEntity(stats)

const update = (delta: number) => {
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
    npcs.forEach(npc => {
        npc.age += delta
        if (npc.walkingRight) {
            npc.x += npc.speed * delta
        } else {
            npc.x -= npc.speed * delta
        }

        if (npc.x > 1000) {
            npc.walkingRight = false
        }

        if (npc.x < 0) {
            npc.walkingRight = true
        }

        if (npc.age > npc.maxAge) {
            removeNPC(npc)
            spawnNewNPC()
        }
    })
    stats.entityCount = instance.localState._entities.size
    stats.userCount = instance.users.size
    instance.step()
}

let prev = performance.now()
setInterval(() => {
    const start = performance.now()
    const deltaMs = start - prev
    prev = start
    //console.log(deltaMs)
    stats.registerDelta(deltaMs)
    update(deltaMs / 1000)
    const end = performance.now()
    const frametime = end - start
    stats.registerCPUFrame(frametime)
    stats.cpuMillisecondsPerTick = frametime // technically this is the previous frames' time by the time the client sees it
    //console.log('connected clients', instance.users.size, ' :: ', frametime, 'time', instance.localState._entities.size)
}, 50)

