import { StatsEntity } from '../common/StatsEntity'
/**
 * 
 * @param propName 
 * @param label 
 * @param initialValue 
 * @param targetObject 
 * @returns 
 */
function createReactiveDivBoundToSetter(propName: string, label: string, initialValue: string | number, targetObject: object): HTMLDivElement {
    const div = document.createElement('div')
    Object.defineProperty(targetObject, propName, {
        set(value: number) {
            div.textContent = `${label}: ${ value.toFixed(1) }`
        }
    })
    // @ts-ignore
    targetObject[propName] = initialValue
    return div
}

export class StatsHTML {
    nid = 0
    ntype = 0

    container: HTMLDivElement

    constructor(data: StatsEntity) {
        const { averageDeltaMs, averageCPUFrameMs, userCount, entityCount } = data
        this.container = document.createElement('div')
        this.container.innerText = "Server Stats"
        this.container.style.position = 'absolute'
        this.container.style.top = '0px'
        this.container.style.color = 'white'
        this.container.appendChild(createReactiveDivBoundToSetter('averageCPUFrameMs', 'CPUMs', averageCPUFrameMs, this))
        this.container.appendChild(createReactiveDivBoundToSetter('averageDeltaMs', 'DeltaMs', averageDeltaMs, this))
        this.container.appendChild(createReactiveDivBoundToSetter('userCount', 'Users', userCount, this))
        this.container.appendChild(createReactiveDivBoundToSetter('entityCount', 'Entities', entityCount, this))
    }
}