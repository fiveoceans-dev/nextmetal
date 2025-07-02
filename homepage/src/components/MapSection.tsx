
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import WorldMap from './WorldMap';

const MapSection = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 8);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const regions = [
    { name: 'NORTH.AMERICA', nodes: 12, status: 'ACTIVE', activity: 89, health: 95 },
    { name: 'EUROPE', nodes: 18, status: 'ACTIVE', activity: 76, health: 92 },
    { name: 'ASIA.PACIFIC', nodes: 24, status: 'ACTIVE', activity: 94, health: 88 },
    { name: 'SOUTH.AMERICA', nodes: 8, status: 'EXPANDING', activity: 67, health: 85 },
    { name: 'AFRICA', nodes: 6, status: 'DEVELOPING', activity: 45, health: 78 },
    { name: 'OCEANIA', nodes: 4, status: 'PLANNED', activity: 23, health: 65 }
  ];

  const systemMetrics = [
    { name: 'LATENCY', value: 12, unit: 'ms', max: 50 },
    { name: 'BANDWIDTH', value: 2.4, unit: 'K TPS', max: 5 },
    { name: 'TRUST.LVL', value: 97, unit: '%', max: 100 },
    { name: 'NODE.REP', value: 89, unit: '%', max: 100 }
  ];

  const CircularRing = ({ value, max, size = 120, strokeWidth = 8, children }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0, 191, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              cx={size / 2 + radius * Math.cos((i * 30 - 90) * Math.PI / 180)}
              cy={size / 2 + radius * Math.sin((i * 30 - 90) * Math.PI / 180)}
              r="2"
              fill={i <= (value / max) * 12 ? "#ffd700" : "rgba(0, 191, 255, 0.3)"}
            />
          ))}
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#00bfff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 px-4 relative z-10 overflow-hidden">
      <div className="container mx-auto">
        <h2 className="text-3xl font-cyber text-cyber-yellow text-center mb-12 glitch-text" data-text="METAL.NETWORK">
          METAL.NETWORK
        </h2>

        <div className="grid grid-cols-12 gap-4 h-[600px]">
          {/* Circuit Sidebar - Left Panel */}
          <div className="col-span-2 space-y-2">
            <Card className="cyber-panel p-4 h-full relative overflow-hidden">
              <div className="absolute -top-3 left-4 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-yellow">CIRCUIT.MAP</span>
              </div>

              <div className="mt-4 space-y-3">
                {regions.map((region, index) => (
                  <div key={region.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 border-2 ${
                      region.status === 'ACTIVE' ? 'border-cyber-yellow bg-cyber-yellow/20' :
                      region.status === 'EXPANDING' ? 'border-cyber-blue bg-cyber-blue/20' :
                      'border-cyber-blue/50 bg-transparent'
                    } ${animationPhase === index ? 'animate-pulse' : ''}`}
                         style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
                    
                    <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue to-transparent" />
                    <div className="w-2 h-2 bg-cyber-yellow rounded-full opacity-60" />
                  </div>
                ))}

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyber-blue">PWR</span>
                    <div className="w-2 h-2 bg-cyber-yellow rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyber-blue">NET</span>
                    <div className="w-2 h-2 bg-cyber-blue rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyber-blue">SYS</span>
                    <div className="w-2 h-2 bg-cyber-yellow rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Network Visualization with World Map */}
          <div className="col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4 h-48">
              <Card className="cyber-panel p-4 relative overflow-hidden">
                <div className="absolute -top-3 left-6 bg-cyber-dark border border-cyber-blue px-3 py-1"
                     style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                  <span className="text-xs font-mono text-cyber-blue">NODE.ACTIVITY</span>
                </div>

                <div className="flex items-center justify-center h-full">
                  <CircularRing value={72} max={100} size={140}>
                    <div className="text-center">
                      <div className="text-2xl font-cyber text-cyber-yellow">72</div>
                      <div className="text-xs text-cyber-blue">NODES</div>
                    </div>
                  </CircularRing>
                </div>
              </Card>

              <Card className="cyber-panel p-4 relative overflow-hidden">
                <div className="absolute -top-3 left-6 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                     style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                  <span className="text-xs font-mono text-cyber-yellow">SIGNAL.STRENGTH</span>
                </div>

                <div className="flex items-center justify-center h-full">
                  <CircularRing value={94} max={100} size={140}>
                    <div className="text-center">
                      <div className="text-2xl font-cyber text-cyber-blue">94%</div>
                      <div className="text-xs text-cyber-blue">SIGNAL</div>
                    </div>
                  </CircularRing>
                </div>
              </Card>
            </div>

            {/* World Map with Network Propagation */}
            <Card className="cyber-panel p-6 h-80 relative overflow-hidden">
              <div className="absolute -top-3 left-6 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-yellow">GLOBAL.NETWORK</span>
              </div>

              <div className="relative h-full mt-4">
                <WorldMap />
              </div>
            </Card>
          </div>

          {/* Right Control Panel */}
          <div className="col-span-3 space-y-4">
            <Card className="cyber-panel p-4 relative overflow-hidden">
              <div className="absolute -top-3 left-4 bg-cyber-dark border border-cyber-blue px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-blue">SYS.CONTROL</span>
              </div>

              <div className="mt-4 space-y-4">
                {systemMetrics.map((metric, index) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-cyber-blue">{metric.name}</span>
                      <span className="text-cyber-yellow">{metric.value}{metric.unit}</span>
                    </div>
                    
                    <div className="relative h-6 bg-cyber-black border border-cyber-blue/30">
                      <div 
                        className="h-full bg-gradient-to-r from-cyber-yellow to-cyber-blue transition-all duration-1000"
                        style={{ width: `${(metric.value / metric.max) * 100}%` }}
                      />
                      
                      <div 
                        className="absolute top-0 w-1 h-6 bg-cyber-yellow shadow-lg shadow-cyber-yellow/50"
                        style={{ left: `${(metric.value / metric.max) * 100}%` }}
                      />
                      
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 w-px h-6 bg-cyber-blue/50"
                          style={{ left: `${(i * 25)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="cyber-panel p-4 relative overflow-hidden">
              <div className="absolute -top-3 left-4 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-yellow">HEALTH.MON</span>
              </div>

              <div className="flex items-center justify-center mt-4">
                <CircularRing value={89} max={100} size={120}>
                  <div className="text-center">
                    <div className="text-xl font-cyber text-cyber-yellow">89%</div>
                    <div className="text-xs text-cyber-blue">HEALTH</div>
                  </div>
                </CircularRing>
              </div>
            </Card>

            <Card className="cyber-panel p-4 relative overflow-hidden">
              <div className="absolute -top-3 left-4 bg-cyber-dark border border-cyber-blue px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-blue">NET.STATUS</span>
              </div>

              <div className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue">UPTIME</span>
                  <span className="text-cyber-yellow">99.97%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue">PEERS</span>
                  <span className="text-cyber-yellow">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue">BLOCKS</span>
                  <span className="text-cyber-yellow">1,234,567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue">TXN/S</span>
                  <span className="text-cyber-yellow">2.4K</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 relative">
          <div className="flex justify-between items-center text-xs font-mono text-cyber-blue/70">
            <span>TIMESTAMP: 2087.12.19.14:32:07</span>
            <span>SECTOR: METAL.NET.CORE</span>
            <span>GRID.REF: 0xFF4A2B</span>
          </div>
          
          <div className="absolute -top-2 left-0 w-8 h-1 bg-cyber-yellow opacity-60" />
          <div className="absolute -top-2 right-0 w-8 h-1 bg-cyber-blue opacity-60" />
          <div className="absolute -top-1 left-12 w-4 h-px bg-cyber-yellow opacity-40" />
          <div className="absolute -top-1 right-12 w-4 h-px bg-cyber-blue opacity-40" />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
