const { BigQuery } = require('@google-cloud/bigquery');

async function insertTestRows() {
  const bigquery = new BigQuery({ projectId: 'vemarai' });
  const datasetId = 'auracare_analytics';
  const tableId = 'sensor_telemetry_historical';

  const rows = [
    {
      patient_id: 'patient_01',
      heart_rate: 85,
      mobility: 42,
      timestamp: new Date().toISOString(),
      event_type: 'SOS_PANIC_TRIGGERED'
    },
    {
      patient_id: 'patient_01',
      heart_rate: 110,
      mobility: 15,
      timestamp: new Date(Date.now() + 5000).toISOString(),
      event_type: 'ELEVATED_HEART_RATE_DETECTED'
    }
  ];

  try {
    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    console.log(`Successfully inserted 2 rows.`);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

insertTestRows();
