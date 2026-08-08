import { Logging } from '@google-cloud/logging';
import { env } from '../env';

/**
 * GCP Cloud Audit Logs Integration
 * 
 * Utilizes the @google-cloud/logging SDK to write immutable audit logs for HIPAA compliance.
 */

interface AuditLogEntry {
  actorDid: string;
  action: 'READ' | 'WRITE' | 'EXPORT' | 'AI_QUERY';
  resource: string;
  patientId: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED';
}

export class GCPAuditLogger {
  private logging: Logging;
  private logName = 'data_access_audit';

  constructor() {
    this.logging = new Logging({ projectId: env.GCP_PROJECT_ID });
  }

  /**
   * Logs a data access event to GCP Cloud Audit Logs.
   */
  public async logDataAccess(entry: Omit<AuditLogEntry, 'timestamp'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    try {
      const log = this.logging.log(this.logName);
      
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const logEntry = log.entry(metadata, fullEntry);
      await log.write(logEntry);
      
      console.log(`[GCP Audit Log - ${this.logName}] Successfully wrote audit log for ${entry.patientId}`);
      return { success: true, logId: `audit_${Date.now()}` };
    } catch (error) {
      console.error(`[GCP Audit Log - Error] Failed to write audit log:`, error);
      // In a strict HIPAA environment, failing to audit log might require failing the operation
      throw error;
    }
  }
}

export const auditLogger = new GCPAuditLogger();
