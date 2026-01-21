import React from 'react';
import { Navigation } from '@/components/Navigation';
import { ZKVotingDashboard } from '@/components/governance/ZKVotingDashboard';
import { AIVotingAssistant } from '@/components/governance/AIVotingAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Brain, Vote } from 'lucide-react';

const ZKVoting: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-cosmic">
                Private Governance
              </h1>
              <p className="text-muted-foreground">
                ZK-powered voting with AI-assisted decision making
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="voting" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="voting" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Private Voting
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting">
            <ZKVotingDashboard />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIVotingAssistant />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ZKVoting;
