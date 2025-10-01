import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import { performanceMonitor, getMemoryUsage } from '@/lib/performance';
import { webVitalsReporter } from '@/lib/webVitals';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [memory, setMemory] = useState<ReturnType<typeof getMemoryUsage>>(null);
  const [vitals, setVitals] = useState<any[]>([]);

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics().slice(-5));
      setMemory(getMemoryUsage());
      setVitals(webVitalsReporter.getAllMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'needs-improvement':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'poor':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Recent Metrics</CardTitle>
          </div>
          <CardDescription>Last 5 performance measurements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No metrics yet</p>
          ) : (
            metrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.name}</span>
                <span className="font-mono">{metric.value.toFixed(2)}ms</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Web Vitals</CardTitle>
          </div>
          <CardDescription>Core Web Vitals metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {vitals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading vitals...</p>
          ) : (
            vitals.map((vital) => (
              <div key={vital.id} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{vital.name}</span>
                <Badge className={getRatingColor(vital.rating)}>
                  {vital.value.toFixed(2)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Memory Usage</CardTitle>
          </div>
          <CardDescription>JavaScript heap memory</CardDescription>
        </CardHeader>
        <CardContent>
          {memory ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-mono">
                    {(memory.used / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${memory.percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Limit</span>
                <span className="font-mono">
                  {(memory.limit / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Badge
                className={
                  memory.percentage > 80
                    ? 'bg-red-500/10 text-red-500'
                    : memory.percentage > 60
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-green-500/10 text-green-500'
                }
              >
                {memory.percentage.toFixed(1)}% used
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
