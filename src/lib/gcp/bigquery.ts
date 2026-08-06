import { BigQuery } from '@google-cloud/bigquery';

/**
 * Google BigQuery Analytics Module
 * 
 * Streams historical IoT sensor data and alert logs into BigQuery for 
 * long-term trend analysis and predictive analytics dashboarding.
 */

export class BigQueryService {
  private datasetId = 'auracare_analytics';
  private tableId = 'sensor_telemetry_historical';
  private bigquery: BigQuery;

  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'vemarai',
    });
  }

  /**
   * Streams a batch of rows to BigQuery.
   */
  public async streamData(rows: Record<string, unknown>[]) {
    console.log(`[BigQuery] Streaming ${rows.length} rows to ${this.datasetId}.${this.tableId}...`);
    
    try {
      await this.bigquery
        .dataset(this.datasetId)
        .table(this.tableId)
        .insert(rows);
      
      console.log(`[BigQuery] Successfully inserted ${rows.length} rows.`);
      return { status: 'success', rowsInserted: rows.length };
    } catch (error) {
      console.error('ERROR streaming data to BigQuery:', error);
      throw error;
    }
  }

  // Uses Google Cloud SQL to calculate analytics instead of TypeScript
  public async getAverageHeartRate(): Promise<number> {
    try {
      const query = `
        SELECT AVG(heart_rate) as avg_hr
        FROM \`${this.datasetId}.${this.tableId}\`
        WHERE event_type != 'TEST'
      `;
      const options = {
        query: query,
        location: 'us-central1',
      };
      
      const [job] = await this.bigquery.createQueryJob(options);
      const [rows] = await job.getQueryResults();
      
      if (rows && rows.length > 0 && rows[0].avg_hr) {
        return Math.round(rows[0].avg_hr);
      }
      return 72; // Default if empty
    } catch (error) {
      console.error('ERROR querying BigQuery:', error);
      return 72;
    }
  }
}

export const bigQuery = new BigQueryService();
