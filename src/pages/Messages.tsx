import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUp, MessageCircle, Plus, Search, Send, Wallet, Loader2, RefreshCw } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3, formatAddress } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import { forumCall, forumWrite, ForumPost, ForumWrite } from '@/lib/forum';

function PostMeta({ post }: { post: ForumPost }) {
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span title={post.wallet_address}>{formatAddress(post.wallet_address)}</span><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time></div>;
}

export default function Messages() {
  const { account, signer, chainId, connectWallet, switchNetwork } = useWeb3();
  const { toast } = useToast();
  const cache = useQueryClient();
  const [params, setParams] = useSearchParams();
  const threadId = params.get('thread');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [replyPage, setReplyPage] = useState(0);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  useEffect(() => { const timer = setTimeout(() => { setFilter(search.trim()); setPage(0); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { setReply(''); setReplyPage(0); }, [threadId, account]);
  const wallet = account || undefined;
  const list = useQuery({ queryKey: ['forum', 'list', filter, sort, page, wallet], queryFn: () => forumCall<{ posts: ForumPost[]; total: number }>({ action: 'list', search: filter, sort, offset: page * 20, wallet }), enabled: !threadId, refetchInterval: 30000 });
  const detail = useQuery({ queryKey: ['forum', 'detail', threadId, replyPage, wallet], queryFn: () => forumCall<{ thread: ForumPost; replies: ForumPost[]; total: number }>({ action: 'detail', threadId, offset: replyPage * 50, wallet }), enabled: !!threadId, refetchInterval: 30000 });
  const mutation = useMutation({
    mutationFn: async (payload: ForumWrite) => {
      if (!account || !signer) throw new Error('Connect your wallet to participate.');
      const current = account.toLowerCase();
      const result = await forumWrite<{ post?: ForumPost }>(account, signer, chainId, payload);
      return { result, payload, current };
    },
    onSuccess: ({ result, payload }) => {
      cache.invalidateQueries({ queryKey: ['forum'] });
      if (payload.action === 'thread' && result.post) { setParams({ thread: result.post.id }); setComposing(false); setTitle(''); setBody(''); }
      if (payload.action === 'reply') { setReply(''); setReplyPage(Math.floor((detail.data?.total || 0) / 50)); }
    },
    onError: (error: Error) => toast({ title: 'Forum action not saved', description: error.message, variant: 'destructive' }),
  });
  const ready = !!account && !!signer && chainId === 47763;
  const connecting = async () => { try { if (!account) await connectWallet(); else await switchNetwork(47763); } catch (error) { toast({ title: 'Wallet unavailable', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' }); } };
  const upvote = (post: ForumPost) => <Button variant={post.has_upvoted ? 'secondary' : 'ghost'} size="sm" className="shrink-0 gap-1 min-w-16" aria-label={`${post.has_upvoted ? 'Remove upvote from' : 'Upvote'} ${post.title || 'reply'}`} aria-pressed={post.has_upvoted} title={!ready ? 'Connect a Neo X wallet to upvote' : post.has_upvoted ? 'Remove upvote' : 'Upvote'} disabled={!ready || mutation.isPending} onClick={() => mutation.mutate({ action: 'upvote', postId: post.id, active: !post.has_upvoted })}><ArrowUp className="h-4 w-4" /><span>{post.upvotes}</span></Button>;
  const activeQuery = threadId ? detail : list;
  const thread = detail.data?.thread;
  return <div className="min-h-screen bg-background text-foreground">
    <Navigation />
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 mb-6">
        <div><div className="flex items-center gap-3"><MessageCircle className="h-7 w-7 text-primary" /><h1 className="text-3xl font-bold">Messages</h1></div><p className="text-sm text-muted-foreground mt-2">Community forum · Public discussions</p></div>
        {ready ? <Button onClick={() => setComposing(true)}><Plus className="h-4 w-4 mr-2" />New thread</Button> : <Button onClick={connecting}><Wallet className="h-4 w-4 mr-2" />{account ? 'Switch to Neo X' : 'Connect wallet'}</Button>}
      </header>
      {threadId && <Button variant="ghost" className="mb-4" onClick={() => setParams({})}><ArrowLeft className="h-4 w-4 mr-2" />All threads</Button>}
      {!threadId && <div className="flex flex-wrap gap-3 mb-6"><div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search threads" placeholder="Search threads" value={search} onChange={e => setSearch(e.target.value)} maxLength={200} className="pl-9" /></div><Select value={sort} onValueChange={value => { setSort(value); setPage(0); }}><SelectTrigger aria-label="Sort threads" className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="top">Top upvoted</SelectItem></SelectContent></Select><Button variant="outline" size="icon" aria-label="Refresh forum" title="Refresh forum" onClick={() => activeQuery.refetch()}><RefreshCw className="h-4 w-4" /></Button></div>}
      {activeQuery.isLoading && <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading discussions…</div>}
      {activeQuery.isError && <div role="alert" className="py-8 space-y-4"><p className="text-destructive">{activeQuery.error.message}</p><Button variant="outline" onClick={() => activeQuery.refetch()}>Try again</Button></div>}
      {!threadId && list.data && <>
        <div className="divide-y divide-border border-y border-border">{list.data.posts.map(post => <article key={post.id} className="flex items-start gap-3 py-5">{upvote(post)}<div className="min-w-0 flex-1"><Link to={`/messages?thread=${post.id}`} className="text-lg font-semibold hover:text-primary break-words">{post.title}</Link><p className="mt-2 mb-3 text-sm text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap">{post.body}</p><div className="flex flex-wrap items-center gap-3"><PostMeta post={post} /><Link to={`/messages?thread=${post.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><MessageCircle className="h-3 w-3" />{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</Link></div></div></article>)}</div>
        {!list.data.posts.length && <div className="py-16 text-center"><MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" /><h2 className="text-lg font-semibold">{filter ? 'No matching threads' : 'No discussions yet'}</h2>{ready && !filter && <Button className="mt-4" onClick={() => setComposing(true)}><Plus className="h-4 w-4 mr-2" />New thread</Button>}</div>}
        {list.data.total > 20 && <div className="flex justify-between items-center py-5"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page + 1}</span><Button variant="outline" disabled={(page + 1) * 20 >= list.data.total} onClick={() => setPage(p => p + 1)}>Next</Button></div>}
      </>}
      {threadId && thread && <>
        <article className="border-b border-border pb-7"><h2 className="text-2xl font-semibold break-words mb-3">{thread.title}</h2><PostMeta post={thread} /><p className="whitespace-pre-wrap break-words mt-6 leading-relaxed">{thread.body}</p><div className="mt-4">{upvote(thread)}</div></article>
        <h3 className="text-lg font-semibold mt-7 mb-2">{detail.data?.total || 0} {detail.data?.total === 1 ? 'reply' : 'replies'}</h3>
        <div className="divide-y divide-border">{detail.data?.replies.map(post => <article key={post.id} className="py-5"><PostMeta post={post} /><p className="whitespace-pre-wrap break-words mt-3 mb-3 leading-relaxed">{post.body}</p>{upvote(post)}</article>)}</div>
        {(detail.data?.total || 0) > 50 && <div className="flex items-center justify-between py-4"><Button variant="outline" disabled={!replyPage} onClick={() => setReplyPage(p => p - 1)}>Earlier replies</Button><span className="text-sm">Page {replyPage + 1}</span><Button variant="outline" disabled={(replyPage + 1) * 50 >= (detail.data?.total || 0)} onClick={() => setReplyPage(p => p + 1)}>Later replies</Button></div>}
        <form className="mt-6 border-t border-border pt-6 space-y-3" onSubmit={e => { e.preventDefault(); mutation.mutate({ action: 'reply', threadId, body: reply.trim() }); }}><Label htmlFor="forum-reply">Your reply</Label><Textarea id="forum-reply" value={reply} onChange={e => setReply(e.target.value)} placeholder="Join the discussion…" maxLength={10000} className="min-h-28" disabled={!ready || mutation.isPending} />{ready ? <Button type="submit" disabled={!reply.trim() || mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Post reply</Button> : <Button type="button" onClick={connecting}><Wallet className="h-4 w-4 mr-2" />{account ? 'Switch to Neo X' : 'Connect wallet'}</Button>}</form>
      </>}
      <Dialog open={composing} onOpenChange={open => { if (!mutation.isPending) setComposing(open); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>New thread</DialogTitle><DialogDescription>Public post · Signed with your wallet · No gas fee</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={e => { e.preventDefault(); mutation.mutate({ action: 'thread', title: title.trim(), body: body.trim() }); }}><div className="space-y-2"><Label htmlFor="thread-title">Title</Label><Input id="thread-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} minLength={3} required disabled={mutation.isPending} /></div><div className="space-y-2"><Label htmlFor="thread-body">Discussion</Label><Textarea id="thread-body" value={body} onChange={e => setBody(e.target.value)} maxLength={10000} required className="min-h-40" disabled={mutation.isPending} /></div><Button type="submit" disabled={!ready || title.trim().length < 3 || !body.trim() || mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Publish thread</Button></form></DialogContent></Dialog>
    </main>
  </div>;
}
