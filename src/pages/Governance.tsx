import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'ethers';
import { ShieldCheck, RefreshCw, ArrowRight, Plus } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProposalAnalyzer } from '@/components/governance/AIProposalAnalyzer';
import { readGovernanceProposals } from '@/lib/zkVoting';
import { resolveVotingAddress, ZK_CONTRACT_BOOKMARK, proposalPhase, zkProposalLink } from '@/lib/zkGovernance';

export default function Governance() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const address = resolveVotingAddress(params.get('contract'), localStorage.getItem(ZK_CONTRACT_BOOKMARK));
  const draft = location.state as { title?: string; description?: string } | null;
  const [input, setInput] = useState(address);
  const [page, setPage] = useState(0);
  const tab = params.get('tab') || 'proposals';
  const query = useQuery({
    queryKey: ['zk-governance', address, page], enabled: !!address, retry: 1, refetchInterval: 15000,
    queryFn: async () => {
      const data = await readGovernanceProposals(address, page);
      localStorage.setItem(ZK_CONTRACT_BOOKMARK, address);
      return data;
    },
  });
  const setTab = (value: string) => setParams(previous => {
    const next = new URLSearchParams(previous); next.set('tab', value); return next;
  });
  const proposals = query.data?.proposals || [];
  const filtered = proposals.filter(p => tab === 'history' ? p.tallied : !p.tallied);
  return <div className="min-h-screen bg-background"><Navigation />
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-3"><Badge variant="outline"><ShieldCheck className="mr-2 h-4 w-4" />Neo X Mainnet · 47763</Badge>
        <h1 className="text-3xl font-bold">DAO Governance</h1>
        <p className="text-muted-foreground">On-chain ZK proposals, sealed ballots, and verified results.</p>
      </header>
      <section className="space-y-3 border-y py-5">
        <Label htmlFor="governance-contract">ZK voting contract</Label>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={event => {
          event.preventDefault(); if (!isAddress(input)) return;
          setPage(0); setParams(previous => { const next = new URLSearchParams(previous); next.set('contract', input); return next; });
        }}><Input id="governance-contract" value={input} onChange={e => setInput(e.target.value)} placeholder="0x…" />
          <Button variant="outline" type="submit" disabled={!isAddress(input)}>Open contract</Button>
          <Button variant="ghost" size="icon" type="button" aria-label="Refresh on-chain proposals" disabled={!address || query.isFetching} onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" /></Button>
        </form>
        {!address && <div className="space-y-3"><p className="text-muted-foreground">No shared Neo X voting contract is configured. Deploy with your funded wallet or open an existing contract.</p>
          <Button asChild><Link to="/zk-voting">Deploy from ZK Voting<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>}
        {query.data && <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground"><a className="underline break-all" href={`https://xexplorer.neo.org/address/${address}`} target="_blank" rel="noreferrer">{address}</a><span>Block {query.data.blockNumber} · {query.data.count} proposals</span></div>}
        {query.error && <p role="alert" className="text-destructive break-words">{query.error instanceof Error ? query.error.message : 'Unable to read Neo X.'}</p>}
      </section>
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="proposals">Active Proposals</TabsTrigger><TabsTrigger value="history">Voting History</TabsTrigger><TabsTrigger value="create">Create Proposal</TabsTrigger><TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>
        {['proposals', 'history'].map(value => <TabsContent key={value} value={value} className="space-y-4">
          {query.isPending && address && <p role="status" className="text-muted-foreground">Reading proposals from Neo X…</p>}
          {query.data && filtered.length === 0 && <p className="text-muted-foreground">{value === 'history' ? 'No finalized proposals on this page.' : 'No active proposals on this page.'}</p>}
          {filtered.map(p => <Card key={p.id}><CardHeader className="space-y-3"><div className="flex flex-wrap gap-2"><Badge variant={p.tallied ? 'secondary' : 'outline'}>{proposalPhase(p, query.data?.timestamp || 0)}</Badge><span className="text-sm text-muted-foreground">Proposal #{p.id}</span></div><CardTitle className="break-words">{p.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-muted-foreground whitespace-pre-wrap break-words">{p.description}</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">{[['Committed', p.committed], ['Revealed', p.revealed], ['Quorum', p.quorum], ['Reveal closes', new Date(Number(p.revealEnd) * 1000).toLocaleString()]].map(([label, amount]) => <div key={String(label)}><dt className="text-muted-foreground">{String(label)}</dt><dd>{String(amount)}</dd></div>)}</dl>
              <div className="flex flex-wrap gap-4 text-sm"><span>For: {String(p.forVotes)}</span><span>Against: {String(p.againstVotes)}</span><span>Abstain: {String(p.abstainVotes)}</span></div>
              <Button asChild variant="outline"><Link to={zkProposalLink(address, p.id)}>{p.tallied ? 'View final tally' : 'Open ballot'}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </CardContent></Card>)}
          {query.data && query.data.count > 20 && <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Newer</Button><span className="text-sm text-muted-foreground">Page {page + 1} of {Math.ceil(query.data.count / 20)}</span><Button variant="outline" disabled={(page + 1) * 20 >= query.data.count} onClick={() => setPage(p => p + 1)}>Older</Button></div>}
        </TabsContent>)}
        <TabsContent value="create" className="space-y-4"><h2 className="text-xl font-semibold">Create a proposal</h2>
          <div className="flex flex-wrap gap-3"><Button asChild disabled={!!address && !query.data}><Link to={address ? zkProposalLink(address) + '&create=1' : '/zk-voting'}><Plus className="mr-2 h-4 w-4" />Create on-chain proposal</Link></Button><Button asChild variant="outline"><Link to="/proposals/new">Draft for AI analysis</Link></Button></div>
        </TabsContent>
        <TabsContent value="ai" className="space-y-4"><div className="flex justify-end"><Button asChild variant="outline" size="sm"><Link to="/proposals/new">Submit new proposal</Link></Button></div><AIProposalAnalyzer key={draft?.title ?? 'blank'} initialTitle={draft?.title} initialDescription={draft?.description} /></TabsContent>
      </Tabs>
    </main>
  </div>;
}
