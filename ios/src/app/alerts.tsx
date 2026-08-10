import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();

  const alerts = [
    { id: '1', title: 'Behavioral Anomaly', message: 'Mary Smith is showing signs of agitation.', time: '2m ago', severity: 'high' },
    { id: '2', title: 'Heart Rate Spike', message: 'James Wilson HR > 110 bpm for 5 mins.', time: '15m ago', severity: 'critical' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Alerts</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {alerts.map(alert => (
          <View key={alert.id} style={[styles.card, alert.severity === 'critical' ? styles.borderCritical : styles.borderHigh]}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{alert.title}</Text>
              <Text style={styles.time}>{alert.time}</Text>
            </View>
            <Text style={styles.message}>{alert.message}</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  borderCritical: {
    borderLeftColor: '#ef4444',
  },
  borderHigh: {
    borderLeftColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
  },
  message: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
