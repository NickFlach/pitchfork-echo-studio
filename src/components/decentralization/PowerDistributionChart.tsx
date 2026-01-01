import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Community', value: 35, color: 'hsl(270, 91%, 65%)' },
  { name: 'Core Team', value: 15, color: 'hsl(315, 100%, 70%)' },
  { name: 'Treasury', value: 20, color: 'hsl(260, 100%, 80%)' },
  { name: 'Delegates', value: 18, color: 'hsl(200, 80%, 60%)' },
  { name: 'Ecosystem', value: 12, color: 'hsl(150, 70%, 50%)' },
];

export const PowerDistributionChart: React.FC = () => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Power Distribution</CardTitle>
        <CardDescription>
          Voting power allocation across stakeholder groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(240, 10%, 10%)',
                  border: '1px solid hsl(240, 3.7%, 15.9%)',
                  borderRadius: '8px',
                  color: 'hsl(0, 0%, 98%)'
                }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
              <Legend 
                wrapperStyle={{ color: 'hsl(240, 5%, 64.9%)' }}
                formatter={(value) => <span style={{ color: 'hsl(240, 5%, 64.9%)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
