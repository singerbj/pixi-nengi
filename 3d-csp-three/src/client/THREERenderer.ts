import { HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { GraphicalEntity } from './GraphicalEntity'

export class THREERenderer {
    scene = new Scene()
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    light = new HemisphereLight( 0xffffbb, 0x080820, 1)
    renderer = new WebGLRenderer({ canvas: document.getElementById('main-canvas')! })

    constructor() {
        //  pushing the camera into the Z direction and then rotating around the X axis by pi radians
        //  produces a view where Y points down and X points to the right, aka the same orientation as a 2D renderer
        this.camera.position.z = -5
        this.camera.rotateOnAxis(new Vector3(1, 0, 0), Math.PI)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.scene.add(this.light)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    addEntity(entity: any) {
        const gfx = new GraphicalEntity()
        Object.assign(gfx, entity)
        this.scene.add(gfx.mesh)
        return gfx
    }

    removeEntity(graphicalEntity: GraphicalEntity) {
        this.scene.remove(graphicalEntity.mesh)
    }
}