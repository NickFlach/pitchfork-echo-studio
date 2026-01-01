import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BalanceOfPowerTriangle: React.FC = () => {
  // Power distribution values (should sum to 100)
  const governance = 42; // "Big Government" equivalent
  const market = 35;     // "Big Business" equivalent  
  const community = 23;  // "Big Mob" / civil society equivalent

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Balance of Power</CardTitle>
        <CardDescription>
          Distribution across governance, market, and community forces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[280px] flex items-center justify-center">
          {/* Triangle SVG */}
          <svg viewBox="0 0 200 180" className="w-full max-w-[300px] h-full">
            {/* Background triangle */}
            <polygon 
              points="100,10 10,170 190,170" 
              fill="none" 
              stroke="hsl(240, 3.7%, 25%)" 
              strokeWidth="1"
            />
            
            {/* Inner filled triangle representing current balance */}
            <polygon 
              points="100,40 40,150 160,150" 
              fill="url(#triangleGradient)" 
              opacity="0.3"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270, 91%, 65%)" />
                <stop offset="50%" stopColor="hsl(315, 100%, 70%)" />
                <stop offset="100%" stopColor="hsl(260, 100%, 80%)" />
              </linearGradient>
            </defs>
            
            {/* Vertex circles */}
            <circle cx="100" cy="10" r="8" fill="hsl(270, 91%, 65%)" className="drop-shadow-lg" />
            <circle cx="10" cy="170" r="8" fill="hsl(315, 100%, 70%)" className="drop-shadow-lg" />
            <circle cx="190" cy="170" r="8" fill="hsl(260, 100%, 80%)" className="drop-shadow-lg" />
            
            {/* Center point showing current balance */}
            <circle cx="100" cy="110" r="6" fill="hsl(0, 0%, 98%)" className="drop-shadow-lg" />
          </svg>
          
          {/* Labels */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm font-medium text-primary">Governance</p>
            <p className="text-lg font-bold">{governance}%</p>
          </div>
          
          <div className="absolute bottom-2 left-4 text-center">
            <p className="text-sm font-medium text-accent">Market</p>
            <p className="text-lg font-bold">{market}%</p>
          </div>
          
          <div className="absolute bottom-2 right-4 text-center">
            <p className="text-sm font-medium" style={{ color: 'hsl(260, 100%, 80%)' }}>Community</p>
            <p className="text-lg font-bold">{community}%</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Balance Status: Stable</p>
          <p>No single force dominates. Current distribution maintains healthy checks and balances between institutional governance, market forces, and community participation.</p>
        </div>
      </CardContent>
    </Card>
  );
};
