import { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { walletRequest, type SavedProposal, type VoteChoice } from '@/lib/proposalHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, History, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

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
  const [history, setHistory] = useState<SavedProposal[]>([]);
  const [selected, setSelected] = useState<SavedProposal | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const { account, signer, chainId } = useWeb3();
  const currentAccount = useRef(account);
  currentAccount.current = account;
  useEffect(() => { setHistory([]); setSelected(null); setResult(null); setHistoryLoaded(false); }, [account]);
  const { toast } = useToast();

  const request = async <T,>(payload: Parameters<typeof walletRequest>[3]): Promise<T> => {
    if (!account || !signer) throw new Error('Connect your wallet first.');
    const wallet = account;
    const response = await walletRequest<T>(wallet, signer, chainId, payload);
    if (currentAccount.current !== wallet) throw new Error('Wallet changed. Please try again.');
    return response;
  };
  const showError = (error: unknown) => toast({ title: 'Request unsuccessful', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
  const loadHistory = async () => {
    setBusy(true);
    try {
      const data = await request<{ proposals: SavedProposal[] }>({ action: 'history' });
      setHistory(data.proposals); setHistoryLoaded(true);
    } catch (error) { showError(error); } finally { setBusy(false); }
  };
  const vote = async (choice: VoteChoice) => {
    if (!selected) return;
    setBusy(true);
    try {
      const { vote: savedVote } = await request<{ vote: { choice: VoteChoice; updated_at: string } }>({ action: 'vote', proposalId: selected.id, choice });
      const updated = { ...selected, ai_proposal_votes: savedVote };
      setSelected(updated); setHistory(items => items.map(p => p.id === updated.id ? updated : p));
      toast({ title: 'Advisory vote saved', description: `Your vote: ${choice}.` });
    } catch (error) { showError(error); } finally { setBusy(false); }
  };

  const analyze = async () => {
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast({ title: 'Add more detail', description: 'Enter a title and a description of at least 10 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    setSelected(null);
    try {
      const data = await request<{ proposal: SavedProposal }>({ action: 'analyze', title, description, priority, risk });
      setResult(data.proposal.analysis); setSelected(data.proposal);
      setHistory(items => [data.proposal, ...items]);
      toast({ title: 'Proposal analysis saved' });
    } catch (error) { showError(error); } finally { setLoading(false); }
  };

  const recVariant = result?.recommendation === 'for' ? 'default' : result?.recommendation === 'against' ? 'destructive' : 'secondary';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Voting Assistant</CardTitle>
        <CardDescription>Paste a proposal to get a neutral summary, pros and cons, and a suggested vote based on your priorities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input aria-label="Proposal title" placeholder="Proposal title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
        <Textarea aria-label="Proposal description" placeholder="Proposal description" rows={5} value={description} maxLength={4000} onChange={(e) => setDescription(e.target.value)} />
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
        <Button onClick={analyze} disabled={loading || busy || !account} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing…</> : 'Analyze proposal'}
        </Button>

        {result && (
          <div className="space-y-3 border-t border-border pt-4">
            {selected && <h3 className="font-semibold break-words">{selected.title}</h3>}
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
            {selected && <div className="space-y-2">
              <p className="text-sm font-medium">Your advisory vote{selected.ai_proposal_votes ? `: ${selected.ai_proposal_votes.choice}` : ''}</p>
              <div className="flex flex-wrap gap-2">
                {([{ choice: 'for', label: 'For', Icon: ThumbsUp }, { choice: 'against', label: 'Against', Icon: ThumbsDown }, { choice: 'abstain', label: 'Abstain', Icon: Minus }] as const).map(({ choice, label, Icon }) => <Button key={choice} disabled={busy || loading} variant={selected.ai_proposal_votes?.choice === choice ? 'default' : 'outline'} aria-pressed={selected.ai_proposal_votes?.choice === choice} onClick={() => vote(choice)}><Icon className="mr-2 h-4 w-4" />{label}</Button>)}
              </div>
              <p className="text-xs text-muted-foreground">Off-chain advisory vote · No governance transaction submitted</p>
            </div>}
          </div>
        )}
        <section className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold">Past analyses</h3>
            <Button variant="outline" disabled={busy || loading || !account} onClick={loadHistory}><History className="h-4 w-4 mr-2" />{busy ? 'Please wait…' : historyLoaded ? 'Refresh history' : 'Load history'}</Button>
          </div>
          {historyLoaded && history.length === 0 && <p className="text-sm text-muted-foreground">No saved analyses yet.</p>}
          <div className="divide-y divide-border">
            {history.map(proposal => <div key={proposal.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-medium break-words">{proposal.title}</p><p className="text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleString()} · Suggested: {proposal.analysis.recommendation}{proposal.ai_proposal_votes ? ` · Your vote: ${proposal.ai_proposal_votes.choice}` : ''}</p></div>
              <Button variant="outline" disabled={busy || loading} onClick={() => { setSelected(proposal); setResult(proposal.analysis); }}>Open</Button>
            </div>)}
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
