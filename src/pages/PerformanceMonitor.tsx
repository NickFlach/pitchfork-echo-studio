import { Navigation } from "@/components/Navigation";
import { PerformanceMonitor as PerformanceMonitorComponent } from "@/components/ui/performance-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { performanceMonitor } from "@/lib/performance";
import { webVitalsReporter } from "@/lib/webVitals";
import { toast } from "sonner";

export default function PerformanceMonitor() {
  const handleClearMetrics = () => {
    performanceMonitor.clearMetrics();
    webVitalsReporter.clearMetrics();
    toast.success("Performance metrics cleared");
    window.location.reload();
  };

  const handleExportMetrics = () => {
    const metrics = {
      performance: performanceMonitor.getMetrics(),
      webVitals: webVitalsReporter.getAllMetrics(),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(metrics, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Metrics exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                Performance Monitor
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time performance metrics and web vitals
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportMetrics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleClearMetrics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Performance Metrics</CardTitle>
              <CardDescription>
                Monitor your application's performance in real-time. Metrics update every 2 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMonitorComponent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Web Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-1">LCP (Largest Contentful Paint)</h4>
                <p>Measures loading performance. Good: &lt;2.5s, Needs Improvement: 2.5-4s, Poor: &gt;4s</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">FID (First Input Delay)</h4>
                <p>Measures interactivity. Good: &lt;100ms, Needs Improvement: 100-300ms, Poor: &gt;300ms</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">CLS (Cumulative Layout Shift)</h4>
                <p>Measures visual stability. Good: &lt;0.1, Needs Improvement: 0.1-0.25, Poor: &gt;0.25</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
