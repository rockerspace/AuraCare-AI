require('dotenv').config({ path: '.env.local' });
const mqtt = require('mqtt');

const PORT = process.env.MQTT_PORT || 1883;
const BROKER_URL = `mqtt://localhost:${PORT}`;
const IOT_API_KEY = process.env.IOT_API_KEY;

// Simulate an Apple Watch or clinical chest patch
const client = mqtt.connect(BROKER_URL, {
  clientId: `device_auracare_${Math.random().toString(16).slice(3)}`,
  username: 'device',
  password: IOT_API_KEY, // In production, this would be mTLS certificates
  clean: true,
});

client.on('connect', () => {
  console.log('✅ Connected to AuraCare MQTT Broker');
  
  // Simulate telemetry ping every 5 seconds
  setInterval(() => {
    const payload = JSON.stringify({
      patientId: 1,
      heartRate: Math.floor(Math.random() * (95 - 65 + 1)) + 65,
      spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
      temp: (Math.random() * (99.1 - 97.5) + 97.5).toFixed(1)
    });
    
    client.publish('telemetry/vitals', payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to publish:', err);
      } else {
        console.log('📡 Published:', payload);
      }
    });
  }, 5000);
});

client.on('error', (err) => {
  console.error('MQTT Connection Error:', err);
});
