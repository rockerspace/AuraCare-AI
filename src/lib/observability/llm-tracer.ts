/**
 * OpenTelemetry LLM Tracer
 * 
 * Provides tracing, token tracking, and prompt hashing for all LLM calls
 * (Gemini 1.5 Pro and Gemma 2B) to ensure observability in safety-critical alerts.
 */

import crypto from 'crypto';

interface TracedCall {
  traceId: string;
  model: string;
  promptHash: string;
  tokenCountEstimate: number;
  latencyMs: number;
  timestamp: string;
}

export class LLMTracer {
  /**
   * Generates a SHA-256 hash of the prompt for exact audit reproducibility.
   */
  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  /**
   * Extremely rough token estimation (1 token ~= 4 chars)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Logs an OpenTelemetry span for an LLM call.
   */
  public recordSpan(model: string, prompt: string, latencyMs: number) {
    const trace: TracedCall = {
      traceId: `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      model,
      promptHash: this.hashPrompt(prompt),
      tokenCountEstimate: this.estimateTokens(prompt),
      latencyMs,
      timestamp: new Date().toISOString()
    };

    console.log(`[OpenTelemetry] LLM Trace Logged:`);
    console.table(trace);
    
    // In production, this would be exported via OTLP to Google Cloud Trace or similar.
    return trace;
  }
}

export const llmTracer = new LLMTracer();
