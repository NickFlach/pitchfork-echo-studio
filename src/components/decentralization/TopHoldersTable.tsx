import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const topHolders = [
  { 
    address: '0x1234...5678', 
    label: 'Treasury',
    balance: 15000000,
    percentage: 4.2,
    delegated: 8500000,
    type: 'protocol'
  },
  { 
    address: '0x2345...6789', 
    label: 'Ecosystem Fund',
    balance: 12000000,
    percentage: 3.4,
    delegated: 0,
    type: 'protocol'
  },
  { 
    address: '0x3456...7890', 
    label: 'Community DAO',
    balance: 8500000,
    percentage: 2.4,
    delegated: 6200000,
    type: 'dao'
  },
  { 
    address: '0x4567...8901', 
    label: 'Core Team Vesting',
    balance: 7200000,
    percentage: 2.0,
    delegated: 0,
    type: 'team'
  },
  { 
    address: '0x5678...9012', 
    label: 'Delegate Pool A',
    balance: 5800000,
    percentage: 1.6,
    delegated: 5800000,
    type: 'delegate'
  },
  { 
    address: '0x6789...0123', 
    label: 'Anonymous Whale',
    balance: 5200000,
    percentage: 1.5,
    delegated: 2100000,
    type: 'individual'
  },
  { 
    address: '0x7890...1234', 
    label: 'Delegate Pool B',
    balance: 4800000,
    percentage: 1.4,
    delegated: 4800000,
    type: 'delegate'
  },
  { 
    address: '0x8901...2345', 
    label: 'Liquidity Provider',
    balance: 4200000,
    percentage: 1.2,
    delegated: 0,
    type: 'liquidity'
  },
  { 
    address: '0x9012...3456', 
    label: 'Early Contributor',
    balance: 3800000,
    percentage: 1.1,
    delegated: 3800000,
    type: 'individual'
  },
  { 
    address: '0x0123...4567', 
    label: 'Development Fund',
    balance: 3500000,
    percentage: 1.0,
    delegated: 0,
    type: 'protocol'
  },
];

const typeColors: Record<string, string> = {
  protocol: 'bg-primary/20 text-primary border-primary/30',
  dao: 'bg-green-500/20 text-green-400 border-green-500/30',
  team: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  delegate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  individual: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  liquidity: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export const TopHoldersTable: React.FC = () => {
  const totalTopHolding = topHolders.reduce((sum, h) => sum + h.percentage, 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top Token Holders</CardTitle>
            <CardDescription>
              Largest gPFORK holders and their delegation status
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Top 10 Total</p>
            <p className="text-xl font-bold">{totalTopHolding.toFixed(1)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Address</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Share</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Concentration</th>
              </tr>
            </thead>
            <tbody>
              {topHolders.map((holder, index) => (
                <tr key={holder.address} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="text-sm font-mono">{holder.address}</p>
                      <p className="text-xs text-muted-foreground">{holder.label}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={typeColors[holder.type]}>
                      {holder.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <p className="text-sm font-medium">{(holder.balance / 1000000).toFixed(1)}M</p>
                    {holder.delegated > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(holder.delegated / 1000000).toFixed(1)}M delegated
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-sm font-bold">{holder.percentage}%</span>
                  </td>
                  <td className="py-3 px-2 w-32">
                    <Progress 
                      value={holder.percentage * 20} 
                      className="h-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Concentration Health</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              Healthy
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No single entity exceeds the 5% threshold. Top 10 holders control {totalTopHolding.toFixed(1)}% of supply, 
            below the 30% warning threshold.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
