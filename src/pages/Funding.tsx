import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeveloperFunding } from '@/components/DeveloperFunding';
import { Navigation } from '@/components/Navigation';

export default function Funding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-cosmic">Development Funding</h1>
            <p className="text-muted-foreground">Support the future of decentralized resistance</p>
          </div>
        </div>

        {/* Funding Component */}
        <DeveloperFunding />
      </div>
    </div>
  );
}
