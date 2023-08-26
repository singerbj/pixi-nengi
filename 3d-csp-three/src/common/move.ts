import { MoveCommand } from './MoveCommand'

export function move(entity: { x: number, y: number }, moveCommand: MoveCommand) {
    // the correct version of this is a NORMALIZED VECTOR * delta
    // this math is incorrect

    const speed = 200

    const { up, down, left, right, delta } = moveCommand

    if (up) {
        entity.y -= speed * delta
    }
    if (down) {
        entity.y += speed * delta
    }
    if (left) {
        entity.x -= speed * delta
    }
    if (right) {
        entity.x += speed * delta
    }
}