import { Container, DisplayObject, Renderer } from 'pixi.js'
import { State } from './State'
import { generateBackground } from './generateBackground'

export class PIXIRenderer {
    renderer: Renderer
    stage: Container
    camera: Container

    constructor() {
        const canvas: HTMLCanvasElement = document.getElementById('main-canvas') as HTMLCanvasElement
        this.renderer = new Renderer({
            view: canvas,
            width: window.innerWidth,
            height: window.innerHeight,
        })

        window.addEventListener('resize', () => {
            this.renderer.resize(window.innerWidth, window.innerHeight)
        })

        this.stage = new Container()      

        this.camera = new Container()
        this.camera.addChild(generateBackground())

        this.stage.addChild(this.camera)
    }

    addEntity(entity: DisplayObject) {
        this.camera.addChild(entity)
    }

    addHUD(obj: DisplayObject) {
        this.stage.addChild(obj)
    }

    removeEntity(entity: DisplayObject) {
        this.camera.removeChild(entity)
        entity.destroy()
    }

    render() {
        this.renderer.render(this.stage)
    }

    cameraFollow(state: State) {
        const playerEntity = state.entities.get(state.myId)
        if (playerEntity) {
            this.camera.x = -playerEntity.x + window.innerWidth * 0.5
            this.camera.y = -playerEntity.y + window.innerHeight * 0.5
        }
    }
}