import { Container, Graphics } from 'pixi.js'

export function generateBackground() {
    const c = new Container()


    const xStart = -1000
    const yStart = -1000
    const width = 3000
    const height = 3000

    for (let i = 0; i < 30; i++) {
        const g = new Graphics()
        g.beginFill(Math.random() * 0xffffff)
        g.drawCircle(
            xStart + Math.random() * width,
            yStart + Math.random() * height,
            Math.random() * 600
        )
        g.endFill()
        g.alpha = Math.random() * 0.5
        c.addChild(g)
    }

    return c
}