import { DeveloperFunding } from '@/components/DeveloperFunding';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Funding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Development Funding</h1>
            <p className="text-gray-300">Support the future of decentralized resistance</p>
          </div>
        </div>

        {/* Funding Component */}
        <DeveloperFunding />
      </div>
    </div>
  );
}
