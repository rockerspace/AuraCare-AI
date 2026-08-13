import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Alert, Platform } from 'react-native';

// Conditionally require platform-specific health modules
let ExpoHealthKit: any;
if (Platform.OS === 'ios') {
  ExpoHealthKit = require('@kayzmann/expo-healthkit');
}

let HealthConnect: any;
if (Platform.OS === 'android') {
  HealthConnect = require('react-native-health-connect');
}

export default function App() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [spo2, setSpo2] = useState<number | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
  const [temp, setTemp] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    async function initHealth() {
      if (Platform.OS === 'ios') {
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
      } else if (Platform.OS === 'android') {
        console.log("Checking Android Health Connect...");
        try {
          const isInitialized = await HealthConnect.initialize();
          if (!isInitialized) {
            Alert.alert("Error", "Health Connect is not available.");
            return;
          }
          
          await HealthConnect.requestPermission([
            { accessType: 'read', recordType: 'HeartRate' },
            { accessType: 'read', recordType: 'OxygenSaturation' },
            { accessType: 'read', recordType: 'Steps' },
          ]);
          setHasPermissions(true);
        } catch (e: any) {
          Alert.alert("Permission Error", `Failed: ${e.message}`);
        }
      }
    }
    initHealth();
  }, []);

  const fetchVitalsIOS = async (currentHr: number | null, currentSpo2: number | null, currentSteps: number | null) => {
    let hr = currentHr;
    let spo2Val = currentSpo2;
    let stepsVal = currentSteps;

    try {
      const latestHr = await ExpoHealthKit.getLatestHeartRate();
      if (latestHr) hr = latestHr;
    } catch (err) { console.log('Error HR', err); }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const stepCount = await ExpoHealthKit.getSteps(startDate, endDate);
      if (stepCount && stepCount > 0) stepsVal = stepCount;
      else stepsVal = 4250;
    } catch (err) { stepsVal = 4250; }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const spo2Records = await ExpoHealthKit.getOxygenSaturation(startDate, endDate, 1);
      if (spo2Records && spo2Records.length > 0) {
        let val = spo2Records[0].value;
        if (val <= 1) val = val * 100;
        spo2Val = Math.round(val);
      } else {
        spo2Val = 98;
      }
    } catch (err) { spo2Val = 98; }

    return { hr, spo2Val, stepsVal };
  };

  const fetchVitalsAndroid = async (currentHr: number | null, currentSpo2: number | null, currentSteps: number | null) => {
    let hr = currentHr;
    let spo2Val = currentSpo2;
    let stepsVal = currentSteps;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const timeRangeFilter = {
      operator: 'between',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    try {
      // For Android emulators or devices without real data, simulate data to match iOS fallback
      const hrResult = await HealthConnect.readRecords('HeartRate', { timeRangeFilter });
      if (hrResult.records && hrResult.records.length > 0) {
        hr = hrResult.records[hrResult.records.length - 1].samples[0].beatsPerMinute;
      } else {
        hr = hr || Math.floor(Math.random() * (90 - 70) + 70); // Simulate HR
      }

      const stepsResult = await HealthConnect.readRecords('Steps', { timeRangeFilter });
      if (stepsResult.records && stepsResult.records.length > 0) {
        stepsVal = stepsResult.records.reduce((acc: number, curr: any) => acc + curr.count, 0);
      } else {
        stepsVal = 4250; // Fallback
      }

      const spo2Result = await HealthConnect.readRecords('OxygenSaturation', { timeRangeFilter });
      if (spo2Result.records && spo2Result.records.length > 0) {
        spo2Val = spo2Result.records[spo2Result.records.length - 1].percentage;
      } else {
        spo2Val = 98; // Fallback
      }
    } catch (err) {
      console.log('Android Health Connect read error:', err);
      // Ensure we always have simulated data if reading fails completely
      hr = hr || 75;
      stepsVal = 4250;
      spo2Val = 98;
    }

    return { hr, spo2Val, stepsVal };
  };

  const fetchVitals = async () => {
    if (!hasPermissions) return;
    
    let currentTemp = 98.6 + (Math.random() * 0.4 - 0.2);
    setTemp(parseFloat(currentTemp.toFixed(1)));

    let vitals = { hr: heartRate, spo2Val: spo2, stepsVal: steps };

    if (Platform.OS === 'ios') {
      vitals = await fetchVitalsIOS(vitals.hr, vitals.spo2Val, vitals.stepsVal);
    } else if (Platform.OS === 'android') {
      vitals = await fetchVitalsAndroid(vitals.hr, vitals.spo2Val, vitals.stepsVal);
    }

    if (vitals.hr) setHeartRate(vitals.hr);
    if (vitals.spo2Val) setSpo2(vitals.spo2Val);
    if (vitals.stepsVal) setSteps(vitals.stepsVal);

    sendToNextJsBackend(
      vitals.hr || 75, 
      vitals.spo2Val || 98, 
      vitals.stepsVal || 4250, 
      parseFloat(currentTemp.toFixed(1))
    );
  };

  const sendToNextJsBackend = async (hr: number, spo2Value: number, mobilityValue: number, tempValue: number) => {
    try {
      const NEXT_JS_URL = 'http://192.168.1.8:3000/api/ingest';
      
      const payload = {
        patient_id: Platform.OS === 'android' ? "android-watch-patient" : "apple-watch-patient",
        heart_rate: hr,
        spO2: spo2Value,
        mobility: mobilityValue,
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
      fetchVitals();
      interval = setInterval(() => {
        fetchVitals();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, hasPermissions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MVP VRN Watch Client ({Platform.OS === 'android' ? 'Android' : 'iOS'})</Text>
      
      {!hasPermissions ? (
        <Text style={styles.status}>Waiting for Health Permissions...</Text>
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
