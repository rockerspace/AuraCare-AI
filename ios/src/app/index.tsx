import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const patients = [
    { id: '1', name: 'James Wilson', hr: 72, spO2: 98, status: 'Stable' },
    { id: '2', name: 'Mary Smith', hr: 85, spO2: 95, status: 'Warning' },
    { id: '3', name: 'Robert Jones', hr: 68, spO2: 99, status: 'Stable' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Patient Vitals</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {patients.map(p => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={[styles.status, p.status === 'Warning' ? styles.statusWarning : styles.statusStable]}>
                {p.status}
              </Text>
            </View>
            <View style={styles.vitalsRow}>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
                <Text style={styles.vitalValue}>{p.hr} bpm</Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>SpO2</Text>
                <Text style={styles.vitalValue}>{p.spO2}%</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 5,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusStable: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
  },
  statusWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalBox: {
    flex: 1,
  },
  vitalLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  vitalValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
