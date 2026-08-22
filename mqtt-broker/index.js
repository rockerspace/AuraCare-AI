require('dotenv').config({ path: '../.env.local' });
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const { PubSub } = require('@google-cloud/pubsub');

const PORT = process.env.MQTT_PORT || 1883;
const pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
const TOPIC_NAME = 'mqtt-ingest';

// Authentication: Simulating mTLS / API Key validation for IoT devices
aedes.authenticate = (client, username, password, callback) => {
  const isValid = (password && password.toString() === process.env.IOT_API_KEY);
  if (isValid) {
    callback(null, true);
  } else {
    const error = new Error('Auth Failed: Invalid IoT API Key');
    error.returnCode = 4;
    callback(error, null);
  }
};

// Handle incoming telemetry
aedes.on('publish', async (packet, client) => {
  if (client) {
    try {
      const payloadString = packet.payload.toString();
      const payload = JSON.parse(payloadString);
      
      console.log(`[MQTT] Received telemetry from ${client.id}:`, payload);
      
      // Bridge the telemetry directly into Google Cloud Pub/Sub
      const topic = pubsub.topic(TOPIC_NAME);
      await topic.publishMessage({ 
        json: {
          patientId: payload.patientId,
          heartRate: payload.heartRate,
          spo2: payload.spo2,
          temp: payload.temp,
          deviceId: client.id,
          timestamp: new Date().toISOString()
        } 
      });
      console.log(`[Pub/Sub] Bridged telemetry to ${TOPIC_NAME}`);
      
    } catch (err) {
      console.error("[MQTT] Dropped invalid payload or Pub/Sub failure:", err);
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 AuraCare Enterprise MQTT Broker listening on port ${PORT}`);
});
