/**
 * Web Vitals Reporting - Core Web Vitals metrics
 * LCP: Largest Contentful Paint
 * FID: First Input Delay
 * CLS: Cumulative Layout Shift
 * FCP: First Contentful Paint
 * TTFB: Time to First Byte
 */

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type MetricHandler = (metric: Metric) => void;

class WebVitalsReporter {
  private metrics: Map<string, Metric> = new Map();
  private handlers: MetricHandler[] = [];

  constructor() {
    this.initializeReporting();
  }

  private initializeReporting() {
    if (typeof window === 'undefined') return;

    // Report when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.reportAllMetrics();
    });

    // Report on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportAllMetrics();
      }
    });
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  recordMetric(name: string, value: number, id: string) {
    const rating = this.getRating(name, value);
    const previousMetric = this.metrics.get(name);
    const delta = previousMetric ? value - previousMetric.value : value;

    const metric: Metric = {
      name,
      value,
      rating,
      delta,
      id,
    };

    this.metrics.set(name, metric);
    this.notifyHandlers(metric);

    console.log(`📊 Web Vital: ${name}`, {
      value: `${value.toFixed(2)}ms`,
      rating,
      delta: delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2),
    });
  }

  private notifyHandlers(metric: Metric) {
    this.handlers.forEach((handler) => {
      try {
        handler(metric);
      } catch (error) {
        console.error('Web Vitals handler error:', error);
      }
    });
  }

  onMetric(handler: MetricHandler) {
    this.handlers.push(handler);
  }

  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  private reportAllMetrics() {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) return;

    console.log('📊 Final Web Vitals Report:', {
      metrics: metrics.map((m) => ({
        name: m.name,
        value: `${m.value.toFixed(2)}ms`,
        rating: m.rating,
      })),
    });

    // Send to analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metrics);
    }
  }

  private async sendToAnalytics(metrics: Metric[]) {
    try {
      // Send metrics to your analytics endpoint
      const body = JSON.stringify({
        metrics: metrics.map((m) => ({
          name: m.name,
          value: m.value,
          rating: m.rating,
        })),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });

      // Use sendBeacon for reliability on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body);
      } else {
        fetch('/api/analytics/vitals', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('Failed to send web vitals:', error);
    }
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const webVitalsReporter = new WebVitalsReporter();

// Helper function to measure custom performance marks
export function measurePerformance(markName: string) {
  if (!('performance' in window)) return;

  const startMark = `${markName}-start`;
  const endMark = `${markName}-end`;

  return {
    start: () => {
      performance.mark(startMark);
    },
    end: () => {
      performance.mark(endMark);
      try {
        performance.measure(markName, startMark, endMark);
        const measure = performance.getEntriesByName(markName)[0];
        console.log(`⏱️ ${markName}:`, `${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.error('Performance measurement error:', error);
        return 0;
      }
    },
  };
}
