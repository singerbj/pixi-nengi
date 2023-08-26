import { Client, PredictionErrorEntity, PredictionErrorProperty } from 'nengi'

export function handlePredictionErrors(client: Client) {
    // errors in clientside prediction (determined based on fresh server data this frame)
    while (client.network.predictionErrorFrames.length > 0) {
        const predictionErrorFrame = client.network.predictionErrorFrames.pop()
        predictionErrorFrame.entities.forEach((predictionErrorEntity: PredictionErrorEntity) => {
            predictionErrorEntity.errors.forEach((predictionErrorProperty: PredictionErrorProperty) => {
                const { nid, prop, predictedValue, actualValue } = predictionErrorProperty
                // doesn't actually do anything.. just logs to console
                console.log('prediction error! reconile it', { nid, prop, predictedValue, actualValue })
            })
        })
    }
}