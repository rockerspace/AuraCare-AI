import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Alert } from 'react-native';
import * as ExpoHealthKit from '@kayzmann/expo-healthkit';

export default function App() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [spo2, setSpo2] = useState<number | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
  const [temp, setTemp] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    async function initHealth() {
      console.log("Checking AppleHealthKit native module...");
      const available = ExpoHealthKit.isAvailable();
      if (!available) {
        Alert.alert("Error", "Apple HealthKit is not available on this device.");
        return;
      }
      
      try {
        await ExpoHealthKit.requestAuthorization(
          ['HeartRate', 'OxygenSaturation', 'Steps'], // Read
          [] // Write
        );
        setHasPermissions(true);
      } catch (e: any) {
        Alert.alert("Permission Error", `Failed: ${e.message}`);
      }
    }
    initHealth();
  }, []);

  const fetchVitals = async () => {
    if (!hasPermissions) return;
    
    let currentHr = heartRate;
    let currentSpo2 = spo2;
    let currentSteps = steps;
    let currentTemp = 98.6 + (Math.random() * 0.4 - 0.2); // Fallback: simulate normal temp fluctuations
    setTemp(parseFloat(currentTemp.toFixed(1)));

    try {
      const latestHr = await ExpoHealthKit.getLatestHeartRate();
      if (latestHr) {
        setHeartRate(latestHr);
        currentHr = latestHr;
      }
    } catch (err) {
      console.log('Error reading heart rate', err);
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start of today
      const stepCount = await ExpoHealthKit.getSteps(startDate, endDate);
      if (stepCount !== undefined && stepCount !== null && stepCount > 0) {
        setSteps(stepCount);
        currentSteps = stepCount;
      } else {
        // Fallback for hackathon demo if no steps taken yet today
        setSteps(4250);
        currentSteps = 4250;
      }
    } catch (err) {
      console.log('Error reading steps', err);
      setSteps(4250);
      currentSteps = 4250;
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const spo2Records = await ExpoHealthKit.getOxygenSaturation(startDate, endDate, 1);
      if (spo2Records && spo2Records.length > 0) {
        // @ts-ignore
        let val = spo2Records[0].value;
        if (val <= 1) val = val * 100; // Convert 0.98 to 98
        setSpo2(Math.round(val));
        currentSpo2 = Math.round(val);
      } else {
        // Fallback if the user's Apple Watch doesn't have Blood Oxygen enabled (e.g. recent US models)
        console.log('No SpO2 data found, using fallback');
        setSpo2(98);
        currentSpo2 = 98;
      }
    } catch (err) {
      console.log('Error reading spo2', err);
      setSpo2(98);
      currentSpo2 = 98;
    }

    sendToNextJsBackend(currentHr || 0, currentSpo2 || 98, currentSteps || 100, parseFloat(currentTemp.toFixed(1)));
  };

  const sendToNextJsBackend = async (hr: number, spo2Value: number, mobilityValue: number, tempValue: number) => {
    try {
      // ATS is now disabled in app.json, so we can use plaintext HTTP over the local network directly!
      const NEXT_JS_URL = 'http://192.168.1.8:3000/api/ingest';
      
      const payload = {
        patient_id: "apple-watch-patient",
        heart_rate: hr,
        spO2: spo2Value,
        mobility: mobilityValue, // Using daily steps as a proxy for mobility index
        temp: tempValue,
        timestamp: new Date().toISOString()
      };

      console.log('Sending payload:', payload);

      const response = await fetch(NEXT_JS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mvp-vrn-secret-token',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send data to backend', response.status);
      }
    } catch (e) {
      console.error('Network Error:', e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      fetchVitals(); // Fetch immediately on start
      interval = setInterval(() => {
        fetchVitals();
      }, 5000); // Fetch every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, hasPermissions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MVP VRN Watch Client</Text>
      
      {!hasPermissions ? (
        <Text style={styles.status}>Waiting for HealthKit Permissions...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={styles.metricValue}>{heartRate ? `${heartRate} BPM` : '--'}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Blood Oxygen</Text>
            <Text style={styles.metricValue}>{spo2 ? `${spo2}%` : '--'}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Daily Steps</Text>
            <Text style={styles.metricValue}>{steps !== null ? steps : '--'}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Body Temp</Text>
            <Text style={styles.metricValue}>{temp !== null ? `${temp}°F` : '--'}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              title={isStreaming ? "Stop Streaming" : "Start Streaming"} 
              onPress={() => setIsStreaming(!isStreaming)} 
              color={isStreaming ? "red" : "green"}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40
  },
  status: {
    fontSize: 16,
    color: 'gray'
  },
  metricsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  metricCard: {
    width: '80%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%'
  }
});
