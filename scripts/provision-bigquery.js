require('dotenv').config({ path: '.env.local' });
const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT });

async function provisionBigQuery() {
  const datasetId = 'auracare_ml';
  const tableId = 'raw_telemetry';

  try {
    console.log(`[1/3] Creating BigQuery Dataset: ${datasetId}...`);
    await bigquery.createDataset(datasetId).catch(e => {
      if (e.code !== 409) throw e; // 409 means it already exists
      console.log(`Dataset ${datasetId} already exists.`);
    });

    const schema = [
      { name: 'patientId', type: 'INT64', mode: 'REQUIRED' },
      { name: 'deviceId', type: 'STRING', mode: 'REQUIRED' },
      { name: 'heartRate', type: 'INT64', mode: 'NULLABLE' },
      { name: 'spo2', type: 'INT64', mode: 'NULLABLE' },
      { name: 'temp', type: 'FLOAT64', mode: 'NULLABLE' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ];

    const options = {
      schema,
      timePartitioning: {
        type: 'DAY',
        field: 'timestamp',
      },
    };

    console.log(`[2/3] Creating Partitioned Table: ${tableId}...`);
    await bigquery.dataset(datasetId).createTable(tableId, options).catch(e => {
      if (e.code !== 409) throw e;
      console.log(`Table ${tableId} already exists.`);
    });

    console.log('✅ BigQuery Infrastructure Provisioned Successfully.');
    console.log('Telemetry data can now be streamed directly from Pub/Sub to BigQuery for ML training.');
  } catch (error) {
    console.error('Failed to provision BigQuery:', error);
  }
}

provisionBigQuery();
