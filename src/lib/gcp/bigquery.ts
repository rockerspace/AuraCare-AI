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
      console.error(`[BigQuery] Failed to insert rows:`, error);
      throw error;
    }
  }
}

export const bigQuery = new BigQueryService();
