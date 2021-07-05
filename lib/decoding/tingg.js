const decodeTinggMessage = function decodeTinggMessage(topic, payload) {
    // comes in like "/osm/:boxid/:sensorid" 
    // should return boxid and sensorid as well as payload inf
    const topicArray = topic.split("/");
    console.log(topicArray);
    const boxid = topicArray[1];
    const sensorid = topicArray[2];
    const payloadObject = payload.split(",");
    const value = parseFloat(payloadObject[0]);
    const createdat = payloadObject[1];
    const lat = payloadObject[2];
    const lng = payloadObject[3];
    return { boxid, sensorid, value, createdat, lat, lng }
}

module.exports = {
    decodeTinggMessage
};
