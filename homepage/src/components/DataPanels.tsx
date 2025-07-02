
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DataPanels = () => {
  const networkData = [
    { time: '00:00', value: 45 },
    { time: '00:15', value: 67 },
    { time: '00:30', value: 23 },
    { time: '00:45', value: 89 },
    { time: '01:00', value: 56 },
    { time: '01:15', value: 78 },
  ];

  const systemData = [
    { name: 'CPU', value: 78 },
    { name: 'MEM', value: 45 },
    { name: 'NET', value: 92 },
    { name: 'IO', value: 34 },
  ];

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-cyber text-cyber-yellow text-center mb-12 glitch-text" data-text="METAL.CORE.ANALYSIS">
          METAL.CORE.ANALYSIS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Activity Chart */}
          <Card className="cyber-panel p-6 col-span-1 lg:col-span-2">
            <h3 className="text-cyber-yellow font-mono text-lg mb-4">METAL.PROCESSING.ACTIVITY</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#00bfff', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#00bfff', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ffd700" 
                    strokeWidth={2}
                    dot={{ fill: '#ffd700', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00bfff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-xs font-mono">
              <span className="text-cyber-blue">UNITS.PROCESSED: 2,847,392</span>
              <span className="text-cyber-yellow">STATUS: OPTIMAL</span>
            </div>
          </Card>

          {/* System Monitor */}
          <Card className="cyber-panel p-6">
            <h3 className="text-cyber-yellow font-mono text-lg mb-4">SYSTEM.MONITOR</h3>
            <div className="space-y-4">
              {systemData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-cyber-blue text-sm font-mono">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-cyber-dark border border-cyber-blue/30 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyber-yellow to-cyber-blue transition-all duration-1000"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-cyber-yellow text-xs font-mono w-8">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Security Status */}
          <Card className="cyber-panel p-6">
            <h3 className="text-cyber-yellow font-mono text-lg mb-4">SECURITY.STATUS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue text-sm">FIREWALL</span>
                <span className="text-cyber-yellow text-sm">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue text-sm">ENCRYPTION</span>
                <span className="text-cyber-yellow text-sm">256-BIT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue text-sm">INTRUSION</span>
                <span className="text-cyber-yellow text-sm">BLOCKED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue text-sm">ACCESS.LVL</span>
                <span className="text-cyber-yellow text-sm">ADMIN</span>
              </div>
            </div>
          </Card>

          {/* Data Stream */}
          <Card className="cyber-panel p-6 col-span-1 lg:col-span-2">
            <h3 className="text-cyber-yellow font-mono text-lg mb-4">METAL.STREAM.ANALYSIS</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={systemData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#00bfff', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#00bfff', fontSize: 12 }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#gradient)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="100%" stopColor="#00bfff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DataPanels;
