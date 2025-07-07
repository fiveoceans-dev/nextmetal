import { Card } from '@/components/ui/card';
import { useState } from 'react';

const RoadmapSection = () => {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const roadmapData = [
    {
      phase: 'PHASE.01',
      title: 'FOUNDATION',
      status: 'COMPLETE',
      items: [
        'Security Audit & Testing',
        'Community Building'
      ]
    },
    {
      phase: 'PHASE.02', 
      title: 'EXPANSION',
      status: 'ACTIVE',
      items: [
        'DEX Listing & Liquidity',
        'Marketing Campaign',
        'Partnership Network',
        'Staking Platform'
      ]
    },
    {
      phase: 'PHASE.03',
      title: 'INTEGRATION',
      status: 'FUTURE',
      items: [
        'CEX Listings',
        'Mobile App Development',
        'Cross-chain Bridge',
        'NFT Marketplace'
      ]
    },
    {
      phase: 'PHASE.04',
      title: 'ECOSYSTEM',
      status: 'FUTURE',
      items: [
        'DAO Governance',
        'Metal Processing DeFi',
        'Industrial Partnerships',
        'Global Expansion'
      ]
    },
    {
      phase: 'PHASE.05',
      title: 'EVOLUTION',
      status: 'FUTURE',
      items: [
        'AI Integration',
        'Quantum Mining',
        'Interstellar Commerce',
        'Multiverse Protocol'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'text-cyber-blue';
      case 'ACTIVE': return 'text-cyber-yellow';
      case 'PENDING': return 'text-cyber-blue/70';
      default: return 'text-cyber-blue/50';
    }
  };

  const TimelinePoints = () => (
    <div className="relative w-full h-32 mb-12 flex justify-center items-center">
      <div className="flex items-center justify-between w-full max-w-4xl relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-yellow via-cyber-blue to-cyber-yellow opacity-30" />
        
        {roadmapData.map((milestone, index) => {
          const isActive = index <= 1;
          const isHovered = hoveredPhase === index;
          const isSelected = selectedPhase === index;
          
          return (
            <div 
              key={index}
              className="relative flex flex-col items-center cursor-pointer z-10"
              onClick={() => setSelectedPhase(selectedPhase === index ? null : index)}
              onMouseEnter={() => setHoveredPhase(index)}
              onMouseLeave={() => setHoveredPhase(null)}
            >
              {/* Simple pulsing waves */}
              {isActive && (
                <div className="absolute">
                  <div className="w-12 h-12 rounded-full border border-cyber-yellow opacity-10 animate-pulse absolute -top-3 -left-6" 
                       style={{ animationDelay: '0.1s' }} />
                </div>
              )}
              
              {/* Main phase point */}
              <div className={`
                w-6 h-6 rounded-full transition-all duration-300 relative z-20
                ${isActive 
                  ? 'bg-cyber-yellow border-2 border-cyber-blue shadow-lg shadow-cyber-yellow/50' 
                  : 'bg-cyber-blue/30 border-2 border-cyber-blue/50'
                }
                ${(isHovered || isSelected) ? 'scale-125' : 'scale-100'}
              `}>
                <div className={`
                  w-2 h-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  ${isActive ? 'bg-cyber-blue animate-pulse' : 'bg-cyber-blue/50'}
                `} />
              </div>
              
              {/* Phase label */}
              <span className="text-xs font-mono text-cyber-blue mt-2 text-center">
                {milestone.phase}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-cyber text-cyber-yellow text-center mb-12 glitch-text tracking-widest" data-text="METAL.ROADMAP">
          METAL.ROADMAP
        </h2>

        <TimelinePoints />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {roadmapData.map((phase, index) => (
            <Card 
              key={phase.phase} 
              className={`cyber-panel cyber-border p-6 relative overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedPhase === index ? 'ring-2 ring-cyber-yellow scale-105' : 'hover:ring ring-cyan-400/20'
              }`}
              onClick={() => setSelectedPhase(selectedPhase === index ? null : index)}
              onMouseEnter={() => setHoveredPhase(index)}
              onMouseLeave={() => setHoveredPhase(null)}
            >
              
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-yellow">{phase.phase}</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-center mb-3">
                  <h3 className="text-cyber-yellow font-cyber text-lg tracking-widest">{phase.title}</h3>
                </div>
                
                <div className={`text-sm font-mono mb-4 text-center ${getStatusColor(phase.status)}`}>
                  STATUS: {phase.status}
                </div>

                <div className={`space-y-3 transition-all duration-300 ${
                  selectedPhase === index ? 'max-h-96 opacity-100' : 'max-h-32 opacity-75'
                }`}>
                  {phase.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 mt-2 bg-cyber-yellow"
                           style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
                      <span className="text-cyber-yellow0 text-sm font-mono leading-relaxed">{item}</span>
                    </div>
                  ))}
                  
                  {selectedPhase === index && (
                    <div className="mt-4 p-3 bg-cyber-dark/50 border border-cyber-blue/30 rounded animate-fadeIn">
                      <div className="text-xs font-mono text-cyber-yellow">
                        PHASE.DETAILS: Click timeline node to interact
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-4 right-4 h-px">
                <div className="flex space-x-2">
                  <div className="flex-1 h-px bg-cyber-yellow" />
                </div>
                
              </div>
              
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
