import { Container, Graphics, Text } from 'pixi.js'

export class GraphicalEntity extends Container {
    graphics: Graphics
    nidText: Text

    constructor() {
        super()

        this.graphics = new Graphics()
        this.graphics.beginFill(0xff00ff)
        this.graphics.drawCircle(0, 0, 50)
        this.graphics.endFill()

        this.addChild(this.graphics)

        this.nidText = new Text('n/a')
        this.addChild(this.nidText)
    }

    destroy() {
        this.graphics.destroy()
        this.nidText.destroy()
        //this.destroy()
    }

    // note we do not have to define get/set for x,y because these already exist on Container

    set nid (value: number) {
        this.nidText.text = `${ value }`
    }
}