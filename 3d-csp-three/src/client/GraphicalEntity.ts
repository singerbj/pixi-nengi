import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three'

export class GraphicalEntity {
    nid = 0
    ntype = 0
    geometry = new BoxGeometry(1, 1, 1)
    material = new MeshLambertMaterial({ color: 0xffffff })//new MeshBasicMaterial({ color: 0x00ff00 })
    mesh = new Mesh(this.geometry, this.material)

    // we use get/set so that we can have a flat nengi network object with x,y,z, meanwhile this graphical object has mesh.position.x,y,z
    get x() { return this.mesh.position.x }
    set x(value: number) { this.mesh.position.x = value }
    get y() { return this.mesh.position.y }
    set y(value: number) { this.mesh.position.y = value }
    get z() { return this.mesh.position.z }
    set z(value: number) { this.mesh.position.z = value }
}