import {trace, context, SpanStatusCode} from '@opentelemetry/api';

export const tracers = {
  api: trace.getTracer('holocaust-education-api', '1.0.0'),
  lexicon: trace.getTracer('lexicon-tool', '1.0.0'),
  testimony: trace.getTracer('testimony-tool', '1.0.0'),
  database: trace.getTracer('database', '1.0.0'),
  search: trace.getTracer('search', '1.0.0'),
};

export function createSpan(
  tracerName: keyof typeof tracers,
  spanName: string,
  attributes?: Record<string, string | number | boolean>,
) {
  const span = tracers[tracerName].startSpan(spanName);

  if (attributes) {
    span.setAttributes(attributes);
  }

  return span;
}

export function withSpan<T>(
  tracerName: keyof typeof tracers,
  spanName: string,
  fn: (span: any) => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracers[tracerName].startActiveSpan(spanName, async span => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }

      const result = await fn(span);
      span.setStatus({code: SpanStatusCode.OK});
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

export function addSpanEvent(
  span: any,
  name: string,
  attributes?: Record<string, string | number | boolean>,
) {
  span.addEvent(name, attributes);
}

export function setSpanAttributes(
  span: any,
  attributes: Record<string, string | number | boolean>,
) {
  span.setAttributes(attributes);
}
