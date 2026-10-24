import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

const MAX = 4000;

const NewProposal = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');

  const combined = details.trim() ? `${description.trim()}\n\nDetails:\n${details.trim()}` : description.trim();
  const valid = title.trim().length >= 3 && description.trim().length >= 10 && combined.length <= MAX;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    navigate('/governance?tab=ai', { state: { title: title.trim(), description: combined } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Submit a proposal</h1>
            <CardDescription>Your proposal opens in the AI Assistant for analysis, saving, and advisory voting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-title">Title</Label>
                <Input id="p-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fund community grants" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should change and why?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-details">Details (optional)</Label>
                <Textarea id="p-details" rows={6} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Budget, timeline, implementation steps, risks..." />
              </div>
              <p className={`text-xs ${combined.length > MAX ? 'text-destructive' : 'text-muted-foreground'}`}>{combined.length}/{MAX} characters</p>
              <Button type="submit" disabled={!valid} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" /> Continue to AI Assistant
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewProposal;
