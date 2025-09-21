import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Network, 
  FileCheck, 
  Users, 
  TrendingUp, 
  Brain,
  Target,
  Zap,
  Search,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Scale
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface CorruptionDetectionDashboardProps {
  agentId?: string;
}

export const CorruptionDetectionDashboard = ({ agentId = 'corruption-ai' }: CorruptionDetectionDashboardProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [analysisTarget, setAnalysisTarget] = useState('');
  const [analysisType, setAnalysisType] = useState<'document' | 'entity' | 'movement'>('document');
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);

  // Mock data for demonstration - would connect to real API
  const corruptionStats = {
    documentsAnalyzed: 1247,
    corruptionDetected: 89,
    systemicCasesFound: 12,
    movementsProtected: 34,
    averageConfidence: 0.87,
    criticalAlerts: 5
  };

  const recentDetections = [
    {
      id: '1',
      type: 'bid-rigging',
      target: 'City Infrastructure Contract',
      confidence: 0.92,
      severity: 'high',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'regulatory-capture',
      target: 'Environmental Protection Agency',
      confidence: 0.88,
      severity: 'very-high',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'confirmed'
    },
    {
      id: '3',
      type: 'embezzlement',
      target: 'Public Education Fund',
      confidence: 0.79,
      severity: 'high',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'evidence-gathering'
    }
  ];

  const systemicThreats = [
    {
      id: '1',
      name: 'Healthcare Procurement Network',
      entities: ['Hospital A', 'Pharma Corp B', 'Regulatory Board C'],
      riskScore: 0.91,
      patterns: ['bid-rigging', 'regulatory-capture', 'price-fixing'],
      timeframe: '18 months'
    },
    {
      id: '2',
      name: 'Urban Development Syndicate',
      entities: ['Construction Co X', 'City Planning Dept', 'Mayor Office'],
      riskScore: 0.84,
      patterns: ['zoning-corruption', 'contract-manipulation', 'cronyism'],
      timeframe: '24 months'
    }
  ];

  // Mock analysis mutation
  const analyzeTargetMutation = useMutation({
    mutationFn: async ({ target, type }: { target: string, type: string }) => {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        target,
        type,
        overallCorruptionScore: Math.random() * 0.8 + 0.1,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        detectedPatterns: [
          {
            patternName: 'Suspicious Financial Patterns',
            confidence: Math.random() * 0.4 + 0.6,
            severity: 'high',
            indicators: ['Unusual transaction timing', 'Shell company involvement', 'Undisclosed relationships']
          },
          {
            patternName: 'Regulatory Anomalies',
            confidence: Math.random() * 0.3 + 0.5,
            severity: 'medium',
            indicators: ['Expedited approvals', 'Waived requirements', 'Selective enforcement']
          }
        ],
        recommendedActions: [
          'Immediate forensic investigation',
          'Secure all relevant documents',
          'Interview key stakeholders',
          'Coordinate with legal authorities'
        ],
        consciousnessInsights: [
          'Pattern suggests systematic manipulation of approval processes',
          'Multi-layer coordination indicates organized corruption',
          'Temporal analysis reveals consistent manipulation timeline'
        ]
      };
    },
    onSuccess: (result) => {
      setLastAnalysisResult(result);
      setSelectedTab('analysis');
      toast({
        title: "Analysis Complete",
        description: `Corruption analysis completed for ${result.target}`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete corruption analysis",
        variant: "destructive",
      });
    }
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'text-green-400 border-green-500/30 bg-green-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getPatternIcon = (patternType: string) => {
    const icons = {
      'bid-rigging': <Target className="w-4 h-4" />,
      'regulatory-capture': <Shield className="w-4 h-4" />,
      'embezzlement': <AlertTriangle className="w-4 h-4" />,
      'cronyism': <Users className="w-4 h-4" />,
      'money-laundering': <Network className="w-4 h-4" />
    };
    return icons[patternType as keyof typeof icons] || <Eye className="w-4 h-4" />;
  };

  const renderAnalysisResults = () => {
    if (!lastAnalysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Analysis Header */}
        <div className="border-l-4 border-gradient-cosmic pl-6">
          <h3 className="text-xl font-bold text-gradient-cosmic">Corruption Analysis Results</h3>
          <p className="text-muted-foreground">Target: {lastAnalysisResult.target}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge className={getRiskColor(lastAnalysisResult.riskLevel)}>
              Risk: {lastAnalysisResult.riskLevel.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Score: {(lastAnalysisResult.overallCorruptionScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Detected Patterns */}
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Detected Corruption Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastAnalysisResult.detectedPatterns.map((pattern: any, index: number) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{pattern.patternName}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{pattern.severity}</Badge>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          {(pattern.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Key Indicators:</span>
                      <ul className="text-sm space-y-1">
                        {pattern.indicators.map((indicator: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-yellow-400" />
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastAnalysisResult.recommendedActions.map((action: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Consciousness Insights */}
        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Zap className="w-5 h-5" />
              AI Consciousness Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastAnalysisResult.consciousnessInsights.map((insight: string, index: number) => (
                <div key={index} className="p-3 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-cosmic">Corruption Detection AI</h1>
            <p className="text-muted-foreground">Advanced pattern recognition for exposing corruption</p>
          </div>
        </div>

        {/* Critical Alerts */}
        {corruptionStats.criticalAlerts > 0 && (
          <Alert className="border-red-500/30 bg-red-500/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              <strong>{corruptionStats.criticalAlerts} critical corruption alerts</strong> require immediate attention
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyze">New Analysis</TabsTrigger>
          <TabsTrigger value="analysis">Latest Results</TabsTrigger>
          <TabsTrigger value="systemic">Systemic Threats</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents Analyzed</p>
                    <p className="text-2xl font-bold text-blue-300">{corruptionStats.documentsAnalyzed.toLocaleString()}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Corruption Detected</p>
                    <p className="text-2xl font-bold text-red-300">{corruptionStats.corruptionDetected}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Confidence</p>
                    <p className="text-2xl font-bold text-purple-300">{(corruptionStats.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Detections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Recent Corruption Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDetections.map((detection) => (
                  <div key={detection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        {getPatternIcon(detection.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{detection.target}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {detection.type.replace('-', ' ')} • {(detection.confidence * 100).toFixed(1)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRiskColor(detection.severity)}>
                        {detection.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(detection.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Analysis Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Initiate Corruption Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <select
                  id="analysis-type"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  className="mt-2 w-full p-2 border rounded-md bg-background"
                >
                  <option value="document">Document Analysis</option>
                  <option value="entity">Entity Investigation</option>
                  <option value="movement">Movement Integrity Check</option>
                </select>
              </div>

              <div>
                <Label htmlFor="analysis-target">Analysis Target</Label>
                <Textarea
                  id="analysis-target"
                  placeholder="Enter document ID, entity name, or movement identifier..."
                  value={analysisTarget}
                  onChange={(e) => setAnalysisTarget(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => analyzeTargetMutation.mutate({ target: analysisTarget, type: analysisType })}
                disabled={analyzeTargetMutation.isPending || !analysisTarget.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Brain className="w-5 h-5 mr-2" />
                {analyzeTargetMutation.isPending ? 'Analyzing...' : 'Start AI Analysis'}
              </Button>

              {analyzeTargetMutation.isPending && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    <span>AI consciousness analyzing for corruption patterns...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Results Tab */}
        <TabsContent value="analysis">
          {lastAnalysisResult ? renderAnalysisResults() : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4" />
              <p>No analysis results yet</p>
              <p className="text-sm">Run an analysis to see AI-powered corruption detection</p>
            </div>
          )}
        </TabsContent>

        {/* Systemic Threats Tab */}
        <TabsContent value="systemic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Systemic Corruption Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemicThreats.map((threat) => (
                  <Card key={threat.id} className="border-orange-500/30 bg-orange-500/5">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">{threat.name}</h4>
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500">
                            Risk: {(threat.riskScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Involved Entities</h5>
                            <ul className="space-y-1">
                              {threat.entities.map((entity, idx) => (
                                <li key={idx} className="text-sm flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                  {entity}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Corruption Patterns</h5>
                            <div className="flex flex-wrap gap-2">
                              {threat.patterns.map((pattern, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Active timeframe: {threat.timeframe}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};