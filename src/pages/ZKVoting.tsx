import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isAddress, getAddress } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Vote, Download, Upload, Copy, RefreshCw, Wallet, Plus } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeb3 } from '@/hooks/useWeb3';
import { ZK_CHAIN, votingContract, checkVotingContract, deployZKVoting, requireNeoX, vaultKey, readBallot, saveBallot, downloadBallot, prepareBallot, type BallotBackup } from '@/lib/zkVoting';
import { resolveVotingAddress, ZK_CONTRACT_BOOKMARK } from '@/lib/zkGovernance';

export default function ZKVoting() {
  const wallet = useWeb3(); const [params, setParams] = useSearchParams();
  const address = resolveVotingAddress(params.get('contract'), localStorage.getItem(ZK_CONTRACT_BOOKMARK)); const selectedId = params.get('proposal') || '1';
  const [inputAddress, setInputAddress] = useState(address);
  const [busy, setBusy] = useState(''); const [error, setError] = useState(''); const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState(''); const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [voters, setVoters] = useState('');
  const [registrationMinutes, setRegistrationMinutes] = useState(60); const [commitMinutes, setCommitMinutes] = useState(60); const [revealMinutes, setRevealMinutes] = useState(60); const [quorum, setQuorum] = useState(1);
  const [choice, setChoice] = useState(0); const [backup, setBackup] = useState<BallotBackup | null>(null);
  const key = address && wallet.account ? vaultKey(address, selectedId, wallet.account) : '';
  useEffect(() => { setBackup(key ? readBallot(key) : null); setTxHash(''); }, [key]);
  useEffect(() => { if (query.data && address) localStorage.setItem(ZK_CONTRACT_BOOKMARK, address); }, [query.data, address]);
  const query = useQuery({
    queryKey: ['zk-live', address, selectedId, wallet.account], enabled: isAddress(address), refetchInterval: 15000, retry: 1,
    queryFn: async () => {
      const contract = await checkVotingContract(address); const count = Number(await contract.proposalCount());
      const block = await contract.runner?.provider?.getBlock('latest');
      const proposals = await Promise.all(Array.from({ length: Math.min(count, 50) }, (_, i) => contract.getProposal(count - i).then(p => ({ id: String(count - i), title: String(p.title) }))));
      if (count === 0) return { proposals, proposal: null, members: [], eligible: false, registered: false, timestamp: block?.timestamp || 0 };
      if (!/^\d+$/.test(selectedId) || BigInt(selectedId) < 1n || BigInt(selectedId) > BigInt(count)) throw new Error('Proposal not found.');
      const [p, members, eligible, registered] = await Promise.all([contract.getProposal(selectedId), contract.getMembers(selectedId), wallet.account ? contract.eligible(selectedId, wallet.account) : false, wallet.account ? contract.registered(selectedId, wallet.account) : false]);
      // Ethers Result named properties disappear under query structural sharing; use a plain object.
      return { proposals, proposal: p.toObject(), members: [...members], eligible, registered, timestamp: block?.timestamp || 0 };
    }
  });
  const p = query.data?.proposal; const now = query.data?.timestamp || 0;
  const phase = !p ? '' : p.tallied ? 'Final result' : now < Number(p.registrationEnd) ? 'Registration' : now < Number(p.commitEnd) ? 'Commit' : now < Number(p.revealEnd) ? 'Reveal' : 'Ready to tally';
  const ready = wallet.isConnected && wallet.chainId === ZK_CHAIN && !busy;
  const ballotQuery = useQuery({ queryKey: ['zk-ballot', address, selectedId, backup?.nullifier, txHash], enabled: !!backup?.nullifier && !!p,
    refetchInterval: 15000, queryFn: async () => { const c = votingContract(address); return { commitment: String(await c.commitments(selectedId, backup?.nullifier)), revealed: Boolean(await c.revealed(selectedId, backup?.nullifier)) }; }
  });
  const committed = ballotQuery.data?.commitment !== undefined && ballotQuery.data.commitment !== '0';
  async function run(action: () => Promise<void>) { setError(''); setStatus(''); setBusy('Waiting for wallet…'); try { await action(); await query.refetch(); await ballotQuery.refetch(); } catch (e) { setError(e instanceof Error ? e.message : 'Transaction failed.'); } finally { setBusy(''); } }
  async function transact(method: string, args: unknown[]) {
    if (!wallet.signer) throw new Error('Connect your wallet.'); await requireNeoX(wallet.signer);
    const tx = await votingContract(address, wallet.signer)[method](...args); setTxHash(tx.hash); setBusy('Waiting for on-chain confirmation…');
    const receipt = await tx.wait(); if (!receipt || receipt.status !== 1) throw new Error('Transaction did not succeed.'); setStatus('Transaction confirmed on Neo X.'); return receipt;
  }
  function persist(value: BallotBackup) { if (!key) throw new Error('Connect your wallet first.'); saveBallot(key, value); setBackup(value); }
  const attach = () => run(async () => { await checkVotingContract(inputAddress); setParams({ contract: getAddress(inputAddress), proposal: '1' }); });
  const register = () => run(async () => {
    const { Identity } = await import('@semaphore-protocol/identity');
    const b: BallotBackup = backup || { version: 1, chainId: ZK_CHAIN, contract: address, proposalId: selectedId, identity: new Identity().export() };
    persist(b); downloadBallot(b); await transact('register', [selectedId, Identity.import(b.identity).commitment]);
  });
  const commit = () => run(async () => {
    if (!backup) throw new Error('Restore your private identity backup.');
    if (committed) throw new Error('Your ballot is already committed.');
    setBusy('Generating zero-knowledge proof…');
    const prepared = await prepareBallot(votingContract(address), selectedId, backup, choice);
    persist(prepared.backup); downloadBallot(prepared.backup); await transact('commit', [selectedId, prepared.proof]);
  });
  const reveal = () => run(async () => {
    if (!backup?.nullifier || !backup.salt || backup.choice === undefined) throw new Error('Restore your ballot backup.');
    await transact('reveal', [selectedId, backup.nullifier, backup.choice, backup.salt]);
  });
  const create = () => run(async () => {
    const electorate = voters.split(/[\s,]+/).filter(Boolean).map(a => getAddress(a));
    if (electorate.length < 3 || electorate.length > 100 || new Set(electorate).size !== electorate.length) throw new Error('Provide 3–100 unique eligible wallet addresses.');
    const durations = [registrationMinutes, commitMinutes, revealMinutes];
    if (durations.some(n => !Number.isInteger(n) || n < 1 || n > 43200)) throw new Error('Each phase must be 1–43200 whole minutes.');
    const receipt = await transact('createProposal', [title, description, electorate, ...durations.map(n => n * 60), quorum]);
    const c = votingContract(address); let createdId = '';
    for (const log of receipt.logs) { try { const event = c.interface.parseLog(log); if (event?.name === 'ProposalCreated') createdId = String(event.args.proposalId); } catch { /* Other contracts' logs. */ } }
    if (createdId) setParams({ contract: address, proposal: createdId }); setShowCreate(false);
  });
  return <div className="min-h-screen bg-background"><Navigation /><div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
    <header className="space-y-3"><div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-6 w-6" /><Badge variant="outline">Neo X · 47763</Badge></div><h1 className="text-3xl font-bold">ZK Voting</h1>
      <p className="text-muted-foreground">Verified group membership. Sealed ballots until reveal. On-chain results.</p>
      <p className="text-sm text-muted-foreground">Registration and transaction senders are public. Revealed choices are public; using the same wallet can link them to you. This is not coercion-resistant or fully anonymous voting. No treasury transactions are executed.</p>
      {!wallet.isConnected ? <Button onClick={() => run(() => wallet.connectWallet())}><Wallet className="mr-2 h-4 w-4" />Connect wallet</Button> : wallet.chainId !== ZK_CHAIN ? <Button onClick={() => run(() => wallet.switchNetwork(ZK_CHAIN))}>Switch to Neo X</Button> : <Badge variant="secondary">Wallet connected</Badge>}
    </header>
    {(error || query.error) && <p role="alert" className="border border-destructive text-destructive rounded-md p-3 break-words">{error || (query.error as Error).message}</p>}
    {(busy || status) && <p role="status" className="text-sm text-primary">{busy || status}</p>}
    {txHash && <a className="text-sm text-primary underline break-all" href={`https://xexplorer.neo.org/tx/${txHash}`} target="_blank" rel="noreferrer">View confirmed or pending transaction ↗</a>}
    <section className="space-y-3 border-y py-6"><Label htmlFor="zk-contract">Voting contract</Label><div className="flex flex-col sm:flex-row gap-2"><Input id="zk-contract" placeholder="0x…" value={inputAddress} onChange={e => setInputAddress(e.target.value)} /><Button variant="outline" disabled={!!busy || !isAddress(inputAddress)} onClick={attach}>Open contract</Button></div>
      {!address && <><p className="text-sm text-muted-foreground">No shared Neo X deployment is configured. Deployment requires four wallet approvals and GAS. Contracts have not been independently audited.</p><Button disabled={!ready} variant="outline" onClick={() => run(async () => { if (!wallet.signer) return; const deployed = await deployZKVoting(wallet.signer, setBusy); setInputAddress(deployed); setParams({ contract: deployed, proposal: '1' }); setShowCreate(true); setStatus('Voting contracts deployed. Create the first proposal.'); })}>Deploy voting contracts</Button></>}
    </section>
    {query.isFetching && !query.data && <p className="text-muted-foreground">Reading Neo X…</p>}
    {query.data && <><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">On-chain proposals</h2><div className="flex gap-2"><Button title="Refresh chain state" aria-label="Refresh chain state" variant="ghost" size="icon" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" /></Button><Button disabled={!ready} onClick={() => setShowCreate(!showCreate)}><Plus className="mr-2 h-4 w-4" />Create proposal</Button></div></div>
      {query.data.proposals.length === 0 && <p className="text-muted-foreground">No proposal has been created on this contract yet.</p>}
      <div className="flex flex-wrap gap-2">{query.data.proposals.map(item => <Button className="h-auto whitespace-normal text-left max-w-full" key={item.id} variant={selectedId === item.id ? 'secondary' : 'outline'} onClick={() => setParams({ contract: address, proposal: item.id })}>#{item.id} · {item.title}</Button>)}</div>
    </>}
    {showCreate && query.data && <section className="space-y-4 border-y py-6"><h2 className="text-xl font-semibold">Create an on-chain proposal</h2><Label htmlFor="zk-title">Title</Label><Input id="zk-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} /><Label htmlFor="zk-description">Description</Label><Textarea id="zk-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={4000} /><Label htmlFor="zk-voters">Eligible wallet addresses</Label><Textarea id="zk-voters" value={voters} onChange={e => setVoters(e.target.value)} placeholder="One address per line (3–100 unique voters)" />
      <p className="text-sm text-muted-foreground">The creator fixes the electorate at creation. One identity per listed wallet; this is not proof of unique personhood.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[['Registration minutes', registrationMinutes, setRegistrationMinutes], ['Commit minutes', commitMinutes, setCommitMinutes], ['Reveal minutes', revealMinutes, setRevealMinutes], ['Quorum', quorum, setQuorum]].map(([label, value, setter], i) => <div className="space-y-2" key={String(label)}><Label htmlFor={`zk-duration-${i}`}>{String(label)}</Label><Input id={`zk-duration-${i}`} type="number" min={1} value={Number(value)} onChange={e => (setter as (n: number) => void)(Number(e.target.value))} /></div>)}</div><Button disabled={!ready || title.length < 3 || description.length < 10} onClick={create}>Publish proposal on-chain</Button></section>}
    {p && <><section className="space-y-4"><div className="flex flex-wrap items-center gap-3"><Badge>{phase}</Badge><span className="text-sm text-muted-foreground">Proposal #{selectedId}</span><Button title="Copy proposal link" aria-label="Copy proposal link" variant="ghost" size="icon" onClick={() => run(async () => { await navigator.clipboard.writeText(window.location.href); setStatus('Proposal link copied.'); })}><Copy className="h-4 w-4" /></Button></div><h2 className="text-2xl font-bold break-words">{String(p.title)}</h2><p className="whitespace-pre-wrap break-words text-muted-foreground">{String(p.description)}</p><div className="grid sm:grid-cols-3 gap-4 text-sm">{[['Registration closes', p.registrationEnd], ['Commit closes', p.commitEnd], ['Reveal closes', p.revealEnd]].map(([label, value]) => <div key={String(label)}><p className="text-muted-foreground">{String(label)}</p><time>{new Date(Number(value) * 1000).toLocaleString()}</time></div>)}</div></section>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y py-5">{[['Registered', query.data?.members.length || 0], ['Committed', p.committed], ['Revealed', p.revealed], ['Quorum', p.quorum]].map(([label, value]) => <div key={String(label)}><p className="text-2xl font-semibold">{String(value)}</p><p className="text-sm text-muted-foreground">{String(label)}</p></div>)}</div>
      <Card><CardHeader><CardTitle className="flex gap-2 items-center"><Vote className="h-5 w-5" />Your ballot</CardTitle></CardHeader><CardContent className="space-y-4">
        {phase === 'Registration' && <><p className="text-sm text-muted-foreground">{query.data?.registered ? 'Your private identity is registered.' : query.data?.eligible ? 'Your wallet is eligible to register.' : 'This wallet is not in the fixed electorate.'}</p><Button disabled={!ready || !query.data?.eligible || query.data.registered} onClick={register}>Register private identity</Button></>}
        {phase === 'Commit' && <><div className="flex flex-wrap gap-2">{['For', 'Against', 'Abstain'].map((label, i) => <Button key={label} variant={choice === i ? 'secondary' : 'outline'} disabled={committed || !!busy} onClick={() => setChoice(i)}>{label}</Button>)}</div><Button disabled={!ready || !backup || committed || (query.data?.members.length || 0) < 3} onClick={commit}>{committed ? 'Ballot committed' : 'Prove membership & commit vote'}</Button><p className="text-sm text-muted-foreground">At least three registered identities are required. Keep the downloaded ballot secret for reveal.</p></>}
        {phase === 'Reveal' && <><p className="text-sm">{ballotQuery.data?.revealed ? 'Your vote has been revealed.' : backup?.choice !== undefined ? `Your sealed choice: ${['For', 'Against', 'Abstain'][backup.choice]}` : 'Restore your committed ballot to reveal.'}</p><Button disabled={!ready || !committed || ballotQuery.data?.revealed} onClick={reveal}>Reveal vote on-chain</Button></>}
        {phase === 'Ready to tally' && <Button disabled={!ready} onClick={() => run(async () => { await transact('tally', [selectedId]); })}>Finalize tally on-chain</Button>}
        {phase === 'Final result' && <Badge variant={p.passed ? 'default' : 'secondary'}>{p.passed ? 'Passed' : 'Not passed'}</Badge>}
        <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!backup} onClick={() => backup && downloadBallot(backup)}><Download className="h-4 w-4 mr-2" />Export private backup</Button><Button variant="outline" disabled={!wallet.account || !!busy} onClick={() => document.getElementById('zk-backup-import')?.click()}><Upload className="h-4 w-4 mr-2" />Restore backup</Button><input id="zk-backup-import" aria-label="Restore private ballot backup" type="file" accept="application/json" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; void run(async () => { const b = JSON.parse(await file.text()) as BallotBackup; if (b.version !== 1 || b.chainId !== ZK_CHAIN || b.contract.toLowerCase() !== address.toLowerCase() || b.proposalId !== selectedId || typeof b.identity !== 'string') throw new Error('Backup belongs to a different contract or proposal.'); const { Identity } = await import('@semaphore-protocol/identity'); const identity = Identity.import(b.identity); if (query.data?.members.length && !query.data.members.some((m: bigint) => m === identity.commitment)) throw new Error('Backup identity is not registered in this proposal.'); if (b.nullifier && b.salt && b.choice !== undefined) { if (b.choice < 0 || b.choice > 2) throw new Error('Invalid ballot choice.'); const c = votingContract(address); const expected = String(await c.ballotCommitment(selectedId, b.nullifier, b.choice, b.salt)); const stored = String(await c.commitments(selectedId, b.nullifier)); if (stored !== '0' && stored !== expected) throw new Error('Backup does not match the on-chain ballot.'); } persist(b); setStatus('Private backup restored.'); }); e.target.value = ''; }} /></div>
        <p className="text-xs text-muted-foreground">Private identity and ballot secrets stay on this device and in your backup, never in Lovable Cloud. Anyone with the backup can reveal your vote. Losing it prevents reveal.</p>
      </CardContent></Card>
      <section className="space-y-3"><h2 className="text-xl font-semibold">{p.tallied ? 'Final tally' : 'Revealed votes'}</h2><div className="grid grid-cols-3 gap-4">{[['For', p.forVotes], ['Against', p.againstVotes], ['Abstain', p.abstainVotes]].map(([label, value]) => <div className="border rounded-md p-4" key={String(label)}><p className="text-2xl font-semibold">{String(value)}</p><p className="text-sm text-muted-foreground">{String(label)}</p></div>)}</div><p className="text-sm text-muted-foreground">Unrevealed: {String(p.committed - p.revealed)}. Passing requires revealed quorum and more For than Against votes. Ties do not pass.</p></section>
    </>}
  </div></div>;
}