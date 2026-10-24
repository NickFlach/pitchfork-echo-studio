import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';

interface Analysis {
  summary: string;
  recommendation: 'for' | 'against' | 'abstain';
  confidence: number;
  decentralizationImpact: 'increases' | 'neutral' | 'decreases';
  captureRisk: 'low' | 'medium' | 'high';
  pros: string[];
  cons: string[];
  reasoning: string;
}

export const AIProposalAnalyzer = ({ initialTitle = '', initialDescription = '' }: { initialTitle?: string; initialDescription?: string }) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState('balanced');
  const [risk, setRisk] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const { toast } = useToast();

  const analyze = async () => {
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast({ title: 'Add more detail', description: 'Enter a title and a description of at least 10 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke('analyze-proposal', {
      body: { title, description, priority, risk },
    });
    setLoading(false);
    if (error || data?.error) {
      let msg = typeof data?.error === 'string' ? data.error : 'Analysis failed. Please try again.';
      try {
        const ctx = (error as { context?: Response })?.context;
        if (ctx) { const b = await ctx.json(); if (typeof b?.error === 'string') msg = b.error; }
      } catch { /* ignore */ }
      toast({ title: 'AI analysis unavailable', description: msg, variant: 'destructive' });
      return;
    }
    setResult(data as Analysis);
  };

  const recVariant = result?.recommendation === 'for' ? 'default' : result?.recommendation === 'against' ? 'destructive' : 'secondary';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Voting Assistant</CardTitle>
        <CardDescription>Paste a proposal to get a neutral summary, pros and cons, and a suggested vote based on your priorities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Proposal title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Proposal description" rows={5} value={description} maxLength={4000} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="decentralization">Prioritize decentralization</SelectItem>
              <SelectItem value="treasury">Prioritize treasury</SelectItem>
              <SelectItem value="community">Prioritize community</SelectItem>
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger aria-label="Risk tolerance"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low risk tolerance</SelectItem>
              <SelectItem value="medium">Medium risk tolerance</SelectItem>
              <SelectItem value="high">High risk tolerance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={analyze} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing…</> : 'Analyze proposal'}
        </Button>

        {result && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={recVariant}>Suggested: {result.recommendation}</Badge>
              <Badge variant="outline">Confidence {Math.round(result.confidence)}%</Badge>
              <Badge variant="outline">Decentralization: {result.decentralizationImpact}</Badge>
              <Badge variant="outline">Capture risk: {result.captureRisk}</Badge>
            </div>
            <p className="text-sm">{result.summary}</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><p className="font-medium mb-1">Pros</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{result.pros.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
              <div><p className="font-medium mb-1">Cons</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{result.cons.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            </div>
            <p className="text-xs text-muted-foreground">{result.reasoning}</p>
            <p className="text-xs text-muted-foreground italic">AI suggestions are advisory. You always cast the final vote.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
